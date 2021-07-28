import * as b from '../ast/builders.mjs';
import { scopeIdentifier } from './scope.mjs';

export const fnIdentifier = b.identifier('fn');

// scope, fn
export default [scopeIdentifier, fnIdentifier];
