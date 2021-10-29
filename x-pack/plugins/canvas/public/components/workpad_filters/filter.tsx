/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { FC } from 'react';
import { Filter as FilterType, FormattedFilterViewInstance } from '../../../types';
import { Filter as Component } from './filter.component';

interface Props {
  filter: FormattedFilterViewInstance;
  filters: FilterType[];
}

export const Filter: FC<Props> = (props) => {
  const { updateFilter } = useCanvasFiltersActions();

  return <Component {...props} updateFilter={updateFilter} />;
};
