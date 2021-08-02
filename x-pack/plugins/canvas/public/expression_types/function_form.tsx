/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiCallOut } from '@elastic/eui';
import { isPlainObject, uniq, last, compact } from 'lodash';
import { Ast, fromExpression } from '@kbn/interpreter/common';
import { ArgAddPopover } from '../components/arg_add_popover';
// @ts-expect-error unconverted components
import { SidebarSection } from '../components/sidebar/sidebar_section';
// @ts-expect-error unconverted components
import { SidebarSectionTitle } from '../components/sidebar/sidebar_section_title';
import { BaseForm, BaseFormProps } from './base_form';
import { Arg, ArgProps } from './arg';
import { ArgType, ArgTypeDef } from './types';

export interface FunctionFormOwnProps {
  args?: ArgProps[];
  resolve: (...args: any[]) => any;
  argType: ArgType;
  expressionIndex: number;
  onValueAdd: (argName: string, argValue: string | Ast | null) => () => void;
  onValueChange: (argName: string, argIndex: number) => (value: string | Ast) => void;
  onValueRemove: (argName: string, argIndex: number) => () => void;
}

export interface DataArg {
  arg: Arg | undefined;
  argValues?: Array<string | Ast | undefined>;
  skipRender?: boolean;
  label?: 'string';
}

export interface RenderArgData {
  argTypeDef?: ArgTypeDef;
  args: Record<string, Array<Ast | string>> | null;
}

export type FunctionFormProps = FunctionFormOwnProps & BaseFormProps;

export class FunctionForm extends BaseForm {
  args: ArgProps[];
  resolve: (...args: any[]) => any;

  constructor(props: FunctionFormProps) {
    super({ ...props });

    this.args = props.args || [];
    this.resolve = props.resolve || (() => ({}));
  }

  renderArg(props: FunctionFormProps, dataArg: DataArg) {
    const { onValueRemove, onValueChange, ...passedProps } = props;
    const { arg, argValues, skipRender, label } = dataArg;
    const { argType, expressionIndex } = passedProps;

    // TODO: show some information to the user than an argument was skipped
    if (!arg || skipRender) {
      return null;
    }
    const renderArgWithProps = (argValue: string | Ast | undefined, valueIndex: number) =>
      arg.render({
        key: `${argType}-${expressionIndex}-${arg.name}-${valueIndex}`,
        ...passedProps,
        label,
        valueIndex,
        argValue,
        onValueChange: onValueChange(arg.name, valueIndex),
        onValueRemove: onValueRemove(arg.name, valueIndex),
      });

    // render the argument's template, wrapped in a remove control
    // if the argument is required but not included, render the control anyway
    if (!argValues && arg.required) {
      return renderArgWithProps({ type: undefined, value: '' }, 0);
    }

    // render all included argument controls
    return argValues && argValues.map(renderArgWithProps);
  }

  // TODO: Argument adding isn't very good, we should improve this UI
  getAddableArg(props: FunctionFormProps, dataArg: DataArg) {
    const { onValueAdd } = props;
    const { arg, argValues, skipRender } = dataArg;

    // skip arguments that aren't defined in the expression type schema
    if (!arg || arg.required || skipRender) {
      return null;
    }
    if (argValues && !arg.multi) {
      return null;
    }

    const value = arg.default == null ? null : fromExpression(arg.default, 'argument');

    return { arg, onValueAdd: onValueAdd(arg.name, value) };
  }

  resolveArg(...args: unknown[]) {
    // basically a no-op placeholder
    return {};
  }

  render(data: RenderArgData = { args: null }) {
    const { args, argTypeDef } = data;

    // Don't instaniate these until render time, to give the registries a chance to populate.
    const argInstances = this.args.map((argSpec) => new Arg(argSpec));

    if (args === null || !isPlainObject(args)) {
      throw new Error(`Form "${this.name}" expects "args" object`);
    }

    // get a mapping of arg values from the expression and from the renderable's schema
    const argNames = uniq(argInstances.map((arg) => arg.name).concat(Object.keys(args)));
    const dataArgs = argNames.map((argName) => {
      const arg = argInstances.find((argument) => argument.name === argName);
      // if arg is not multi, only preserve the last value found
      // otherwise, leave the value alone (including if the arg is not defined)
      const isMulti = arg && arg.multi;
      const argValues = args[argName] && !isMulti ? [last(args[argName])] : args[argName];

      return { arg, argValues };
    });

    // props are passed to resolve and the returned object is mixed into the template props
    const props = { ...data, ...this.resolve(data), typeInstance: this };

    try {
      // allow a hook to override the data args
      const resolvedDataArgs = dataArgs.map((d) => ({ ...d, ...this.resolveArg(d, props) }));

      const argumentForms = compact(
        resolvedDataArgs.map((dataArg) => this.renderArg(props, dataArg))
      );
      const addableArgs = compact(
        resolvedDataArgs.map((dataArg) => this.getAddableArg(props, dataArg))
      );

      if (!addableArgs.length && !argumentForms.length) {
        return null;
      }

      return (
        <SidebarSection>
          <SidebarSectionTitle title={argTypeDef?.displayName} tip={argTypeDef?.help}>
            {addableArgs.length === 0 ? null : <ArgAddPopover options={addableArgs} />}
          </SidebarSectionTitle>
          {argumentForms}
        </SidebarSection>
      );
    } catch (e: any) {
      return (
        <EuiCallOut color="danger" iconType="cross" title="Expression rendering error">
          <p>{e.message}</p>
        </EuiCallOut>
      );
    }
  }
}
