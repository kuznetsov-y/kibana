/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const buildMaxFormula = (selector: string) => {
  return `max(${selector})`;
};

const buildСounterRateFormula = (aggFormula: string, selector: string) => {
  return `${aggFormula}(${selector})`;
};

export const buildCounterRateFormula = (aggFormula: string, fieldName: string) => {
  const maxFormula = buildMaxFormula(fieldName);

  const counterRateFormula = buildСounterRateFormula(aggFormula, maxFormula);
  return counterRateFormula;
};
