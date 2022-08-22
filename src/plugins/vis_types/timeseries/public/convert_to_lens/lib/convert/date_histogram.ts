/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { DataView } from '@kbn/data-views-plugin/common';
import uuid from 'uuid';
import { DateHistogramParams, DataType } from '@kbn/visualizations-plugin/common/convert_to_lens';
import { DateHistogramColumn } from './types';
import type { Panel, Series } from '../../../../common/types';

export const convertToDateHistogramParams = (model: Panel, series: Series): DateHistogramParams => {
  return {
    interval: model.interval && !model.interval?.includes('=') ? model.interval : 'auto',
    dropPartials: series.override_index_pattern
      ? series.series_drop_last_bucket > 0
      : model.drop_last_bucket > 0,
    includeEmptyRows: true,
  };
};

export const convertToDateHistogramColumn = (
  model: Panel,
  series: Series,
  dataView: DataView,
  fieldName: string,
  isSplit: boolean
): DateHistogramColumn | null => {
  const params = convertToDateHistogramParams(model, series);

  const dateField = dataView.getFieldByName(fieldName);

  if (!dateField) {
    return null;
  }

  return {
    columnId: uuid(),
    operationType: 'date_histogram',
    dataType: dateField.type as DataType,
    isBucketed: true,
    isSplit,
    sourceField: dateField.name,
    params,
  };
};
