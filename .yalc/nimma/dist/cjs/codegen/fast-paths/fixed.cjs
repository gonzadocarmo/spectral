'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var fnParams = require('../templates/fn-params.cjs');
var guards = require('../guards.cjs');
var sandbox = require('../templates/sandbox.cjs');
var scope = require('../templates/scope.cjs');
var treeMethodCall = require('../templates/tree-method-call.cjs');

// Examples

const valueIdentifier = builders.identifier('value');
const isObjectIdentifier = builders.identifier('isObject');
const isObjectSpecifier = builders.importSpecifier(
  isObjectIdentifier,
  isObjectIdentifier,
);
const isObjectCallExpression = builders.callExpression(isObjectIdentifier, [
  valueIdentifier,
]);

var fixed = (tree, ctx) => {
  if (!tree.every(guards.isMemberExpression) || tree.some(guards.isDeep)) {
    return null;
  }

  const valueDeclaration = builders.variableDeclaration('const', [
    builders.variableDeclarator(
      valueIdentifier,
      tree
        .slice(0, -1)
        .reduce(
          (object, node) =>
            builders.memberExpression(object, builders.stringLiteral(node.value), true, true),
          sandbox['default'].root,
        ),
    ),
  ]);

  return [
    [isObjectSpecifier, 'module'],
    [
      builders.blockStatement([
        valueDeclaration,
        builders.ifStatement(
          isObjectCallExpression,
          builders.expressionStatement(
            builders.callExpression(fnParams.fnIdentifier, [
              builders.callExpression(scope['default'].fork, [
                builders.arrayExpression(
                  tree.map(node => builders.stringLiteral(node.value)),
                ),
              ]),
            ]),
          ),
        ),
      ]),
      'tree-method',
    ],
    [treeMethodCall['default'](ctx.id), 'body'],
  ];
};

exports.default = fixed;
