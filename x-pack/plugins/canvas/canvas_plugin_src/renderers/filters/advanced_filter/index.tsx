/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { KibanaThemeProvider } from '../../../../../../../src/plugins/kibana_react/public';
import { RendererFactory } from '../../../../types';
import { AdvancedFilter } from './component';
import { RendererStrings } from '../../../../i18n';

const { advancedFilter: strings } = RendererStrings;

export const advancedFilterFactory: StartInitializer<RendererFactory<{}>> = (core, plugins) => {
  const { theme } = core;
  return () => ({
    name: 'advanced_filter',
    displayName: strings.getDisplayName(),
    help: strings.getHelpDescription(),
    reuseDomNode: true,
    height: 50,
    render(domNode, _, handlers) {
      ReactDOM.render(
        <KibanaThemeProvider theme$={theme.theme$}>
          <AdvancedFilter commit={handlers.setFilter} value={handlers.getFilter()} />
        </KibanaThemeProvider>,
        domNode,
        () => handlers.done()
      );

      handlers.onDestroy(() => {
        ReactDOM.unmountComponentAtNode(domNode);
      });
    },
  });
};
