/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import ReactDOM from 'react-dom';
import React from 'react';
import { UI_SETTINGS } from '../../../../../../../src/plugins/data/public';
import { RendererStrings } from '../../../../i18n';
import { TimeFilter } from './components';
import { StartInitializer } from '../../../plugin';
import { RendererHandlers } from '../../../../types';
import { Arguments } from '../../../functions/common/timefilterControl';
import { RendererFactory } from '../../../../types';

const { timeFilter: strings } = RendererStrings;

const defaultTimeFilterExpression = 'timefilter column=@timestamp from=now-24h to=now';

export const timeFilterFactory: StartInitializer<RendererFactory<Arguments>> = (core, plugins) => {
  const { uiSettings } = core;

  const customQuickRanges = (uiSettings.get(UI_SETTINGS.TIMEPICKER_QUICK_RANGES) || []).map(
    ({ from, to, display }: { from: string; to: string; display: string }) => ({
      start: from,
      end: to,
      label: display,
    })
  );

  const customDateFormat = uiSettings.get('dateFormat');

  return () => ({
    name: 'time_filter',
    displayName: strings.getDisplayName(),
    help: strings.getHelpDescription(),
    reuseDomNode: true, // must be true, otherwise popovers don't work
    render: async (domNode: HTMLElement, config: Arguments, handlers: RendererHandlers) => {
      let filterExpression = handlers.getFilter();

      if (filterExpression === undefined || filterExpression.indexOf('timefilter') !== 0) {
        filterExpression = defaultTimeFilterExpression;
        handlers.setFilter(filterExpression);
      }

      ReactDOM.render(
        <TimeFilter
          commit={handlers.setFilter}
          filter={filterExpression}
          commonlyUsedRanges={customQuickRanges}
          dateFormat={customDateFormat}
        />,
        domNode,
        () => handlers.done()
      );

      handlers.onDestroy(() => {
        ReactDOM.unmountComponentAtNode(domNode);
      });
    },
  });
};
