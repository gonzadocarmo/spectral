import { expressionStatement, callExpression, memberExpression, identifier, stringLiteral } from '../ast/builders.mjs';
import { scopeIdentifier } from './scope.mjs';

function treeMethodCall(id) {
  const property = stringLiteral(id);
  return expressionStatement(
    callExpression(
      memberExpression(identifier('_tree'), property, true),
      [
        scopeIdentifier,
        memberExpression(identifier('_callbacks'), property, true),
      ],
    ),
  );
}

export default treeMethodCall;
