/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State, FilterField, PositionedElement } from '../../../types';
import { extractGroupsFromElementsFilters, groupFiltersBy } from '../../lib/filter';
import { setGroupFiltersByOption } from '../../state/actions/sidebar';
import { getGroupFiltersByOption } from '../../state/selectors/sidebar';
import { useCanvasFilters } from '../hooks/sidebar/use_canvas_filters';
import { WorkpadFilters as Component } from './workpad_filters.component';

const DEFAULT_GROUP_BY: FilterField = 'filterGroup';

interface Props {
  element?: PositionedElement | null;
}

export const WorkpadFilters: FC<Props> = ({ element }) => {
  const groupFiltersByField: FilterField | undefined = useSelector((state: State) =>
    getGroupFiltersByOption(state)
  );
  const dispatch = useDispatch();

  const onGroupByChange = useCallback(
    (groupByOption: FilterField) => {
      dispatch(setGroupFiltersByOption(groupByOption));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!groupFiltersByField) {
      onGroupByChange(DEFAULT_GROUP_BY);
    }
  }, [groupFiltersByField, onGroupByChange]);

  const groups = element ? extractGroupsFromElementsFilters(element.expression) : undefined;

  const canvasFilters = useCanvasFilters(groups);
  const filtersGroups = groupFiltersByField
    ? groupFiltersBy(canvasFilters, groupFiltersByField)
    : [];

  return (
    <Component
      filtersGroups={filtersGroups}
      onGroupByChange={onGroupByChange}
      groupFiltersByField={groupFiltersByField}
    />
  );
};
