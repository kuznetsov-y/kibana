/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { CustomElementModal } from '../custom_element_modal';
import { elasticLogo } from '../../../../../../../src/plugins/presentation_util/common';

storiesOf('components/Elements/CustomElementModal', module)
  .add('with title', () => (
    <CustomElementModal
      title="Create new element"
      onCancel={action('onCancel')}
      onSave={action('onSave')}
    />
  ))
  .add('with name', () => (
    <CustomElementModal
      title="Edit custom element"
      name="My Chart"
      description=""
      onCancel={action('onCancel')}
      onSave={action('onSave')}
    />
  ))
  .add('with description', () => (
    <CustomElementModal
      title="Edit custom element"
      description="best element ever"
      onCancel={action('onCancel')}
      onSave={action('onSave')}
    />
  ))
  .add('with image', () => (
    <CustomElementModal
      title="Edit custom element"
      image={elasticLogo}
      onCancel={action('onCancel')}
      onSave={action('onSave')}
    />
  ));
