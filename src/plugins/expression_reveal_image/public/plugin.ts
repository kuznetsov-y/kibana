/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import { i18n } from '@kbn/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../core/public';
import { ExpressionsStart, ExpressionsSetup } from '../../../src/plugins/expressions/public';
import { LEGACY_RENDERER_LIBRARY, PLUGIN_NAME } from '../common';
import { revealImageFunction } from './expression_functions';
import { revealImageRenderer } from './expression_renderers';
import { revealImage as revealImageRendererLegacy } from './expression_renderers_legacy';

interface SetupDeps {
  expressions: ExpressionsSetup;
}

interface StartDeps {
  expression: ExpressionsStart;
}

export class ExpressionRevealImagePlugin implements Plugin<void, void, SetupDeps, StartDeps> {
  public setup(core: CoreSetup, { expressions }: SetupDeps): ExpressionRevealImagePluginSetup {
    expressions.registerFunction(revealImageFunction);

    if (!core.uiSettings.get(LEGACY_RENDERER_LIBRARY, false)) {
      expressions.registerRenderer(revealImageRenderer);
    } else {
      expressions.registerRenderer(revealImageRendererLegacy);
    }
  }

  public start(core: CoreStart): ExpressionRevealImagePluginStart {
    return {};
  }

  public stop() {}
}
