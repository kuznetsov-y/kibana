/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getErrorRenderer, errorRendererFactory } from './error_renderer';
import { getDebugRenderer, debugRendererFactory } from './debug_renderer';

export const renderers = [getErrorRenderer, getDebugRenderer];
export const rendererFactories = [errorRendererFactory, debugRendererFactory];

export { errorRendererFactory, getErrorRenderer, debugRendererFactory, getDebugRenderer };
