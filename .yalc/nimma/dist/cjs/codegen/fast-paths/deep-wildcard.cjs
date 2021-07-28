'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var guards = require('../guards.cjs');

// covers:

const deepWildcardIdentifier = builders.identifier('deepWildcard');
const deepWildcard = builders.importSpecifier(
  deepWildcardIdentifier,
  deepWildcardIdentifier,
);

var deepWildcard$1 = (tree, ctx) => {
  if (tree.length !== 1 || !guards.isWildcardExpression(tree[0]) || !guards.isDeep(tree[0])) {
    return null;
  }

  const id = builders.stringLiteral(ctx.id);

  return [
    [deepWildcard, 'module'],
    [deepWildcardIdentifier, 'tree-property'],
    [id, 'traverse'],
  ];
};

exports.default = deepWildcard$1;
