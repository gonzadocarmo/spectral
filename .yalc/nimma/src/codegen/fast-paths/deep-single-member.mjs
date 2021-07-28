// covers:
// $..test
// $..script

import * as b from '../ast/builders.mjs';
import { isDeep, isMemberExpression } from '../guards.mjs';
import scope from '../templates/scope.mjs';
import fnCall from '../templates/fn-call.mjs';

export default (tree, ctx) => {
  if (tree.length !== 1 || !isDeep(tree[0]) || !isMemberExpression(tree[0])) {
    return null;
  }

  const id = b.stringLiteral(ctx.id);

  return [
    [
      b.blockStatement([
        b.ifStatement(
          b.binaryExpression(
            '===',
            scope.property,
            b.stringLiteral(tree[0].value),
          ),
          b.blockStatement([b.expressionStatement(fnCall)]),
        ),
      ]),
      'tree-method',
    ],
    [id, 'traverse'],
  ];
};
