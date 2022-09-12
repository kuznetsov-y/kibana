/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  AggParamsMapping,
  AggParamsTerms,
  BUCKET_TYPES,
  IAggConfig,
} from '@kbn/data-plugin/common';
import type { DataView } from '@kbn/data-views-plugin/common';
import { Column, SchemaConfig } from '../../..';
import {
  convertToDateHistogramColumn,
  convertToFiltersColumn,
  convertToTermsColumn,
} from '../convert';
import { getFieldNameFromField, getLabel, isSchemaConfig } from '../utils';

export type BucketAggs = BUCKET_TYPES.TERMS | BUCKET_TYPES.DATE_HISTOGRAM | BUCKET_TYPES.FILTERS;
const SUPPORTED_BUCKETS: string[] = [
  BUCKET_TYPES.TERMS,
  BUCKET_TYPES.DATE_HISTOGRAM,
  BUCKET_TYPES.FILTERS,
];

const isSupportedBucketAgg = (agg: SchemaConfig): agg is SchemaConfig<BucketAggs> => {
  return SUPPORTED_BUCKETS.includes(agg.aggType);
};

export const getBucketColumns = (
  aggType: BUCKET_TYPES,
  aggParams: AggParamsMapping[BucketAggs],
  dataView: DataView,
  metricColumns: Column[],
  {
    label,
    isSplit = false,
    dropEmptyRowsInDateHistogram = false,
  }: { label: string; isSplit: boolean; dropEmptyRowsInDateHistogram: boolean }
) => {
  switch (aggType) {
    case BUCKET_TYPES.DATE_HISTOGRAM:
      return convertToDateHistogramColumn(
        aggParams,
        dataView,
        isSplit,
        dropEmptyRowsInDateHistogram
      );
    case BUCKET_TYPES.FILTERS:
      return convertToFiltersColumn(aggParams, isSplit);
    case BUCKET_TYPES.TERMS:
      const fieldName = getFieldNameFromField((aggParams as AggParamsTerms).field);
      if (!fieldName) {
        return null;
      }
      const field = dataView.getFieldByName(fieldName);

      if (!field) {
        return null;
      }
      if (field.type !== 'date') {
        return convertToTermsColumn(
          aggParams as AggParamsTerms,
          label,
          dataView,
          isSplit,
          metricColumns
        );
      } else {
        return convertToDateHistogramColumn(
          {
            field: fieldName,
          },
          dataView,
          isSplit,
          dropEmptyRowsInDateHistogram
        );
      }
  }

  return null;
};

export const convertBucketToColumns = (
  agg: SchemaConfig | IAggConfig,
  dataView: DataView,
  isSplit: boolean = false,
  metricColumns: Column[],
  dropEmptyRowsInDateHistogram: boolean = false
) => {
  if (isSchemaConfig(agg)) {
    if (!agg.aggParams || !isSupportedBucketAgg(agg)) {
      return null;
    }
    return getBucketColumns(agg.aggType, agg.aggParams, dataView, metricColumns, {
      label: getLabel(agg),
      isSplit,
      dropEmptyRowsInDateHistogram,
    });
  } else {
    const isTermsAgg = agg.type.name === 'terms';
    const orderAgg = agg.getParam('orderAgg');
    const aggParams = agg.serialize().params;
    const aggType = agg.type.name as BUCKET_TYPES;
    if (!aggParams || !SUPPORTED_BUCKETS.includes(aggType)) {
      return null;
    }
    return getBucketColumns(
      aggType,
      isTermsAgg ? ({ ...aggParams, orderAgg } as AggParamsTerms) : aggParams,
      dataView,
      metricColumns,
      { label: agg.makeLabel(), isSplit, dropEmptyRowsInDateHistogram }
    );
  }
};
