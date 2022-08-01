/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import deepEqual from 'fast-deep-equal';

import { EmbeddableFactoryDefinition, IContainer } from '@kbn/embeddable-plugin/public';
import { lazyLoadReduxEmbeddablePackage } from '@kbn/presentation-util-plugin/public';

import { ControlEmbeddable, DataControlField, IEditableControlFactory } from '../../types';
import { RangeSliderEmbeddableInput, RANGE_SLIDER_CONTROL } from './types';
import {
  createRangeSliderExtract,
  createRangeSliderInject,
} from '../../../common/control_types/range_slider/range_slider_persistable_state';
import { RangeSliderStrings } from './range_slider_strings';

export class RangeSliderEmbeddableFactory
  implements EmbeddableFactoryDefinition, IEditableControlFactory<RangeSliderEmbeddableInput>
{
  public type = RANGE_SLIDER_CONTROL;
  public canCreateNew = () => false;

  constructor() {}

  public async create(initialInput: RangeSliderEmbeddableInput, parent?: IContainer) {
    const reduxEmbeddablePackage = await lazyLoadReduxEmbeddablePackage();
    const { RangeSliderEmbeddable } = await import('./range_slider_embeddable');
    return Promise.resolve(
      new RangeSliderEmbeddable(reduxEmbeddablePackage, initialInput, {}, parent)
    );
  }

  public presaveTransformFunction = (
    newInput: Partial<RangeSliderEmbeddableInput>,
    embeddable?: ControlEmbeddable<RangeSliderEmbeddableInput>
  ) => {
    if (
      embeddable &&
      ((newInput.fieldName && !deepEqual(newInput.fieldName, embeddable.getInput().fieldName)) ||
        (newInput.dataViewId && !deepEqual(newInput.dataViewId, embeddable.getInput().dataViewId)))
    ) {
      // if the field name or data view id has changed in this editing session, selected values are invalid, so reset them.
      newInput.value = ['', ''];
    }
    return newInput;
  };

  public isFieldCompatible = (dataControlField: DataControlField) => {
    if (dataControlField.field.aggregatable && dataControlField.field.type === 'number') {
      dataControlField.compatibleControlTypes.push(this.type);
    }
  };

  public isEditable = () => Promise.resolve(false);

  public getDisplayName = () => RangeSliderStrings.getDisplayName();
  public getIconType = () => 'controlsHorizontal';
  public getDescription = () => RangeSliderStrings.getDescription();

  public inject = createRangeSliderInject();
  public extract = createRangeSliderExtract();
}
