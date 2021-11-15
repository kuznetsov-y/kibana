/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { EsqlLang } from '@kbn/monaco';
import { EuiFormRow, EuiTextArea, EuiLink, EuiText } from '@elastic/eui';
import { CodeEditorField } from '../../../../../../src/plugins/kibana_react/public';
import { getSimpleArg, setSimpleArg } from '../../../public/lib/arg_helpers';
import { templateFromReactComponent } from '../../../public/lib/template_from_react_component';
import { DataSourceStrings, SQL_URL } from '../../../i18n';

const { Essql: strings } = DataSourceStrings;

class EssqlDatasource extends PureComponent {
  constructor(props) {
    super(props);
    this.editor = null;
  }

  componentDidMount() {
    const query = this.getQuery();
    if (typeof query !== 'string') {
      this.setArg(this.getArgName(), this.defaultQuery);
    } else {
      this.props.setInvalid(!query.trim());
    }
  }

  defaultQuery = `SELECT * FROM "${this.props.defaultIndex}"`;

  getQuery = () => getSimpleArg(this.getArgName(), this.props.args)[0];

  // TODO: This is a terrible way of doing defaults. We need to find a way to read the defaults for the function
  // and set them for the data source UI.
  getArgName = () => {
    const { args } = this.props;
    if (getSimpleArg('_', args)[0]) {
      return '_';
    }
    if (getSimpleArg('q', args)[0]) {
      return 'q';
    }
    return 'query';
  };

  setArg = (name, value) => {
    const { args, updateArgs } = this.props;
    updateArgs &&
      updateArgs({
        ...args,
        ...setSimpleArg(name, value),
      });
  };

  onChange = (e) => {
    const { value } = e.target;
    this.props.setInvalid(!value.trim());
    this.setArg(this.getArgName(), value);
  };

  editorDidMount = (editor) => {
    // Updating tab size for the editor
    const model = editor.getModel();
    if (model) {
      model.updateOptions({ tabSize: 2 });
    }

    this.editor = editor;
  };

  render() {
    const { isInvalid } = this.props;
    console.log(EsqlLang);
    return (
      <EuiFormRow
        isInvalid={isInvalid}
        label={strings.getLabel()}
        labelAppend={
          <EuiText size="xs">
            <EuiLink href={SQL_URL} target="_blank">
              {strings.getLabelAppend()}
            </EuiLink>
          </EuiText>
        }
      >
        <CodeEditorField
          languageId={EsqlLang.ID}
          value={this.getQuery()}
          onChange={this.onChange}
          className="canvasTextArea__code"
          placeholder={this.defaultQuery}
          options={{
            fontSize: 12,
            scrollBeyondLastLine: false,
            quickSuggestions: true,
            minimap: { enabled: false },
            wordWrap: 'on',
            wrappingIndent: 'indent',
          }}
          height="150px"
          editorDidMount={this.editorDidMount}
        />
        {/* <EuiTextArea
          placeholder={this.defaultQuery}
          isInvalid={isInvalid}
          className="canvasTextArea__code"
          value={this.getQuery()}
          onChange={this.onChange}
          rows={15}
        /> */}
      </EuiFormRow>
    );
  }
}

EssqlDatasource.propTypes = {
  args: PropTypes.object.isRequired,
  updateArgs: PropTypes.func,
  isInvalid: PropTypes.bool,
  setInvalid: PropTypes.func,
  defaultIndex: PropTypes.string,
};

export const essql = () => ({
  name: 'essql',
  displayName: strings.getDisplayName(),
  help: strings.getHelp(),
  image: 'database',
  template: templateFromReactComponent(EssqlDatasource),
});
