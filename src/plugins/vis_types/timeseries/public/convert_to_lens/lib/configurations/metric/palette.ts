/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import color from 'color';
import { ColorStop, CustomPaletteParams, PaletteOutput } from '@kbn/coloring';
import { uniqBy } from 'lodash';
import { Panel } from '../../../../../common/types';
import { Column } from '../../convert';

const Operators = {
  GTE: 'gte',
  GT: 'gt',
  LTE: 'lte',
  LT: 'lt',
} as const;

type ColorStopsWithMinMax = Pick<
  CustomPaletteParams,
  'colorStops' | 'stops' | 'steps' | 'rangeMax' | 'rangeMin' | 'continuity'
>;

type MetricColorRule = Exclude<Panel['background_color_rules'], undefined>[number];
type GaugeColorRule = Exclude<Panel['gauge_color_rules'], undefined>[number];

type ValidMetricColorRule = Omit<MetricColorRule, 'background_color' | 'color'> &
  (
    | {
        background_color: Exclude<MetricColorRule['background_color'], undefined>;
        color: MetricColorRule['color'];
      }
    | {
        background_color: MetricColorRule['background_color'];
        color: Exclude<MetricColorRule['color'], undefined>;
      }
  );

type ValidGaugeColorRule = Omit<GaugeColorRule, 'gauge'> & {
  gauge: Exclude<GaugeColorRule['gauge'], undefined>;
};

const isValidColorRule = (
  rule: MetricColorRule | GaugeColorRule
): rule is ValidMetricColorRule | ValidGaugeColorRule => {
  const { background_color: bColor, color: textColor } = rule as MetricColorRule;
  const { gauge } = rule as GaugeColorRule;

  return rule.operator && (bColor ?? textColor ?? gauge) && rule.value !== undefined ? true : false;
};

const isMetricColorRule = (
  rule: ValidMetricColorRule | ValidGaugeColorRule
): rule is ValidMetricColorRule => {
  const metricRule = rule as ValidMetricColorRule;
  return metricRule.background_color ?? metricRule.color ? true : false;
};

const getColor = (rule: ValidMetricColorRule | ValidGaugeColorRule) => {
  if (isMetricColorRule(rule)) {
    return rule.background_color ?? rule.color;
  }
  return rule.gauge;
};

const getColorStopsWithMinMaxForAllGteOrWithLte = (
  rules: Array<ValidMetricColorRule | ValidGaugeColorRule>,
  tailOperator: string
): ColorStopsWithMinMax => {
  const lastRule = rules[rules.length - 1];
  const lastRuleColor = getColor(lastRule);

  const colorStops = rules.reduce<ColorStop[]>((colors, rule, index, rulesArr) => {
    const rgbColor = getColor(rule);
    if (index === rulesArr.length - 1 && tailOperator === Operators.LTE) {
      return colors;
    }
    // if last operation is LTE, color of gte should be replaced by lte
    if (index === rulesArr.length - 2 && tailOperator === Operators.LTE) {
      return [
        ...colors,
        {
          color: color(lastRuleColor).hex(),
          stop: rule.value!,
        },
      ];
    }
    return [
      ...colors,
      {
        color: color(rgbColor).hex(),
        stop: rule.value!,
      },
    ];
  }, []);

  const stops = colorStops.reduce<ColorStop[]>((prevStops, colorStop, index, colorStopsArr) => {
    if (index === colorStopsArr.length - 1) {
      return [
        ...prevStops,
        {
          color: colorStop.color,
          stop: tailOperator === Operators.LTE ? lastRule.value! : colorStop.stop + 1,
        },
      ];
    }
    return [...prevStops, { color: colorStop.color, stop: colorStopsArr[index + 1].stop }];
  }, []);

  const [rule] = rules;
  return {
    rangeMin: rule.value,
    rangeMax: tailOperator === Operators.LTE ? lastRule.value : Infinity,
    colorStops,
    stops,
    steps: colorStops.length,
    continuity: tailOperator === Operators.LTE ? 'none' : 'above',
  };
};

