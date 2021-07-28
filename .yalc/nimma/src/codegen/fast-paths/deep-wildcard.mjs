// covers:
// $..[*]
// $..*

import * as b from '../ast/builders.mjs';
import { isDeep, isWildcardExpression } from '../guards.mjs';

const deepWildcardIdentifier = b.identifier('deepWildcard');
const deepWildcard = b.importSpecifier(
  deepWildcardIdentifier,
  deepWildcardIdentifier,
);

export default (tree, ctx) => {
  if (tree.length !== 1 || !isWildcardExpression(tree[0]) || !isDeep(tree[0])) {
    return null;
  }

  const id = b.stringLiteral(ctx.id);

  return [
    [deepWildcard, 'module'],
    [deepWildcardIdentifier, 'tree-property'],
    [id, 'traverse'],
  ];
};
