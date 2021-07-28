import { importSpecifier, identifier } from '../ast/builders.mjs';
import { isWildcardExpression, isDeep } from '../guards.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';

// Covers:

const rootChildrenIdentifier = identifier('rootChildren');

var topLevelWildcard = (tree, ctx) => {
  if (tree.length !== 1 || !isWildcardExpression(tree[0]) || isDeep(tree[0])) {
    return null;
  }

  return [
    [
      importSpecifier(rootChildrenIdentifier, rootChildrenIdentifier),
      'module',
    ],
    [rootChildrenIdentifier, 'tree-property'],
    [treeMethodCall(ctx.id), 'body'],
  ];
};

export default topLevelWildcard;
