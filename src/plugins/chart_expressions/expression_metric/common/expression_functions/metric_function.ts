/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';

import { visType } from '../types';
import { prepareLogTable, Dimension } from '../../../../visualizations/public';
import { vislibColorMaps, ColorMode } from '../../../../charts/public';
import { MetricVisExpressionFunctionDefinition } from '../types';
import { EXPRESSION_METRIC_NAME } from '../constants';

export const metricFunction = (): MetricVisExpressionFunctionDefinition => ({
  name: EXPRESSION_METRIC_NAME,
  type: 'render',
  inputTypes: ['datatable'],
  help: i18n.translate('visTypeMetric.function.help', {
    defaultMessage: 'Metric visualization',
  }),
  args: {
    percentageMode: {
      types: ['boolean'],
      default: false,
      help: i18n.translate('visTypeMetric.function.percentageMode.help', {
        defaultMessage: 'Shows metric in percentage mode. Requires colorRange to be set.',
      }),
    },
    colorSchema: {
      types: ['string'],
      default: '"Green to Red"',
      options: Object.values(vislibColorMaps).map((value: any) => value.id),
      help: i18n.translate('visTypeMetric.function.colorSchema.help', {
        defaultMessage: 'Color schema to use',
      }),
    },
    colorMode: {
      types: ['string'],
      default: '"None"',
      options: [ColorMode.None, ColorMode.Labels, ColorMode.Background],
      help: i18n.translate('visTypeMetric.function.colorMode.help', {
        defaultMessage: 'Which part of metric to color',
      }),
    },
    colorRange: {
      types: ['range'],
      multi: true,
      default: '{range from=0 to=10000}',
      help: i18n.translate('visTypeMetric.function.colorRange.help', {
        defaultMessage:
          'A range object specifying groups of values to which different colors should be applied.',
      }),
    },
    useRanges: {
      types: ['boolean'],
      default: false,
      help: i18n.translate('visTypeMetric.function.useRanges.help', {
        defaultMessage: 'Enabled color ranges.',
      }),
    },
    invertColors: {
      types: ['boolean'],
      default: false,
      help: i18n.translate('visTypeMetric.function.invertColors.help', {
        defaultMessage: 'Inverts the color ranges',
      }),
    },
    showLabels: {
      types: ['boolean'],
      default: true,
      help: i18n.translate('visTypeMetric.function.showLabels.help', {
        defaultMessage: 'Shows labels under the metric values.',
      }),
    },
    bgFill: {
      types: ['string'],
      default: '"#000"',
      aliases: ['backgroundFill', 'bgColor', 'backgroundColor'],
      help: i18n.translate('visTypeMetric.function.bgFill.help', {
        defaultMessage:
          'Color as html hex code (#123456), html color (red, blue) or rgba value (rgba(255,255,255,1)).',
      }),
    },
    font: {
      types: ['style'],
      help: i18n.translate('visTypeMetric.function.font.help', {
        defaultMessage: 'Font settings.',
      }),
      default: '{font size=60}',
    },
    subText: {
      types: ['string'],
      aliases: ['label', 'text', 'description'],
      default: '""',
      help: i18n.translate('visTypeMetric.function.subText.help', {
        defaultMessage: 'Custom text to show under the metric',
      }),
    },
    metric: {
      types: ['vis_dimension'],
      help: i18n.translate('visTypeMetric.function.metric.help', {
        defaultMessage: 'metric dimension configuration',
      }),
      required: true,
      multi: true,
    },
    bucket: {
      types: ['vis_dimension'],
      help: i18n.translate('visTypeMetric.function.bucket.help', {
        defaultMessage: 'bucket dimension configuration',
      }),
    },
  },
  fn(input, args, handlers) {
    if (args.percentageMode && (!args.colorRange || args.colorRange.length === 0)) {
      throw new Error('colorRange must be provided when using percentageMode');
    }

    const fontSize = Number.parseInt(args.font.spec.fontSize || '', 10);

    if (handlers?.inspectorAdapters?.tables) {
      const argsTable: Dimension[] = [
        [
          args.metric,
          i18n.translate('visTypeMetric.function.dimension.metric', {
            defaultMessage: 'Metric',
          }),
        ],
      ];
      if (args.bucket) {
        argsTable.push([
          [args.bucket],
          i18n.translate('visTypeMetric.function.adimension.splitGroup', {
            defaultMessage: 'Split group',
          }),
        ]);
      }
      const logTable = prepareLogTable(input, argsTable);
      handlers.inspectorAdapters.tables.logDatatable('default', logTable);
    }

    return {
      type: 'render',
      as: 'metric_vis',
      value: {
        visData: input,
        visType,
        visConfig: {
          metric: {
            percentageMode: args.percentageMode,
            useRanges: args.useRanges,
            colorSchema: args.colorSchema,
            metricColorMode: args.colorMode,
            colorsRange: args.colorRange,
            labels: {
              show: args.showLabels,
            },
            invertColors: args.invertColors,
            style: {
              bgFill: args.bgFill,
              bgColor: args.colorMode === ColorMode.Background,
              labelColor: args.colorMode === ColorMode.Labels,
              subText: args.subText,
              fontSize,
            },
          },
          dimensions: {
            metrics: args.metric,
            ...(args.bucket ? { bucket: args.bucket } : {}),
          },
        },
      },
    };
  },
});
