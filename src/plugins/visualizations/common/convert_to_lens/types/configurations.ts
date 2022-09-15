/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { HorizontalAlignment, Position, VerticalAlignment } from '@elastic/charts';
import { $Values } from '@kbn/utility-types';
import type { PaletteOutput } from '@kbn/coloring';
import { LegendSize } from '../../constants';
import {
  CategoryDisplay,
  PartitionChartTypes,
  NumberDisplay,
  LegendDisplay,
  FillTypes,
  SeriesTypes,
  YAxisModes,
  XYCurveTypes,
  LayerTypes,
} from '../constants';

export type FillType = $Values<typeof FillTypes>;
export type SeriesType = $Values<typeof SeriesTypes>;
export type YAxisMode = $Values<typeof YAxisModes>;
export type XYCurveType = $Values<typeof XYCurveTypes>;
export type PartitionChartType = $Values<typeof PartitionChartTypes>;
export type CategoryDisplayType = $Values<typeof CategoryDisplay>;
export type NumberDisplayType = $Values<typeof NumberDisplay>;
export type LegendDisplayType = $Values<typeof LegendDisplay>;
export type LayerType = $Values<typeof LayerTypes>;

export interface AxisExtentConfig {
  mode: 'full' | 'custom' | 'dataBounds';
  lowerBound?: number;
  upperBound?: number;
  enforce?: boolean;
}

export interface YConfig {
  forAccessor: string;
  color?: string;
  icon?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'dot-dashed';
  fill?: FillType;
  iconPosition?: 'auto' | 'left' | 'right' | 'above' | 'below';
  textVisibility?: boolean;
  axisMode?: YAxisMode;
}

export interface XYDataLayerConfig {
  layerId: string;
  accessors: string[];
  layerType: 'data';
  seriesType: SeriesType;
  xAccessor?: string;
  simpleView?: boolean;
  yConfig?: YConfig[];
  splitAccessor?: string;
  palette?: PaletteOutput;
  collapseFn?: string;
  xScaleType?: 'time' | 'linear' | 'ordinal';
  isHistogram?: boolean;
  columnToLabel?: string;
}

export interface XYReferenceLineLayerConfig {
  layerId: string;
  accessors: string[];
  yConfig?: YConfig[];
  layerType: 'referenceLine';
}

export type XYLayerConfig = XYDataLayerConfig | XYReferenceLineLayerConfig;

export interface AxesSettingsConfig {
  x: boolean;
  yRight: boolean;
  yLeft: boolean;
}

export interface LabelsOrientationConfig {
  x: number;
  yLeft: number;
  yRight: number;
}

export interface LegendConfig {
  isVisible: boolean;
  position: Position;
  showSingleSeries?: boolean;
  isInside?: boolean;
  horizontalAlignment?: typeof HorizontalAlignment.Right | typeof HorizontalAlignment.Left;
  verticalAlignment?: typeof VerticalAlignment.Top | typeof VerticalAlignment.Bottom;
  floatingColumns?: number;
  maxLines?: number;
  shouldTruncate?: boolean;
  legendSize?: LegendSize;
}

export interface XYConfiguration {
  preferredSeriesType?: SeriesType;
  legend?: LegendConfig;
  valueLabels?: 'hide' | 'show';
  fittingFunction?: 'None' | 'Zero' | 'Linear' | 'Carry' | 'Lookahead' | 'Average' | 'Nearest';
  emphasizeFitting?: boolean;
  endValue?: 'None' | 'Zero' | 'Nearest';
  xExtent?: AxisExtentConfig;
  yLeftExtent?: AxisExtentConfig;
  yRightExtent?: AxisExtentConfig;
  layers: XYLayerConfig[];
  xTitle?: string;
  yTitle?: string;
  yRightTitle?: string;
  yLeftScale?: 'time' | 'linear' | 'log' | 'sqrt';
  yRightScale?: 'time' | 'linear' | 'log' | 'sqrt';
  axisTitlesVisibilitySettings?: AxesSettingsConfig;
  tickLabelsVisibilitySettings?: AxesSettingsConfig;
  gridlinesVisibilitySettings?: AxesSettingsConfig;
  labelsOrientation?: LabelsOrientationConfig;
  curveType?: XYCurveType;
  fillOpacity?: number;
  hideEndzones?: boolean;
  valuesInLegend?: boolean;
}

export interface SortingState {
  columnId: string | undefined;
  direction: 'asc' | 'desc' | 'none';
}

export interface PagingState {
  size: number;
  enabled: boolean;
}

export interface ColumnState {
  columnId: string;
  summaryRow?: 'none' | 'sum' | 'avg' | 'count' | 'min' | 'max';
  alignment?: 'left' | 'right' | 'center';
  collapseFn?: string;
}

export interface TableVisConfiguration {
  columns: ColumnState[];
  layerId: string;
  layerType: 'data';
  sorting?: SortingState;
  rowHeight?: 'auto' | 'single' | 'custom';
  headerRowHeight?: 'auto' | 'single' | 'custom';
  rowHeightLines?: number;
  headerRowHeightLines?: number;
  paging?: PagingState;
}

export interface PartitionLayerState {
  layerId: string;
  layerType: LayerType;
  primaryGroups: string[];
  secondaryGroups?: string[];
  metric?: string;
  collapseFns?: Record<string, string>;
  numberDisplay: NumberDisplayType;
  categoryDisplay: CategoryDisplayType;
  legendDisplay: LegendDisplayType;
  legendPosition?: Position;
  showValuesInLegend?: boolean;
  nestedLegend?: boolean;
  percentDecimals?: number;
  emptySizeRatio?: number;
  legendMaxLines?: number;
  legendSize?: LegendSize;
  truncateLegend?: boolean;
}

export interface PartitionVisConfiguration {
  shape: PartitionChartType;
  layers: PartitionLayerState[];
  palette?: PaletteOutput;
}

export type Configuration = XYConfiguration | TableVisConfiguration | PartitionVisConfiguration;
