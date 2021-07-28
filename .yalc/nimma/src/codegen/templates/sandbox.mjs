import * as b from '../ast/builders.mjs';
import scope from './scope.mjs';

export default {
  parent: b.memberExpression(scope.sandbox, b.identifier('parent')),
  parentProperty: b.memberExpression(
    scope.sandbox,
    b.identifier('parentProperty'),
  ),
  property: b.memberExpression(scope.sandbox, b.identifier('property')),
  root: b.memberExpression(scope.sandbox, b.identifier('root')),
  value: b.memberExpression(scope.sandbox, b.identifier('value')),
};
