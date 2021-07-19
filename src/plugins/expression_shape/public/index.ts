/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ExpressionShapePlugin } from './plugin';

export type { ExpressionShapePluginSetup, ExpressionShapePluginStart } from './plugin';

export function plugin() {
  return new ExpressionShapePlugin();
}

export * from './expression_renderers';
export type { ShapeDrawerComponentProps } from './components/types';
export { LazyShapeDrawer } from './components';
export * from '../common/types';
