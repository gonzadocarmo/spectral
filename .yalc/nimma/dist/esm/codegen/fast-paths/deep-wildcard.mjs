import { stringLiteral, identifier, importSpecifier } from '../ast/builders.mjs';
import { isWildcardExpression, isDeep } from '../guards.mjs';

// covers:

const deepWildcardIdentifier = identifier('deepWildcard');
const deepWildcard = importSpecifier(
  deepWildcardIdentifier,
  deepWildcardIdentifier,
);

var deepWildcard$1 = (tree, ctx) => {
  if (tree.length !== 1 || !isWildcardExpression(tree[0]) || !isDeep(tree[0])) {
    return null;
  }

  const id = stringLiteral(ctx.id);

  return [
    [deepWildcard, 'module'],
    [deepWildcardIdentifier, 'tree-property'],
    [id, 'traverse'],
  ];
};

export default deepWildcard$1;
