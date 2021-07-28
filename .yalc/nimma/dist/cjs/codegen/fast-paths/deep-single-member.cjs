'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var guards = require('../guards.cjs');
var scope = require('../templates/scope.cjs');
var fnCall = require('../templates/fn-call.cjs');

// covers:

var deepSingleMember = (tree, ctx) => {
  if (tree.length !== 1 || !guards.isDeep(tree[0]) || !guards.isMemberExpression(tree[0])) {
    return null;
  }

  const id = builders.stringLiteral(ctx.id);

  return [
    [
      builders.blockStatement([
        builders.ifStatement(
          builders.binaryExpression(
            '===',
            scope['default'].property,
            builders.stringLiteral(tree[0].value),
          ),
          builders.blockStatement([builders.expressionStatement(fnCall['default'])]),
        ),
      ]),
      'tree-method',
    ],
    [id, 'traverse'],
  ];
};

exports.default = deepSingleMember;
