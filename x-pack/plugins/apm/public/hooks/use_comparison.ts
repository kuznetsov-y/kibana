/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  getComparisonChartTheme,
  getTimeRangeComparison,
} from '../components/shared/time_comparison/get_time_range_comparison';
import { useUrlParams } from '../context/url_params_context/use_url_params';
import { useTheme } from './use_theme';
import { useTimeRange } from './use_time_range';

export function useComparison() {
  const theme = useTheme();

  const comparisonChartTheme = getComparisonChartTheme(theme);
  const { start, end } = useTimeRange();

  const {
    urlParams: { comparisonType, comparisonEnabled },
  } = useUrlParams();

  const { offset } = getTimeRangeComparison({
    start,
    end,
    comparisonType,
    comparisonEnabled,
  });

  return {
    offset,
    comparisonChartTheme,
  };
}
