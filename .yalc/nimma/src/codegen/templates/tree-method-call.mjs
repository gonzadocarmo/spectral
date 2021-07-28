import * as b from '../ast/builders.mjs';
import { scopeIdentifier } from './scope.mjs';

export default function treeMethodCall(id) {
  const property = b.stringLiteral(id);
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(b.identifier('_tree'), property, true),
      [
        scopeIdentifier,
        b.memberExpression(b.identifier('_callbacks'), property, true),
      ],
    ),
  );
}
