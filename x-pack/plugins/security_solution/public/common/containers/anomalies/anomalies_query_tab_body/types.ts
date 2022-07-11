/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ESTermQuery } from '../../../../../common/typed_json';
import type { NarrowDateRange } from '../../../components/ml/types';
import type { UpdateDateRange } from '../../../components/charts/common';
import type { GlobalTimeArgs } from '../../use_global_time';
import type { HostsType } from '../../../../hosts/store/model';
import type { NetworkType } from '../../../../network/store/model';
import type { FlowTargetSourceDest } from '../../../../../common/search_strategy';
import type { UsersType } from '../../../../users/store/model';

interface QueryTabBodyProps {
  type: HostsType | NetworkType | UsersType;
  filterQuery?: string | ESTermQuery;
}

export type AnomaliesQueryTabBodyProps = QueryTabBodyProps & {
  anomaliesFilterQuery?: object;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AnomaliesTableComponent: React.NamedExoticComponent<any>;
  deleteQuery?: ({ id }: { id: string }) => void;
  endDate: GlobalTimeArgs['to'];
  flowTarget?: FlowTargetSourceDest;
  indexNames: string[];
  narrowDateRange: NarrowDateRange;
  setQuery: GlobalTimeArgs['setQuery'];
  startDate: GlobalTimeArgs['from'];
  skip: boolean;
  updateDateRange?: UpdateDateRange;
  hideHistogramIfEmpty?: boolean;
  ip?: string;
  hostName?: string;
  userName?: string;
};
