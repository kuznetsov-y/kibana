/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BUCKET_TYPES, IAggConfig, METRIC_TYPES } from '@kbn/data-plugin/common';

interface SchemaConfigParams {
  precision?: number;
  useGeocentroid?: boolean;
}

const SUPPORTED_AGGREGATIONS = [...Object.values(METRIC_TYPES), ...Object.values(BUCKET_TYPES)];
type SupportedAggregation = typeof SUPPORTED_AGGREGATIONS[number];

export function convertToSchemaConfig(agg: IAggConfig) {
  const aggType = agg.type.name as SupportedAggregation;
  const hasSubAgg = [
    'derivative',
    'moving_avg',
    'serial_diff',
    'cumulative_sum',
    'sum_bucket',
    'avg_bucket',
    'min_bucket',
    'max_bucket',
  ].includes(aggType);

  const formatAgg = hasSubAgg
    ? agg.params.customMetric || agg.aggConfigs.getRequestAggById(agg.params.metricAgg)
    : agg;

  const params: SchemaConfigParams = {};

  if (aggType === 'geohash_grid') {
    params.precision = agg.params.precision;
    params.useGeocentroid = agg.params.useGeocentroid;
  }

  const label = agg.makeLabel && agg.makeLabel();
  return {
    format: formatAgg.toSerializedFieldFormat(),
    params,
    label,
    aggType,
    aggId: agg.id,
    aggParams: agg.params,
  };
}

export function convertToSchemaConfigWithAccessor(agg: IAggConfig, accessor: number) {
  return {
    accessor,
    ...convertToSchemaConfig(agg),
  };
}
