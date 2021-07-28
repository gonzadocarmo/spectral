import { memberExpression, identifier } from '../ast/builders.mjs';
import scope from './scope.mjs';

var sandbox = {
  parent: memberExpression(scope.sandbox, identifier('parent')),
  parentProperty: memberExpression(
    scope.sandbox,
    identifier('parentProperty'),
  ),
  property: memberExpression(scope.sandbox, identifier('property')),
  root: memberExpression(scope.sandbox, identifier('root')),
  value: memberExpression(scope.sandbox, identifier('value')),
};

export default sandbox;
