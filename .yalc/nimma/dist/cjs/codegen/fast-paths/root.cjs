'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var scope = require('../templates/scope.cjs');

// covers: $

var root = tree => {
  if (tree.length > 0) {
    return null;
  }

  return [
    [
      builders.callExpression(
        builders.memberExpression(builders.identifier('_callbacks'), builders.identifier('$')),
        [scope.scopeIdentifier],
      ),
      'body',
    ],
  ];
};

exports.default = root;
