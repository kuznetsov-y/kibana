/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export const PLUGIN_ID = 'expressionXy';
export const PLUGIN_NAME = 'expressionXy';

export {
  xyChartFunction,
  yAxisConfigFunction,
  legendConfigFunction,
  gridlinesConfigFunction,
  dataLayerConfigFunction,
  axisExtentConfigFunction,
  tickLabelsConfigFunction,
  labelsOrientationConfigFunction,
  referenceLineLayerConfigFunction,
  axisTitlesVisibilityConfigFunction,
} from './expression_functions';

export type {
  XYArgs,
  YConfig,
  XYRender,
  LayerType,
  YAxisMode,
  LineStyle,
  FillStyle,
  SeriesType,
  YScaleType,
  XScaleType,
  AxisConfig,
  ValidLayer,
  XYCurveType,
  XYChartProps,
  LegendConfig,
  IconPosition,
  YConfigResult,
  DataLayerArgs,
  XYLayerConfig,
  LensMultiTable,
  ValueLabelMode,
  AxisExtentMode,
  FittingFunction,
  AxisExtentConfig,
  XYDataLayerConfig,
  LegendConfigResult,
  AxesSettingsConfig,
  GridlinesConfigResult,
  DataLayerConfigResult,
  TickLabelsConfigResult,
  AxisExtentConfigResult,
  ReferenceLineLayerArgs,
  LabelsOrientationConfig,
  XYReferenceLineLayerConfig,
  LabelsOrientationConfigResult,
  ReferenceLineLayerConfigResult,
  AxisTitlesVisibilityConfigResult,
} from './types';
