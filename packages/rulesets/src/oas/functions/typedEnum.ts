import { oas2, oas3 } from '@stoplight/spectral-formats';
import type { IFunction } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';
import { printValue } from '@stoplight/spectral-runtime';
import type { JSONSchema4Type, JSONSchema6Type, JSONSchema7Type } from 'json-schema';

function getType(input: unknown, checkForInteger: boolean): JSONSchema4Type | JSONSchema6Type | JSONSchema7Type {
  switch (typeof input) {
    case 'string':
    case 'boolean':
      return typeof input;
    case 'number':
      if (checkForInteger && Number.isInteger(input)) {
        return 'integer';
      }

      return 'number';
    case 'object':
      if (input === null) {
        return 'null';
      }

      return Array.isArray(input) ? 'array' : 'object';
    default:
      throw TypeError('Unknown input type');
  }
}

export const typedEnum: IFunction = function (targetVal, opts, context) {
  if (!isObject(targetVal)) {
    return;
  }

  const { enum: enumValues } = targetVal;
  let { type } = targetVal;

  if (!Array.isArray(enumValues) || (!Array.isArray(type) && typeof type !== 'string')) {
    return;
  }

  const { document } = context;
  const checkForInteger = Array.isArray(type) ? type.includes('integer') : type === 'integer';

  if (
    (document.formats?.has(oas3) === true && targetVal.nullable === true) ||
    (document.formats?.has(oas2) === true && targetVal['x-nullable'] === true)
  ) {
    (Array.isArray(type) ? type : (type = [type])).push('null');
  }

  let incorrectValues: number[] | undefined;

  (enumValues as unknown[]).forEach((value, i) => {
    const valueType = getType(value, checkForInteger);

    if (Array.isArray(type) ? type.includes(valueType) : valueType === type) {
      return;
    }

    incorrectValues ??= [];
    incorrectValues.push(i);
  });

  return incorrectValues?.map(i => {
    return {
      message: `Enum value ${printValue(enumValues[i])} must be "${String(type)}".`,
      path: [...context.path, 'enum', i],
    };
  });
};

export default typedEnum;
