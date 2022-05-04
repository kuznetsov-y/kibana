/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { mockCasesContract } from '@kbn/cases-plugin/public/mocks';
import { useKibana } from '../../../../common/lib/kibana';
import { TestProviders } from '../../../../common/mock';
import {
  useCasesByStatus,
  UseCasesByStatusProps,
  UseCasesByStatusResults,
} from './use_cases_by_status';

const dateNow = new Date('2022-04-08T12:00:00.000Z').valueOf();
const mockDateNow = jest.fn().mockReturnValue(dateNow);
Date.now = jest.fn(() => mockDateNow()) as unknown as DateConstructor['now'];

jest.mock('../../../../common/containers/use_global_time', () => {
  return {
    useGlobalTime: jest
      .fn()
      .mockReturnValue({ from: '2022-04-05T12:00:00.000Z', to: '2022-04-08T12:00:00.000Z' }),
  };
});
jest.mock('../../../../common/lib/kibana');

const mockGetAllCasesMetrics = jest.fn();
mockGetAllCasesMetrics.mockResolvedValue({
  count_open_cases: 1,
  count_in_progress_cases: 2,
  count_closed_cases: 3,
});
mockGetAllCasesMetrics.mockResolvedValueOnce({
  count_open_cases: 0,
  count_in_progress_cases: 0,
  count_closed_cases: 0,
});

const mockUseKibana = {
  services: {
    cases: {
      ...mockCasesContract(),
      api: {
        cases: {
          getAllCasesMetrics: mockGetAllCasesMetrics,
        },
      },
    },
  },
};

(useKibana as jest.Mock).mockReturnValue(mockUseKibana);

describe('useCasesByStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('init', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook<
        UseCasesByStatusProps,
        UseCasesByStatusResults
      >(() => useCasesByStatus({ skip: false }), {
        wrapper: TestProviders,
      });
      await waitForNextUpdate();
      expect(result.current).toEqual({
        closed: 0,
        inProgress: 0,
        isLoading: true,
        open: 0,
        totalCounts: 0,
        updatedAt: dateNow,
      });
    });
  });

  test('fetch data', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook<
        UseCasesByStatusProps,
        UseCasesByStatusResults
      >(() => useCasesByStatus({ skip: false }), {
        wrapper: TestProviders,
      });
      await waitForNextUpdate();
      await waitForNextUpdate();
      expect(result.current).toEqual({
        closed: 3,
        inProgress: 2,
        isLoading: false,
        open: 1,
        totalCounts: 6,
        updatedAt: dateNow,
      });
    });
  });

  test('skip', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    await act(async () => {
      const localProps = { skip: false };

      const { rerender, waitForNextUpdate } = renderHook<
        UseCasesByStatusProps,
        UseCasesByStatusResults
      >(() => useCasesByStatus(localProps), {
        wrapper: TestProviders,
      });
      await waitForNextUpdate();
      await waitForNextUpdate();

      localProps.skip = true;
      act(() => rerender());
      act(() => rerender());
      expect(abortSpy).toHaveBeenCalledTimes(2);
    });
  });
});
