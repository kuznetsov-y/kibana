/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Type of charts able to render
 */
export enum ChartType {
  Line = 'line',
  Area = 'area',
  Histogram = 'histogram',
}

/**
 * Type of xy visualizations
 */
export type XyVisType = ChartType | 'horizontal_bar';

export { getAdjustedInterval } from './utils';
