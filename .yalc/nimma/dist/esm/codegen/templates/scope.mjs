import { memberExpression, identifier } from '../ast/builders.mjs';

const scopeIdentifier = identifier('scope');

var scope = {
  bail: memberExpression(scopeIdentifier, identifier('bail')),
  depth: memberExpression(scopeIdentifier, identifier('depth')),
  destroy: memberExpression(scopeIdentifier, identifier('destroy')),
  fork: memberExpression(scopeIdentifier, identifier('fork')),
  path: memberExpression(scopeIdentifier, identifier('path')),
  property: memberExpression(scopeIdentifier, identifier('property')),
  proxyCallbacks: memberExpression(
    scopeIdentifier,
    identifier('proxyCallbacks'),
  ),
  proxyTree: memberExpression(scopeIdentifier, identifier('proxyTree')),
  sandbox: memberExpression(scopeIdentifier, identifier('sandbox')),
  traverse: memberExpression(scopeIdentifier, identifier('traverse')),
  value: memberExpression(scopeIdentifier, identifier('value')),
};

export default scope;
export { scopeIdentifier };
