/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';

import { ColorMode, ColorSchemas } from '../../../../charts/public';
import { AggGroupNames } from '../../../../data/public';
import { VisTypeDefinition, VIS_EVENT_TO_TRIGGER } from '../../../../visualizations/public';

import { Alignment, GaugeType } from '../types';
import { toExpressionAst } from '../to_ast';
import { GaugeOptions } from '../editor/components';
import { GaugeVisParams } from '../types';

export const gaugeVisTypeDefinition: VisTypeDefinition<GaugeVisParams> = {
  name: 'gauge',
  title: i18n.translate('visTypeGauge.gauge.gaugeTitle', { defaultMessage: 'Gauge' }),
  icon: 'visGauge',
  description: i18n.translate('visTypeGauge.gauge.gaugeDescription', {
    defaultMessage: 'Show the status of a metric.',
  }),
  getSupportedTriggers: () => [VIS_EVENT_TO_TRIGGER.filter],
  toExpressionAst,
  visConfig: {
    defaults: {
      type: 'gauge',
      addTooltip: true,
      addLegend: true,
      isDisplayWarning: false,
      gauge: {
        alignment: Alignment.Automatic,
        extendRange: true,
        percentageMode: false,
        gaugeType: GaugeType.Arc,
        gaugeStyle: 'Full',
        backStyle: 'Full',
        orientation: 'vertical',
        colorSchema: ColorSchemas.GreenToRed,
        gaugeColorMode: ColorMode.Labels,
        colorsRange: [
          { from: 0, to: 50 },
          { from: 50, to: 75 },
          { from: 75, to: 100 },
        ],
        invertColors: false,
        labels: {
          show: true,
          color: 'black',
        },
        scale: {
          show: true,
          labels: false,
          color: 'rgba(105,112,125,0.2)',
        },
        type: 'meter',
        style: {
          bgWidth: 0.9,
          width: 0.9,
          mask: false,
          bgMask: false,
          maskBars: 50,
          bgFill: 'rgba(105,112,125,0.2)',
          bgColor: true,
          subText: '',
          fontSize: 60,
        },
      },
    },
  },
  editorConfig: {
    optionsTemplate: GaugeOptions,
    schemas: [
      {
        group: AggGroupNames.Metrics,
        name: 'metric',
        title: i18n.translate('visTypeGauge.gauge.metricTitle', { defaultMessage: 'Metric' }),
        min: 1,
        aggFilter: [
          '!std_dev',
          '!geo_centroid',
          '!percentiles',
          '!percentile_ranks',
          '!derivative',
          '!serial_diff',
          '!moving_avg',
          '!cumulative_sum',
          '!geo_bounds',
          '!filtered_metric',
          '!single_percentile',
        ],
        defaults: [{ schema: 'metric', type: 'count' }],
      },
      {
        group: AggGroupNames.Buckets,
        name: 'group',
        title: i18n.translate('visTypeGauge.gauge.groupTitle', {
          defaultMessage: 'Split group',
        }),
        min: 0,
        max: 1,
        aggFilter: [
          '!geohash_grid',
          '!geotile_grid',
          '!filter',
          '!sampler',
          '!diversified_sampler',
          '!rare_terms',
          '!multi_terms',
          '!significant_text',
        ],
      },
    ],
  },
  requiresSearch: true,
};
