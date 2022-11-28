/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import type { Filter, BooleanRelation } from '@kbn/es-query';
import { EuiTextColor, useEuiTheme } from '@elastic/eui';
import type { DataView } from '@kbn/data-views-plugin/common';
import { FilterBadgeErrorBoundary } from './filter_badge_error_boundary';
import { FilterExpressionBadge } from './filter_badge_expression';
import { conditionCss } from './filter_badge.styles';

export interface FilterBadgeGroupProps {
  filters: Filter[];
  dataViews: DataView[];
  filterLabelStatus?: string;
  shouldShowBrackets?: boolean;
  booleanRelation?: BooleanRelation;
}

const BooleanRelationDelimiter = ({ conditional }: { conditional: BooleanRelation }) => {
  const { euiTheme } = useEuiTheme();
  /**
   *  Spaces have been added to make the title readable.
   *  To eliminate the extra paddings of the text around it, margin-inline with a negative value was added.
   */
  return <EuiTextColor className={conditionCss(euiTheme)}>{` ${conditional} `}</EuiTextColor>;
};

export function FilterBadgeGroup({
  filters,
  dataViews,
  filterLabelStatus,
  booleanRelation,
  shouldShowBrackets = true,
}: FilterBadgeGroupProps) {
  return (
    <FilterBadgeErrorBoundary>
      {filters.map((filter, index, filterArr) => {
        const showRelationDelimiter = booleanRelation && index + 1 < filterArr.length;
        const showBrackets = shouldShowBrackets && (filter.meta.negate || filterArr.length > 1);
        return (
          <>
            <FilterExpressionBadge
              filter={filter}
              shouldShowBrackets={showBrackets}
              dataViews={dataViews}
              filterLabelStatus={filterLabelStatus}
            />
            {showRelationDelimiter && <BooleanRelationDelimiter conditional={booleanRelation} />}
          </>
        );
      })}
    </FilterBadgeErrorBoundary>
  );
}

// Needed for React.lazy
// eslint-disable-next-line import/no-default-export
export default FilterBadgeGroup;
