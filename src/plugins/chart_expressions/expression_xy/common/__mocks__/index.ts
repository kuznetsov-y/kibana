/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position } from '@elastic/charts';
import { PaletteOutput } from 'src/plugins/charts/common';
import { Datatable, DatatableRow } from 'src/plugins/expressions';
import { LayerTypes } from '../constants';
import { DataLayerConfigResult, LensMultiTable, XYArgs } from '../types';

export const mockPaletteOutput: PaletteOutput = {
  type: 'palette',
  name: 'mock',
  params: {},
};

export const createSampleDatatableWithRows = (rows: DatatableRow[]): Datatable => ({
  type: 'datatable',
  columns: [
    {
      id: 'a',
      name: 'a',
      meta: { type: 'number', params: { id: 'number', params: { pattern: '0,0.000' } } },
    },
    {
      id: 'b',
      name: 'b',
      meta: { type: 'number', params: { id: 'number', params: { pattern: '000,0' } } },
    },
    {
      id: 'c',
      name: 'c',
      meta: {
        type: 'date',
        field: 'order_date',
        sourceParams: { type: 'date-histogram', params: { interval: 'auto' } },
        params: { id: 'string' },
      },
    },
    { id: 'd', name: 'ColD', meta: { type: 'string' } },
  ],
  rows,
});

export const sampleLayer: DataLayerConfigResult = {
  type: 'lens_xy_data_layer',
  layerId: 'first',
  layerType: LayerTypes.DATA,
  seriesType: 'line',
  xAccessor: 'c',
  accessors: ['a', 'b'],
  splitAccessor: 'd',
  columnToLabel: '{"a": "Label A", "b": "Label B", "d": "Label D"}',
  xScaleType: 'ordinal',
  yScaleType: 'linear',
  isHistogram: false,
  palette: mockPaletteOutput,
};

export const createArgsWithLayers = (layers: DataLayerConfigResult[] = [sampleLayer]): XYArgs => ({
  xTitle: '',
  yTitle: '',
  yRightTitle: '',
  legend: {
    type: 'lens_xy_legendConfig',
    isVisible: false,
    position: Position.Top,
  },
  valueLabels: 'hide',
  valuesInLegend: false,
  axisTitlesVisibilitySettings: {
    type: 'lens_xy_axisTitlesVisibilityConfig',
    x: true,
    yLeft: true,
    yRight: true,
  },
  tickLabelsVisibilitySettings: {
    type: 'lens_xy_tickLabelsConfig',
    x: true,
    yLeft: false,
    yRight: false,
  },
  labelsOrientation: {
    type: 'lens_xy_labelsOrientationConfig',
    x: 0,
    yLeft: -90,
    yRight: -45,
  },
  gridlinesVisibilitySettings: {
    type: 'lens_xy_gridlinesConfig',
    x: true,
    yLeft: false,
    yRight: false,
  },
  yLeftExtent: {
    mode: 'full',
    type: 'lens_xy_axisExtentConfig',
  },
  yRightExtent: {
    mode: 'full',
    type: 'lens_xy_axisExtentConfig',
  },
  layers,
});

export function sampleArgs() {
  const data: LensMultiTable = {
    type: 'lens_multitable',
    tables: {
      first: createSampleDatatableWithRows([
        { a: 1, b: 2, c: 'I', d: 'Foo' },
        { a: 1, b: 5, c: 'J', d: 'Bar' },
      ]),
    },
    dateRange: {
      fromDate: new Date('2019-01-02T05:00:00.000Z'),
      toDate: new Date('2019-01-03T05:00:00.000Z'),
    },
  };

  const args: XYArgs = createArgsWithLayers();

  return { data, args };
}
