// Examples
// $.info
// $.info.foo
// $.foo.bar.baz
/**
 *  function (scope, fn) {
 *    const value = scope.sandbox.root?.info;
 *    if (isObject(value)) {
 *      fn(scope.fork(['info', 'foo']));
 *    }
 *  }
 */

import * as b from '../ast/builders.mjs';
import { fnIdentifier } from '../templates/fn-params.mjs';
import { isDeep, isMemberExpression } from '../guards.mjs';
import sandbox from '../templates/sandbox.mjs';
import scope from '../templates/scope.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';

const valueIdentifier = b.identifier('value');
const isObjectIdentifier = b.identifier('isObject');
const isObjectSpecifier = b.importSpecifier(
  isObjectIdentifier,
  isObjectIdentifier,
);
const isObjectCallExpression = b.callExpression(isObjectIdentifier, [
  valueIdentifier,
]);

export default (tree, ctx) => {
  if (!tree.every(isMemberExpression) || tree.some(isDeep)) {
    return null;
  }

  const valueDeclaration = b.variableDeclaration('const', [
    b.variableDeclarator(
      valueIdentifier,
      tree
        .slice(0, -1)
        .reduce(
          (object, node) =>
            b.memberExpression(object, b.stringLiteral(node.value), true, true),
          sandbox.root,
        ),
    ),
  ]);

  return [
    [isObjectSpecifier, 'module'],
    [
      b.blockStatement([
        valueDeclaration,
        b.ifStatement(
          isObjectCallExpression,
          b.expressionStatement(
            b.callExpression(fnIdentifier, [
              b.callExpression(scope.fork, [
                b.arrayExpression(
                  tree.map(node => b.stringLiteral(node.value)),
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
