import * as b from '../ast/builders.mjs';

export const scopeIdentifier = b.identifier('scope');

export default {
  bail: b.memberExpression(scopeIdentifier, b.identifier('bail')),
  depth: b.memberExpression(scopeIdentifier, b.identifier('depth')),
  destroy: b.memberExpression(scopeIdentifier, b.identifier('destroy')),
  fork: b.memberExpression(scopeIdentifier, b.identifier('fork')),
  path: b.memberExpression(scopeIdentifier, b.identifier('path')),
  property: b.memberExpression(scopeIdentifier, b.identifier('property')),
  proxyCallbacks: b.memberExpression(
    scopeIdentifier,
    b.identifier('proxyCallbacks'),
  ),
  proxyTree: b.memberExpression(scopeIdentifier, b.identifier('proxyTree')),
  sandbox: b.memberExpression(scopeIdentifier, b.identifier('sandbox')),
  traverse: b.memberExpression(scopeIdentifier, b.identifier('traverse')),
  value: b.memberExpression(scopeIdentifier, b.identifier('value')),
};
