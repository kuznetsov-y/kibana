/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';
import type { ExpressionFunctionDefinition } from '../../../../expressions/common';
import { LayerTypes, EXTENDED_REFERENCE_LINE_LAYER, Y_CONFIG } from '../constants';
import { ExtendedReferenceLineLayerArgs, ExtendedReferenceLineLayerConfigResult } from '../types';

export const extendedReferenceLineLayerFunction: ExpressionFunctionDefinition<
  typeof EXTENDED_REFERENCE_LINE_LAYER,
  null,
  ExtendedReferenceLineLayerArgs,
  ExtendedReferenceLineLayerConfigResult
> = {
  name: EXTENDED_REFERENCE_LINE_LAYER,
  aliases: [],
  type: EXTENDED_REFERENCE_LINE_LAYER,
  help: i18n.translate('expressionXY.referenceLineLayer.help', {
    defaultMessage: `Configure a reference line in the xy chart`,
  }),
  inputTypes: ['null'],
  args: {
    layerId: {
      types: ['string'],
      help: i18n.translate('expressionXY.referenceLineLayer.layerId.help', {
        defaultMessage: `Layer ID`,
      }),
    },
    accessors: {
      types: ['string'],
      help: i18n.translate('expressionXY.referenceLineLayer.accessors.help', {
        defaultMessage: 'The columns to display on the y axis.',
      }),
      multi: true,
    },
    yConfig: {
      types: [Y_CONFIG],
      help: i18n.translate('expressionXY.referenceLineLayer.yConfig.help', {
        defaultMessage: 'Additional configuration for y axes',
      }),
      multi: true,
    },
    columnToLabel: {
      types: ['string'],
      help: i18n.translate('expressionXY.referenceLineLayer.columnToLabel.help', {
        defaultMessage: 'JSON key-value pairs of column ID to label',
      }),
    },
    table: {
      types: ['datatable'],
      help: i18n.translate('expressionXY.dataLayer.table.help', {
        defaultMessage: 'Table',
      }),
    },
  },
  fn(input, args) {
    return {
      type: EXTENDED_REFERENCE_LINE_LAYER,
      ...args,
      layerType: LayerTypes.REFERENCELINE,
    };
  },
};