const getColorStopsWithMinMaxForLtWithLte = (
  rules: Array<ValidMetricColorRule | ValidGaugeColorRule>
): ColorStopsWithMinMax => {
  const lastRule = rules[rules.length - 1];
  const colorStops = rules.reduce<ColorStop[]>((colors, rule, index, rulesArr) => {
    if (index === 0) {
      return [{ color: color(getColor(rule)).hex(), stop: -Infinity }];
    }
    const rgbColor = getColor(rule);
    return [
      ...colors,
      {
        color: color(rgbColor).hex(),
        stop: rulesArr[index - 1].value!,
      },
    ];
  }, []);

  const stops = colorStops.reduce<ColorStop[]>((prevStops, colorStop, index, colorStopsArr) => {
    if (index === colorStopsArr.length - 1) {
      return [
        ...prevStops,
        {
          color: colorStop.color,
          stop: lastRule.value!,
        },
      ];
    }
    return [...prevStops, { color: colorStop.color, stop: colorStopsArr[index + 1].stop }];
  }, []);

  return {
    rangeMin: -Infinity,
    rangeMax: lastRule.value,
    colorStops,
    stops,
    steps: colorStops.length + 1,
    continuity: 'below',
  };
};

const getColorStopWithMinMaxForLte = (
  rule: ValidMetricColorRule | ValidGaugeColorRule
): ColorStopsWithMinMax => {
  const colorStop = {
    color: color(getColor(rule)).hex(),
    stop: rule.value!,
  };
  return {
    rangeMin: -Infinity,
    rangeMax: rule.value!,
    colorStops: [colorStop],
    stops: [colorStop],
    steps: 1,
    continuity: 'below',
  };
};

const getCustomPalette = (
  colorStopsWithMinMax: ColorStopsWithMinMax
): PaletteOutput<CustomPaletteParams> => {
  return {
    name: 'custom',
    params: {
      continuity: 'all',
      maxSteps: 5,
      name: 'custom',
      progression: 'fixed',
      rangeMax: Infinity,
      rangeMin: -Infinity,
      rangeType: 'number',
      reverse: false,
      ...colorStopsWithMinMax,
    },
    type: 'palette',
  };
};

export const getPalette = (
  rules: Exclude<Panel['background_color_rules'] | Panel['gauge_color_rules'], undefined>
): PaletteOutput<CustomPaletteParams> | null | undefined => {
  const validRules = (rules as Array<MetricColorRule | GaugeColorRule>).filter<
    ValidMetricColorRule | ValidGaugeColorRule
  >((rule): rule is ValidMetricColorRule | ValidGaugeColorRule => isValidColorRule(rule));

  validRules.sort((rule1, rule2) => {
    return rule1.value! - rule2.value!;
  });

  const kindOfRules = uniqBy(validRules, 'operator');

  if (!kindOfRules.length) {
    return;
  }

  // lnsMetric is supporting lte only, if one rule is defined
  if (validRules.length === 1) {
    if (validRules[0].operator !== Operators.LTE) {
      return null;
    }
    return getCustomPalette(getColorStopWithMinMaxForLte(validRules[0]));
  }

  const headRules = validRules.slice(0, -1);
  const tailRule = validRules[validRules.length - 1];
  const kindOfHeadRules = uniqBy(headRules, 'operator');

  if (
    kindOfHeadRules.length > 1 ||
    (kindOfHeadRules[0].operator !== tailRule.operator && tailRule.operator !== Operators.LTE)
  ) {
    return null;
  }

  const [rule] = kindOfHeadRules;

  if (rule.operator === Operators.LTE) {
    return null;
  }

  if (rule.operator === Operators.LT) {
    if (tailRule.operator !== Operators.LTE) {
      return null;
    }
    return getCustomPalette(getColorStopsWithMinMaxForLtWithLte(validRules));
  }

  if (rule.operator === Operators.GTE) {
    return getCustomPalette(
      getColorStopsWithMinMaxForAllGteOrWithLte(validRules, tailRule.operator!)
    );
  }
};

export const getGaugePalette = (
  model: Panel,
  bucket?: Column
): PaletteOutput<CustomPaletteParams> | null | undefined => {
  const palette = getPalette(model.gauge_color_rules ?? []);
  if (palette === null) {
    return null;
  }

  // const gaugePalette = (
  //   bucket ? { type: 'palette', name: 'status' } : undefined
  // ) as PaletteOutput<CustomPaletteParams> | undefined;

  // return palette ?? gaugePalette;
  return palette;
};
