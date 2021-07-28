import { identifier } from '../ast/builders.mjs';
import { scopeIdentifier } from './scope.mjs';

const fnIdentifier = identifier('fn');

// scope, fn
var fnParams = [scopeIdentifier, fnIdentifier];

export default fnParams;
export { fnIdentifier };
