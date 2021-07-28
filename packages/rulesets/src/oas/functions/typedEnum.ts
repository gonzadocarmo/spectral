import { oas2, oas3 } from '@stoplight/spectral-formats';
import type { IFunction } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';

function getType(input: unknown) {
  switch (typeof input) {
    case 'string':
    case 'boolean':
    case 'number':
      return typeof input;
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

  if (targetVal.enum === null || targetVal.enum === void 0 || targetVal.type === null || targetVal.type === void 0) {
    return;
  }

  if (!Array.isArray(targetVal.enum) || targetVal.enum.length === 0) {
    return;
  }

  // do not use rest spread operator here, as this causes the whole tslib gets injected despite proper target set...
  // obviously, having tslib inlined makes the code size quite larger (around 4x after compression - 1.8K vs 7.4K).
  const { enum: enumValues } = targetVal;
  const initialSchema = Object.assign({}, targetVal);
  delete initialSchema.enum;

  const { document } = context;

  let type: string | string[] | void;
  if (
    (document.formats?.has(oas3) === true && targetVal.nullable === true) ||
    (document.formats?.has(oas2) === true && targetVal['x-nullable'] === true)
  ) {
    type = Array.isArray(initialSchema.type) || initialSchema.type !== void 0 ? targetVal.type : void 0;

    (Array.isArray(type) ? type : (type = [type])).push('null');
  }

  (enumValues as unknown[]).forEach((val, index) => {
    if (Array.isArray(res) && res.length !== 0) {
      incorrectValues.push({ index, val });
    }
  });

  if (incorrectValues.length === 0) {
    return;
  }

  const { type } = initialSchema;

  return incorrectValues.map(bad => {
    return {
      message: `Enum value \`${String(bad.val)}\` must be "${String(type)}".`,
      path: [...context.path, 'enum', bad.index],
    };
  });
};

export default typedEnum;
