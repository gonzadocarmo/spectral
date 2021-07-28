'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var guards = require('../guards.cjs');
var treeMethodCall = require('../templates/tree-method-call.cjs');

// Covers:

const rootChildrenIdentifier = builders.identifier('rootChildren');

var topLevelWildcard = (tree, ctx) => {
  if (tree.length !== 1 || !guards.isWildcardExpression(tree[0]) || guards.isDeep(tree[0])) {
    return null;
  }

  return [
    [
      builders.importSpecifier(rootChildrenIdentifier, rootChildrenIdentifier),
      'module',
    ],
    [rootChildrenIdentifier, 'tree-property'],
    [treeMethodCall['default'](ctx.id), 'body'],
  ];
};

exports.default = topLevelWildcard;
