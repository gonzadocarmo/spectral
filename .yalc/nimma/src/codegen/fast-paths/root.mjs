// covers: $

import * as b from '../ast/builders.mjs';
import { scopeIdentifier } from '../templates/scope.mjs';

export default tree => {
  if (tree.length > 0) {
    return null;
  }

  return [
    [
      b.callExpression(
        b.memberExpression(b.identifier('_callbacks'), b.identifier('$')),
        [scopeIdentifier],
      ),
      'body',
    ],
  ];
};
