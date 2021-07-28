import { stringLiteral, blockStatement, ifStatement, binaryExpression, expressionStatement } from '../ast/builders.mjs';
import { isDeep, isMemberExpression } from '../guards.mjs';
import scope from '../templates/scope.mjs';
import fnCall from '../templates/fn-call.mjs';

// covers:

var deepSingleMember = (tree, ctx) => {
  if (tree.length !== 1 || !isDeep(tree[0]) || !isMemberExpression(tree[0])) {
    return null;
  }

  const id = stringLiteral(ctx.id);

  return [
    [
      blockStatement([
        ifStatement(
          binaryExpression(
            '===',
            scope.property,
            stringLiteral(tree[0].value),
          ),
          blockStatement([expressionStatement(fnCall)]),
        ),
      ]),
      'tree-method',
    ],
    [id, 'traverse'],
  ];
};

export default deepSingleMember;
