/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipType } from '@elastic/charts';

import { Aspects, TooltipConfig } from '../../common/types';
import { getDetailedTooltip } from '../components/detailed_tooltip';

interface TooltipDisplayConfig {
  addTooltip?: boolean;
  detailedTooltip?: boolean;
}

export function getTooltip(
  aspects: Aspects,
  { addTooltip, detailedTooltip }: TooltipDisplayConfig
): TooltipConfig {
  return {
    type: addTooltip ? TooltipType.VerticalCursor : TooltipType.None,
    detailedTooltip: detailedTooltip ? getDetailedTooltip(aspects) : undefined,
  };
}
