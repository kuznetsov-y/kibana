/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import moment from 'moment';
import { parseInterval } from '../../../../../src/plugins/data/common';

export function getOffsetInMs(start: number, offset?: string) {
  if (!offset) {
    return 0;
  }

  const interval = parseInterval(offset);

  if (!interval) {
    throw new Error(`Could not parse offset: ${offset}`);
  }

  const calculatedOffset = start - moment(start).subtract(interval).valueOf();

  return calculatedOffset;
}
