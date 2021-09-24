/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  COMPLEX_SPLIT_ACCESSOR,
  getColumnByAccessor,
  getComplexAccessor,
  getValueByAccessor,
} from './accessors';
import { AccessorFn, Datum } from '@elastic/charts';
import { KBN_FIELD_TYPES } from '@kbn/field-types';
import { DatatableColumn } from '../../../../expressions';

describe('XY chart datum accessors', () => {
  const formatter = (val: Datum) => JSON.stringify(val);
  const aspectBase = {
    accessor: 'col-0-2',
    formatter,
    id: '',
    title: '',
    params: {},
  };

  const shouldNotApplyFormatterForNotComplexField = (type: string) => {
    const aspect = {
      ...aspectBase,
      format: { id: type },
    };
    const accessor = getComplexAccessor(COMPLEX_SPLIT_ACCESSOR)(aspect);
    const val = 'data';
    const datum = { 'col-0-2': val };
    expect(accessor?.(datum)).toBe(val);
  };

  it('should format IP range aggregation', () => {
    const aspect = {
      ...aspectBase,
      format: { id: 'range' },
    };
    const accessor = getComplexAccessor(COMPLEX_SPLIT_ACCESSOR)(aspect);
    const datum = {
      'col-0-2': { type: 'range', from: '0.0.0.0', to: '127.255.255.255' },
    };

    expect((accessor as AccessorFn)(datum)).toStrictEqual(
      formatter({
        type: 'range',
        from: '0.0.0.0',
        to: '127.255.255.255',
      })
    );
  });

  it('should format date range aggregation', () => {
    const aspect = {
      ...aspectBase,
      format: { id: 'date_range' },
    };
    const accessor = getComplexAccessor(COMPLEX_SPLIT_ACCESSOR)(aspect);
    const datum = {
      'col-0-2': { from: '1613941200000', to: '1614685113537' },
    };

    expect((accessor as AccessorFn)(datum)).toStrictEqual(
      formatter({
        from: '1613941200000',
        to: '1614685113537',
      })
    );
  });

  it(`should not apply formatter for not complex field: ${KBN_FIELD_TYPES.STRING}`, () =>
    shouldNotApplyFormatterForNotComplexField(KBN_FIELD_TYPES.STRING));

  it(`should not apply formatter for not complex field: ${KBN_FIELD_TYPES.NUMBER}`, () =>
    shouldNotApplyFormatterForNotComplexField(KBN_FIELD_TYPES.NUMBER));

  it(`should not apply formatter for not complex field: ${KBN_FIELD_TYPES.DATE}`, () =>
    shouldNotApplyFormatterForNotComplexField(KBN_FIELD_TYPES.DATE));

  it(`should not apply formatter for not complex field: ${KBN_FIELD_TYPES.BOOLEAN}`, () =>
    shouldNotApplyFormatterForNotComplexField(KBN_FIELD_TYPES.BOOLEAN));

  it('should return simple string when aspect has no formatter', () => {
    const aspect = {
      ...aspectBase,
      formatter: undefined,
    };
    const accessor = getComplexAccessor(COMPLEX_SPLIT_ACCESSOR)(aspect);

    const val = 'data';
    const datum = { 'col-0-2': val };

    expect(accessor?.(datum)).toBe(val);
  });

  it('should return undefined when aspect has no accessor', () => {
    const aspect = {
      ...aspectBase,
      accessor: null,
    };
    const datum = { 'col-0-2': 'data' };

    const accessor = getComplexAccessor(COMPLEX_SPLIT_ACCESSOR)(aspect);

    expect(accessor?.(datum)).toBeUndefined();
  });
});

describe('getColumnByAccessor', () => {
  const columns = [
    { id: 'col-0-0', name: 'Col1' },
    { id: 'col-0-1', name: 'Col2' },
    { id: 'col-0-2', name: 'Col3' },
    { id: 'col-0-3', name: 'Col4' },
  ];

  it('should find column by number accessor', () => {
    const accessor = 2;
    const column = getColumnByAccessor(columns, accessor);
    expect(column).not.toBeUndefined();
    expect(column).not.toBeNull();
    expect(typeof column).toBe('object');
    expect(column.id).toBe('col-0-2');
  });

  it('should not find a column by the number accessor with wrong index ', () => {
    const accessor = columns.length;

    const column = getColumnByAccessor(columns, accessor);
    expect(column).toBeUndefined();
  });

  it('should find column by DatatableColumn accessor', () => {
    const accessor: DatatableColumn = {
      id: 'col-0-1',
      name: 'some accessor',
      meta: { type: 'string' },
    };

    const column = getColumnByAccessor(columns, accessor);
    expect(column).not.toBeUndefined();
    expect(column).not.toBeNull();
    expect(typeof column).toBe('object');
    expect(column.id).toBe(accessor.id);
  });

  it('should not find a column by the DatatableColumn accessor with wrong id', () => {
    const accessor: DatatableColumn = {
      id: 'col-1-1',
      name: 'some accessor',
      meta: { type: 'string' },
    };

    const column = getColumnByAccessor(columns, accessor);
    expect(column).toBeUndefined();
  });
});

describe('getValueByAccessor', () => {
  const columnId = 'col-0-1';
  const columnValue = 'Some value';
  const data = {
    'col-0-3': 'col03',
    [columnId]: columnValue,
    'col-0-2': 'col01',
    'col-0-4': 'col-0-4',
  };

  it('should find column value by number accessor', () => {
    const accessor = 1;

    const value = getValueByAccessor(data, accessor);
    expect(value).not.toBeUndefined();
    expect(value).not.toBeNull();
    expect(value).toBe(data[columnId]);
  });

  it('should not find a column value by the number accessor with wrong index ', () => {
    const accessor = Object.keys(data).length;

    const column = getValueByAccessor(data, accessor);
    expect(column).toBeUndefined();
  });

  it('should find column by DatatableColumn accessor', () => {
    const accessor: DatatableColumn = {
      id: columnId,
      name: 'some accessor',
      meta: { type: 'string' },
    };

    const value = getValueByAccessor(data, accessor);
    expect(value).not.toBeUndefined();
    expect(value).not.toBeNull();
    expect(value).toBe(columnValue);
  });

  it('should not find a column by the DatatableColumn accessor with wrong id', () => {
    const accessor: DatatableColumn = {
      id: `${columnId}-0`,
      name: 'some accessor',
      meta: { type: 'string' },
    };

    const value = getValueByAccessor(data, accessor);
    expect(value).toBeUndefined();
  });
});
