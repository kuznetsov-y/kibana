/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { storiesOf } from '@storybook/react';
import React from 'react';
import moment from 'moment';
import { FiltersGroup } from '../filters_group';
import { FiltersGroup as FiltersGroupType } from '../types';
import { FilterViewSpec, filterViewsRegistry } from '../../../filter_view_types';
import { filterViewsSpecs } from '../../../../canvas_plugin_src/canvas_addons';

filterViewsSpecs.forEach((filterView) =>
  filterViewsRegistry.register(() => filterView as FilterViewSpec<any>)
);

const filtersGroup: FiltersGroupType = {
  name: 'Group 1',
  filters: [
    { type: 'exactly', column: 'project', value: 'kibana', filterGroup: 'Group 1' },
    {
      type: 'time',
      column: '@timestamp',
      value: { from: moment('1.01.2021 8:15').format(), to: moment('2.01.2021 17:22').format() },
      filterGroup: 'Group 1',
    },
    { type: 'exactly', column: 'country', value: 'US', filterGroup: 'Group 1' },
    {
      type: 'time',
      column: 'time',
      value: { from: moment('05.21.2021 10:50').format(), to: moment('05.22.2021 4:40').format() },
      filterGroup: 'Group 1',
    },
  ],
};

storiesOf('components/WorkpadFilters/FiltersGroup', module)
  .addDecorator((story) => <div className="canvasLayout__sidebar">{story()}</div>)
  .add('default', () => <FiltersGroup filtersGroup={filtersGroup} />)
  .add('group name is empty', () => (
    <FiltersGroup
      filtersGroup={{ name: null, filters: [{ ...filtersGroup.filters[0], column: null }] }}
    />
  ))
  .add('empty group', () => <FiltersGroup filtersGroup={{ name: 'Group 1', filters: [] }} />);
