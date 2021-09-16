/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { VisTypeXyPlugin as Plugin } from './plugin';

export { VisTypeXyPluginSetup } from './plugin';
export type { ValidationVisOptionsProps } from './editor/components/common/validation_wrapper';
export { TruncateLabelsOption } from './editor/components/common/truncate_labels';
export { getPositions } from './editor/positions';
export { getScaleTypes } from './editor/scale_types';

export function plugin() {
  return new Plugin();
}
