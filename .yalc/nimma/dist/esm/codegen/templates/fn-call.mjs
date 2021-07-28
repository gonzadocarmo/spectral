import { callExpression } from '../ast/builders.mjs';
import { fnIdentifier } from './fn-params.mjs';
import { scopeIdentifier } from './scope.mjs';

// fn(scope)

var fnCall = callExpression(fnIdentifier, [scopeIdentifier]);

export default fnCall;
