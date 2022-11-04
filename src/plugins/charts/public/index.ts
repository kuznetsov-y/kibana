/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RangeSelectContext, ValueClickContext } from '@kbn/embeddable-plugin/public';
import { ChartsPlugin } from './plugin';

export const plugin = () => new ChartsPlugin();

export type { ChartsPluginSetup, ChartsPluginStart } from './plugin';

export { useActiveCursor } from './services/active_cursor';

export interface ClickTriggerEvent {
  name: 'filter';
  data: ValueClickContext['data'];
}

export interface BrushTriggerEvent {
  name: 'brush';
  data: RangeSelectContext['data'];
}

export type { CustomPaletteArguments, CustomPaletteState, SystemPaletteArguments } from '../common';
export { MULTILAYER_TIME_AXIS_STYLE } from '../common/styles';
