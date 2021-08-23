/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { range } from 'lodash';
import type { ElasticsearchClient } from 'src/core/server';
import type {
  SearchServiceParams,
  SearchServiceFetchParams,
} from '../../../../common/search_strategies/correlations/types';
import type { ApmIndicesConfig } from '../../settings/apm_indices/get_apm_indices';
import {
  fetchTransactionDurationFieldCandidates,
  fetchTransactionDurationFieldValuePairs,
  fetchTransactionDurationFractions,
  fetchTransactionDurationPercentiles,
  fetchTransactionDurationHistograms,
  fetchTransactionDurationHistogramRangeSteps,
  fetchTransactionDurationRanges,
} from './queries';
import { computeExpectationsAndRanges } from './utils';
import { asyncSearchServiceLogProvider } from './async_search_service_log';
import { asyncSearchServiceStateProvider } from './async_search_service_state';

export const asyncSearchServiceProvider = (
  esClient: ElasticsearchClient,
  getApmIndices: () => Promise<ApmIndicesConfig>,
  searchServiceParams: SearchServiceParams,
  includeFrozen: boolean
) => {
  const { addLogMessage, getLogMessages } = asyncSearchServiceLogProvider();

  const state = asyncSearchServiceStateProvider();

  async function fetchCorrelations() {
    let params: SearchServiceFetchParams | undefined;

    try {
      const indices = await getApmIndices();
      params = {
        ...searchServiceParams,
        index: indices['apm_oss.transactionIndices'],
        includeFrozen,
      };

      // 95th percentile to be displayed as a marker in the log log chart
      const {
        totalDocs,
        percentiles: percentilesResponseThresholds,
      } = await fetchTransactionDurationPercentiles(
        esClient,
        params,
        params.percentileThreshold ? [params.percentileThreshold] : undefined
      );
      const percentileThresholdValue =
        percentilesResponseThresholds[`${params.percentileThreshold}.0`];
      state.setPercentileThresholdValue(percentileThresholdValue);

      addLogMessage(
        `Fetched ${params.percentileThreshold}th percentile value of ${percentileThresholdValue} based on ${totalDocs} documents.`
      );

      // finish early if we weren't able to identify the percentileThresholdValue.
      if (percentileThresholdValue === undefined) {
        addLogMessage(
          `Abort service since percentileThresholdValue could not be determined.`
        );
        state.setProgress({
          loadedHistogramStepsize: 1,
          loadedOverallHistogram: 1,
          loadedFieldCanditates: 1,
          loadedFieldValuePairs: 1,
          loadedHistograms: 1,
        });
        state.setIsRunning(false);
        return;
      }

      const histogramRangeSteps = await fetchTransactionDurationHistogramRangeSteps(
        esClient,
        params
      );
      state.setProgress({ loadedHistogramStepsize: 1 });

      addLogMessage(`Loaded histogram range steps.`);

      if (state.getIsCancelled()) {
        state.setIsRunning(false);
        return;
      }

      const overallLogHistogramChartData = await fetchTransactionDurationRanges(
        esClient,
        params,
        histogramRangeSteps
      );
      state.setProgress({ loadedOverallHistogram: 1 });
      state.setOverallHistogram(overallLogHistogramChartData);

      addLogMessage(`Loaded overall histogram chart data.`);

      if (state.getIsCancelled()) {
        state.setIsRunning(false);
        return;
      }

      // finish early if correlation analysis is not required.
      if (params.analyzeCorrelations === false) {
        addLogMessage(
          `Finish service since correlation analysis wasn't requested.`
        );
        state.setProgress({
          loadedHistogramStepsize: 1,
          loadedOverallHistogram: 1,
          loadedFieldCanditates: 1,
          loadedFieldValuePairs: 1,
          loadedHistograms: 1,
        });
        state.setIsRunning(false);
        return;
      }

      // Create an array of ranges [2, 4, 6, ..., 98]
      const percentileAggregationPercents = range(2, 100, 2);
      const {
        percentiles: percentilesRecords,
      } = await fetchTransactionDurationPercentiles(
        esClient,
        params,
        percentileAggregationPercents
      );
      const percentiles = Object.values(percentilesRecords);

      addLogMessage(`Loaded percentiles.`);

      if (state.getIsCancelled()) {
        state.setIsRunning(false);
        return;
      }

      const { fieldCandidates } = await fetchTransactionDurationFieldCandidates(
        esClient,
        params
      );

      addLogMessage(`Identified ${fieldCandidates.length} fieldCandidates.`);

      state.setProgress({ loadedFieldCanditates: 1 });

      const fieldValuePairs = await fetchTransactionDurationFieldValuePairs(
        esClient,
        params,
        fieldCandidates,
        state,
        addLogMessage
      );

      addLogMessage(`Identified ${fieldValuePairs.length} fieldValuePairs.`);

      if (state.getIsCancelled()) {
        state.setIsRunning(false);
        return;
      }

      const { expectations, ranges } = computeExpectationsAndRanges(
        percentiles
      );

      const {
        fractions,
        totalDocCount,
      } = await fetchTransactionDurationFractions(esClient, params, ranges);

      addLogMessage(`Loaded fractions and totalDocCount of ${totalDocCount}.`);

      let loadedHistograms = 0;
      for await (const item of fetchTransactionDurationHistograms(
        esClient,
        addLogMessage,
        params,
        state,
        expectations,
        ranges,
        fractions,
        histogramRangeSteps,
        totalDocCount,
        fieldValuePairs
      )) {
        if (item !== undefined) {
          state.addValue(item);
        }
        loadedHistograms++;
        state.setProgress({
          loadedHistograms: loadedHistograms / fieldValuePairs.length,
        });
      }

      addLogMessage(
        `Identified ${
          state.getState().values.length
        } significant correlations out of ${
          fieldValuePairs.length
        } field/value pairs.`
      );
    } catch (e) {
      state.setError(e);
    }

    if (state.getState().error !== undefined && params?.index.includes(':')) {
      state.setCcsWarning(true);
    }

    state.setIsRunning(false);
  }

  fetchCorrelations();

  return () => {
    const {
      ccsWarning,
      error,
      isRunning,
      overallHistogram,
      percentileThresholdValue,
      progress,
    } = state.getState();

    return {
      ccsWarning,
      error,
      log: getLogMessages(),
      isRunning,
      loaded: Math.round(state.getOverallProgress() * 100),
      overallHistogram,
      started: progress.started,
      total: 100,
      values: state.getValuesSortedByCorrelation(),
      percentileThresholdValue,
      cancel: () => {
        addLogMessage(`Service cancelled.`);
        state.setIsCancelled(true);
      },
    };
  };
};
