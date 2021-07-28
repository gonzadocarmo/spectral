'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var scope = require('./scope.cjs');

function treeMethodCall(id) {
  const property = builders.stringLiteral(id);
  return builders.expressionStatement(
    builders.callExpression(
      builders.memberExpression(builders.identifier('_tree'), property, true),
      [
        scope.scopeIdentifier,
        builders.memberExpression(builders.identifier('_callbacks'), property, true),
      ],
    ),
  );
}

exports.default = treeMethodCall;
