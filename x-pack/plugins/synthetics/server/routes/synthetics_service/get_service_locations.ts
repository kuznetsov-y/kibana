/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getServiceLocations } from '../../synthetics_service/get_service_locations';
import { UMRestApiRouteFactory } from '../../legacy_uptime/routes';
import { API_URLS } from '../../../common/constants';

export const getServiceLocationsRoute: UMRestApiRouteFactory = () => ({
  method: 'GET',
  path: API_URLS.SERVICE_LOCATIONS,
  validate: {},
  handler: async ({ server }): Promise<any> => {
    if (server.syntheticsService.locations.length > 0) {
      const { throttling, locations } = server.syntheticsService;
      return { throttling, locations };
    }

    return getServiceLocations(server);
  },
});
