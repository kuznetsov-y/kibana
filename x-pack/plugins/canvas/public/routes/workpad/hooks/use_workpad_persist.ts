/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useEffect, useCallback, useRef } from 'react';
import { isEqual } from 'lodash';
import usePrevious from 'react-use/lib/usePrevious';
import { useSelector } from 'react-redux';
import { i18n } from '@kbn/i18n';
import { catchError, concatMap, EMPTY, from, Observable, ObservableInput, Subject } from 'rxjs';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { CanvasWorkpad, State } from '../../../../types';
import { getWorkpad, getFullWorkpadPersisted } from '../../../state/selectors/workpad';
import { canUserWrite } from '../../../state/selectors/app';
import { getAssetIds } from '../../../state/selectors/assets';
import { useWorkpadService, useNotifyService } from '../../../services';

const strings = {
  getSaveFailureTitle: () =>
    i18n.translate('xpack.canvas.error.esPersist.saveFailureTitle', {
      defaultMessage: "Couldn't save your changes to Elasticsearch",
    }),
  getTooLargeErrorMessage: () =>
    i18n.translate('xpack.canvas.error.esPersist.tooLargeErrorMessage', {
      defaultMessage:
        'The server gave a response that the workpad data was too large. This usually means uploaded image assets that are too large for Kibana or a proxy. Try removing some assets in the asset manager.',
    }),
  getUpdateFailureTitle: () =>
    i18n.translate('xpack.canvas.error.esPersist.updateFailureTitle', {
      defaultMessage: "Couldn't update workpad",
    }),
};

export const syncUpdatesStream = (
  updateRequests$: Observable<() => Promise<unknown> | Observable<unknown>>,
  onError: (err: string | Error) => void
) =>
  updateRequests$.pipe(
    concatMap<() => Promise<unknown> | Observable<unknown>, ObservableInput<unknown>>(
      (updateRequest) =>
        from(updateRequest()).pipe(
          catchError((err) => {
            onError(err);
            return EMPTY;
          })
        )
    )
  );

export const useWorkpadPersist = () => {
  const { current: updateRequests$ } = useRef(new Subject<() => Promise<unknown>>());
  const service = useWorkpadService();
  const notifyService = useNotifyService();

  const notifyError = useCallback(
    (err: any) => {
      const statusCode = err.response && err.response.status;
      switch (statusCode) {
        case 400:
          return notifyService.error(err.response, {
            title: strings.getSaveFailureTitle(),
          });
        case 413:
          return notifyService.error(strings.getTooLargeErrorMessage(), {
            title: strings.getSaveFailureTitle(),
          });
        default:
          return notifyService.error(err, {
            title: strings.getUpdateFailureTitle(),
          });
      }
    },
    [notifyService]
  );

  useEffectOnce(() => {
    const stream$ = syncUpdatesStream(updateRequests$.asObservable(), notifyService.error);
    const subscription = stream$.subscribe();
    return () => {
      updateRequests$.complete();
      subscription.unsubscribe();
    };
  });

  // Watch for workpad state or workpad assets to change and then persist those changes
  const [workpad, assetIds, fullWorkpad, canWrite]: [
    CanvasWorkpad,
    Array<string | number>,
    CanvasWorkpad,
    boolean
  ] = useSelector((state: State) => [
    getWorkpad(state),
    getAssetIds(state),
    getFullWorkpadPersisted(state),
    canUserWrite(state),
  ]);

  const previousWorkpad = usePrevious(workpad);
  const previousAssetIds = usePrevious(assetIds);

  const workpadChanged = previousWorkpad && workpad !== previousWorkpad;
  const assetsChanged = previousAssetIds && !isEqual(assetIds, previousAssetIds);

  useEffect(() => {
    if (canWrite) {
      if (workpadChanged && assetsChanged) {
        updateRequests$.next(() => service.update(workpad.id, fullWorkpad));
      } else if (workpadChanged) {
        updateRequests$.next(() => service.updateWorkpad(workpad.id, workpad));
      } else if (assetsChanged) {
        updateRequests$.next(() => service.updateAssets(workpad.id, fullWorkpad.assets));
      }
    }
  }, [
    service,
    workpad,
    fullWorkpad,
    workpadChanged,
    assetsChanged,
    canWrite,
    notifyError,
    updateRequests$,
  ]);
};
