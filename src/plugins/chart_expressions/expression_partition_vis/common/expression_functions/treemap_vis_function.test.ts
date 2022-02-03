/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { functionWrapper } from '../../../../expressions/common/expression_functions/specs/tests/utils';
import {
  TreemapVisConfig,
  LabelPositions,
  ValueFormats,
  LegendDisplay,
} from '../types/expression_renderers';
import { treemapVisFunction } from './treemap_vis_function';
import { Datatable } from '../../../../expressions/common/expression_types/specs';
import { PARTITION_LABELS_VALUE } from '../constants';

describe('interpreter/functions#treemapVis', () => {
  const fn = functionWrapper(treemapVisFunction());
  const context: Datatable = {
    type: 'datatable',
    rows: [{ 'col-0-1': 0, 'col-0-2': 0, 'col-0-3': 0, 'col-0-4': 0 }],
    columns: [
      { id: 'col-0-1', name: 'Field 1', meta: { type: 'number' } },
      { id: 'col-0-2', name: 'Field 2', meta: { type: 'number' } },
      { id: 'col-0-3', name: 'Field 3', meta: { type: 'number' } },
      { id: 'col-0-4', name: 'Field 4', meta: { type: 'number' } },
    ],
  };

  const visConfig: TreemapVisConfig = {
    addTooltip: true,
    legendDisplay: LegendDisplay.SHOW,
    legendPosition: 'right',
    nestedLegend: true,
    truncateLegend: true,
    maxLegendLines: 2,
    palette: {
      type: 'system_palette',
      name: 'kibana_palette',
    },
    labels: {
      type: PARTITION_LABELS_VALUE,
      show: false,
      values: true,
      position: LabelPositions.DEFAULT,
      valuesFormat: ValueFormats.PERCENT,
      percentDecimals: 2,
      truncate: 100,
      lastLevel: false,
    },
    metric: {
      type: 'vis_dimension',
      accessor: 0,
      format: {
        id: 'number',
        params: {},
      },
    },
    buckets: [
      {
        type: 'vis_dimension',
        accessor: 1,
        format: {
          id: 'number',
          params: {},
        },
      },
      {
        type: 'vis_dimension',
        accessor: 2,
        format: {
          id: 'number',
          params: {},
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an object with the correct structure', async () => {
    const actual = await fn(context, visConfig);
    expect(actual).toMatchSnapshot();
  });

  it('throws error if provided more than 2 buckets', async () => {
    expect(() =>
      fn(context, {
        ...visConfig,
        buckets: [
          ...(visConfig.buckets ?? []),
          {
            type: 'vis_dimension',
            accessor: 3,
            format: {
              id: 'number',
              params: {},
            },
          },
        ],
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('throws error if provided not valid legend position', async () => {
    expect(() =>
      fn(context, {
        ...visConfig,
        legendPosition: 'some not valid position',
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('logs correct datatable to inspector', async () => {
    let loggedTable: Datatable;
    const handlers = {
      inspectorAdapters: {
        tables: {
          logDatatable: (name: string, datatable: Datatable) => {
            loggedTable = datatable;
          },
        },
      },
    };
    await fn(context, visConfig, handlers as any);

    expect(loggedTable!).toMatchSnapshot();
  });
});
