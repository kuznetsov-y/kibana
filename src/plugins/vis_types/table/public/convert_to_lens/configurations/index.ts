/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Column, PagingState, TableVisConfiguration } from '@kbn/visualizations-plugin/common';
import { TableVisParams } from '../../../common';

const getColumns = (params: TableVisParams, metrics: string[], columns: Column[]) => {
  const { showTotal, totalFunc } = params;
  return columns.map(({ columnId }) => ({
    columnId,
    ...(showTotal && metrics.includes(columnId) ? { summaryRow: totalFunc } : {}),
  }));
};

const getPagination = ({ perPage }: TableVisParams): PagingState => {
  return {
    enabled: perPage !== '' ? true : false,
    size: perPage !== '' ? perPage : 0,
  };
};

const getRowHeight = (
  params: TableVisParams
): Pick<TableVisConfiguration, 'rowHeight' | 'headerRowHeight'> => {
  const { autoFitRowToContent } = params;
  return {
    rowHeight: autoFitRowToContent ? 'auto' : 'single',
    headerRowHeight: autoFitRowToContent ? 'auto' : 'single',
  };
};

export const getConfiguration = (
  layerId: string,
  params: TableVisParams,
  { metrics, columns }: { metrics: string[]; columns: Column[] }
): TableVisConfiguration => {
  return {
    layerId,
    layerType: 'data',
    columns: getColumns(params, metrics, columns),
    paging: getPagination(params),
    ...getRowHeight(params),
  };
};
