// fn(scope)

import * as b from '../ast/builders.mjs';
import { fnIdentifier } from './fn-params.mjs';
import { scopeIdentifier } from './scope.mjs';

export default b.callExpression(fnIdentifier, [scopeIdentifier]);
