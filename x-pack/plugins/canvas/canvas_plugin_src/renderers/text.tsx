/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import ReactDOM from 'react-dom';
import React from 'react';
import { KibanaThemeProvider } from '../../../../../src/plugins/kibana_react/public';
import { StartInitializer } from '../plugin';
import { RendererStrings } from '../../i18n';
import { RendererFactory } from '../../types';

const { text: strings } = RendererStrings;

export const textFactory: StartInitializer<RendererFactory<{ text: string }>> =
  (core, plugins) => () => ({
    name: 'text',
    displayName: strings.getDisplayName(),
    help: strings.getHelpDescription(),
    reuseDomNode: true,
    render(domNode, { text: textString }, handlers) {
      ReactDOM.render(
        <KibanaThemeProvider theme$={core.theme.theme$}>
          <div>{textString}</div>
        </KibanaThemeProvider>,
        domNode,
        () => handlers.done()
      );
      handlers.onDestroy(() => ReactDOM.unmountComponentAtNode(domNode));
    },
  });
