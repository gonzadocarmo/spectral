// Covers:
// $[*]
// $.*

import * as b from '../ast/builders.mjs';
import { isDeep, isWildcardExpression } from '../guards.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';

const rootChildrenIdentifier = b.identifier('rootChildren');

export default (tree, ctx) => {
  if (tree.length !== 1 || !isWildcardExpression(tree[0]) || isDeep(tree[0])) {
    return null;
  }

  return [
    [
      b.importSpecifier(rootChildrenIdentifier, rootChildrenIdentifier),
      'module',
    ],
    [rootChildrenIdentifier, 'tree-property'],
    [treeMethodCall(ctx.id), 'body'],
  ];
};
