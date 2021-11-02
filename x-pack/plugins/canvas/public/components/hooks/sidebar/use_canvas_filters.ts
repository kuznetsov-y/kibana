/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { fromExpression } from '@kbn/interpreter/common';
import { shallowEqual, useSelector } from 'react-redux';
import { State } from '../../../../types';
import { getFiltersByGroup } from '../../../lib/filter';
import { adaptCanvasFilter } from '../../../lib/filter_adapters';
import { getGlobalFilters } from '../../../state/selectors/workpad';

const extractExpressionAST = (filtersExpressions: string[]) =>
  fromExpression(filtersExpressions.join(' | '));

export function useCanvasFilters(groups?: string[]) {
  const filterExpressions = useSelector((state: State) => getGlobalFilters(state), shallowEqual);
  const filtersByGroups = groups?.length
    ? getFiltersByGroup(filterExpressions, groups)
    : filterExpressions;

  const expression = extractExpressionAST(filtersByGroups);
  const filters = expression.chain.map(adaptCanvasFilter);

  return filters;
}
