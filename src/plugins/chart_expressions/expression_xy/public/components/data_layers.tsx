/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import {
  AreaSeries,
  BarSeries,
  CurveType,
  LabelOverflowConstraint,
  LineSeries,
} from '@elastic/charts';
import React, { FC } from 'react';
import { i18n } from '@kbn/i18n';
import { PaletteRegistry } from '@kbn/coloring';
import { FormatFactory } from '@kbn/field-formats-plugin/common';
import {
  CommonXYDataLayerConfig,
  EndValue,
  FittingFunction,
  ValueLabelMode,
  XYCurveType,
} from '../../common';
import { SeriesTypes, ValueLabelModes } from '../../common/constants';
import {
  getColorAssignments,
  getFitOptions,
  GroupsConfiguration,
  getSeriesProps,
  DatatablesWithFormatInfo,
} from '../helpers';

interface Props {
  layers: CommonXYDataLayerConfig[];
  formatFactory: FormatFactory;
  chartHasMoreThanOneBarSeries?: boolean;
  yAxesConfiguration: GroupsConfiguration;
  curveType?: XYCurveType;
  fittingFunction?: FittingFunction;
  endValue?: EndValue | undefined;
  paletteService: PaletteRegistry;
  formattedDatatables: DatatablesWithFormatInfo;
  syncColors?: boolean;
  timeZone?: string;
  emphasizeFitting?: boolean;
  fillOpacity?: number;
  shouldShowValueLabels?: boolean;
  valueLabels: ValueLabelMode;
}

export const DataLayers: FC<Props> = ({
  layers,
  endValue,
  timeZone,
  curveType,
  syncColors,
  valueLabels,
  fillOpacity,
  formatFactory,
  paletteService,
  fittingFunction,
  emphasizeFitting,
  yAxesConfiguration,
  shouldShowValueLabels,
  formattedDatatables,
  chartHasMoreThanOneBarSeries,
}) => {
  const colorAssignments = getColorAssignments(layers, formatFactory);
  return (
    <>
      {layers.flatMap((layer) =>
        layer.accessors.map((accessor, accessorIndex) => {
          const { splitAccessor, seriesType, xAccessor, columnToLabel, layerId } = layer;
          const columnToLabelMap: Record<string, string> = columnToLabel
            ? JSON.parse(columnToLabel)
            : {};

          // what if row values are not primitive? That is the case of, for instance, Ranges
          // remaps them to their serialized version with the formatHint metadata
          // In order to do it we need to make a copy of the table as the raw one is required for more features (filters, etc...) later on
          const formattedDatatableInfo = formattedDatatables[layerId];

          const isPercentage = seriesType.includes('percentage');

          // For date histogram chart type, we're getting the rows that represent intervals without data.
          // To not display them in the legend, they need to be filtered out.
          const rows = formattedDatatableInfo.table.rows.filter(
            (row) =>
              !(xAccessor && typeof row[xAccessor] === 'undefined') &&
              !(
                splitAccessor &&
                typeof row[splitAccessor] === 'undefined' &&
                typeof row[accessor] === 'undefined'
              )
          );

          if (!xAccessor) {
            rows.forEach((row) => {
              row.unifiedX = i18n.translate('expressionXY.xyChart.emptyXLabel', {
                defaultMessage: '(empty)',
              });
            });
          }

          const yAxis = yAxesConfiguration.find((axisConfiguration) =>
            axisConfiguration.series.find((currentSeries) => currentSeries.accessor === accessor)
          );

          const seriesProps = getSeriesProps({
            layer,
            accessor,
            chartHasMoreThanOneBarSeries,
            colorAssignments,
            formatFactory,
            columnToLabelMap,
            paletteService,
            formattedDatatableInfo,
            syncColors,
            yAxis,
            timeZone,
            emphasizeFitting,
            fillOpacity,
          });

          const index = `${layer.layerId}-${accessorIndex}`;

          const curve = curveType ? CurveType[curveType] : undefined;

          switch (seriesType) {
            case SeriesTypes.LINE:
              return (
                <LineSeries
                  key={index}
                  {...seriesProps}
                  fit={getFitOptions(fittingFunction, endValue)}
                  curve={curve}
                />
              );
            case SeriesTypes.BAR:
            case SeriesTypes.BAR_STACKED:
            case SeriesTypes.BAR_PERCENTAGE_STACKED:
            case SeriesTypes.BAR_HORIZONTAL:
            case SeriesTypes.BAR_HORIZONTAL_STACKED:
            case SeriesTypes.BAR_HORIZONTAL_PERCENTAGE_STACKED:
              const valueLabelsSettings = {
                displayValueSettings: {
                  // This format double fixes two issues in elastic-chart
                  // * when rotating the chart, the formatter is not correctly picked
                  // * in some scenarios value labels are not strings, and this breaks the elastic-chart lib
                  valueFormatter: (d: unknown) => yAxis?.formatter?.convert(d) || '',
                  showValueLabel: shouldShowValueLabels && valueLabels !== ValueLabelModes.HIDE,
                  isValueContainedInElement: false,
                  isAlternatingValueLabel: false,
                  overflowConstraints: [
                    LabelOverflowConstraint.ChartEdges,
                    LabelOverflowConstraint.BarGeometry,
                  ],
                },
              };
              return <BarSeries key={index} {...seriesProps} {...valueLabelsSettings} />;
            case SeriesTypes.AREA_STACKED:
            case SeriesTypes.AREA_PERCENTAGE_STACKED:
              return (
                <AreaSeries
                  key={index}
                  {...seriesProps}
                  fit={isPercentage ? 'zero' : getFitOptions(fittingFunction, endValue)}
                  curve={curve}
                />
              );
            case SeriesTypes.AREA:
              return (
                <AreaSeries
                  key={index}
                  {...seriesProps}
                  fit={getFitOptions(fittingFunction, endValue)}
                  curve={curve}
                />
              );
          }
        })
      )}
    </>
  );
};
