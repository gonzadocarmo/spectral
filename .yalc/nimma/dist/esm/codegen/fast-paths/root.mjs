import { callExpression, memberExpression, identifier } from '../ast/builders.mjs';
import { scopeIdentifier } from '../templates/scope.mjs';

// covers: $

var root = tree => {
  if (tree.length > 0) {
    return null;
  }

  return [
    [
      callExpression(
        memberExpression(identifier('_callbacks'), identifier('$')),
        [scopeIdentifier],
      ),
      'body',
    ],
  ];
};

export default root;
