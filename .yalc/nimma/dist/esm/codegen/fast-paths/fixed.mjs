import { variableDeclaration, variableDeclarator, memberExpression, stringLiteral, blockStatement, ifStatement, expressionStatement, callExpression, arrayExpression, identifier, importSpecifier } from '../ast/builders.mjs';
import { fnIdentifier } from '../templates/fn-params.mjs';
import { isMemberExpression, isDeep } from '../guards.mjs';
import sandbox from '../templates/sandbox.mjs';
import scope from '../templates/scope.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';

// Examples

const valueIdentifier = identifier('value');
const isObjectIdentifier = identifier('isObject');
const isObjectSpecifier = importSpecifier(
  isObjectIdentifier,
  isObjectIdentifier,
);
const isObjectCallExpression = callExpression(isObjectIdentifier, [
  valueIdentifier,
]);

var fixed = (tree, ctx) => {
  if (!tree.every(isMemberExpression) || tree.some(isDeep)) {
    return null;
  }

  const valueDeclaration = variableDeclaration('const', [
    variableDeclarator(
      valueIdentifier,
      tree
        .slice(0, -1)
        .reduce(
          (object, node) =>
            memberExpression(object, stringLiteral(node.value), true, true),
          sandbox.root,
        ),
    ),
  ]);

  return [
    [isObjectSpecifier, 'module'],
    [
      blockStatement([
        valueDeclaration,
        ifStatement(
          isObjectCallExpression,
          expressionStatement(
            callExpression(fnIdentifier, [
              callExpression(scope.fork, [
                arrayExpression(
                  tree.map(node => stringLiteral(node.value)),
                ),
              ]),
            ]),
          ),
        ),
      ]),
      'tree-method',
    ],
    [treeMethodCall(ctx.id), 'body'],
  ];
};

export default fixed;
