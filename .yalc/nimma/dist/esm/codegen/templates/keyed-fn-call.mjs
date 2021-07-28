import { callExpression, identifier } from '../ast/builders.mjs';
import { fnIdentifier } from './fn-params.mjs';
import { scopeIdentifier } from './scope.mjs';

var keyedFnCall = callExpression(identifier('withKeys'), [
  scopeIdentifier,
  fnIdentifier,
]);

export default keyedFnCall;
