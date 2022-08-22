/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Position } from '@elastic/charts';
import {
  Layer,
  NavigateToLensContext,
  XYConfiguration,
} from '@kbn/visualizations-plugin/common/convert_to_lens';
import uuid from 'uuid';
import { Panel } from '../../../common/types';
import { getDataViewsStart } from '../../services';
import { getDataSourceInfo } from '../lib/datasource';
import { getMetricsColumns, getFiltersOrTermColumns } from '../lib/series';
import { getLayers, getYExtents } from '../lib/configurations/xy';
import { Layer as ExtendedLayer, ColumnWithMeta, Column } from '../lib/convert';

const isColumnWithMeta = (column: Column): column is ColumnWithMeta => {
  if ((column as ColumnWithMeta).meta) {
    return true;
  }
  return false;
};

const excludeMetaFromLayers = (layers: Record<string, ExtendedLayer>): Record<string, Layer> => {
  const newLayers: Record<string, Layer> = {};
  Object.entries(layers).forEach(([layerId, layer]) => {
    const columns = layer.columns.map((column) => {
      if (isColumnWithMeta(column)) {
        const { meta, ...rest } = column;
        return rest;
      }
      return column;
    });

    newLayers[layerId] = { ...layer, columns };
  });

  return newLayers;
};

export const convertToLens = async (
  model: Panel
): Promise<NavigateToLensContext<XYConfiguration> | null> => {
  const dataViews = getDataViewsStart();
  const extendedLayers: Record<number, ExtendedLayer> = {};
  const seriesNum = model.series.filter((series) => !series.hidden).length;

  // handle multiple layers/series
  for (const [layerIdx, series] of model.series.entries()) {
    if (series.hidden) {
      continue;
    }

    const { indexPatternId, indexPattern } = await getDataSourceInfo(
      model.index_pattern,
      model.time_field,
      Boolean(series.override_index_pattern),
      series.series_index_pattern,
      dataViews
    );

    // handle multiple metrics
    const metricsColumns = getMetricsColumns(series, indexPattern!, seriesNum);
    if (!metricsColumns) {
      return null;
    }

    const filtersOrTermColumns = getFiltersOrTermColumns(series);
    if (filtersOrTermColumns === null) {
      return null;
    }

    const layerId = uuid();
    extendedLayers[layerIdx] = {
      indexPatternId,
      layerId,
      columns: [...metricsColumns, ...filtersOrTermColumns],
      columnOrder: [],
    }; // TODO: update later.
  }

  const extents = getYExtents(model);

  return {
    type: 'lnsXY',
    layers: excludeMetaFromLayers(extendedLayers),
    configuration: {
      layers: getLayers(extendedLayers, model),
      fillOpacity: Number(model.series[0].fill) ?? 0.3,
      legend: {
        isVisible: Boolean(model.show_legend),
        showSingleSeries: Boolean(model.show_legend),
        position: (model.legend_position as Position) ?? Position.Right,
        shouldTruncate: Boolean(model.truncate_legend),
        maxLines: model.max_lines_legend ?? 1,
      },
      gridlinesVisibilitySettings: {
        x: Boolean(model.show_grid),
        yLeft: Boolean(model.show_grid),
        yRight: Boolean(model.show_grid),
      },
      yLeftExtent: extents.yLeftExtent,
      yRightExtent: extents.yRightExtent,
    },
  };
};
