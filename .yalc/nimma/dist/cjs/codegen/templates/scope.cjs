'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');

const scopeIdentifier = builders.identifier('scope');

var scope = {
  bail: builders.memberExpression(scopeIdentifier, builders.identifier('bail')),
  depth: builders.memberExpression(scopeIdentifier, builders.identifier('depth')),
  destroy: builders.memberExpression(scopeIdentifier, builders.identifier('destroy')),
  fork: builders.memberExpression(scopeIdentifier, builders.identifier('fork')),
  path: builders.memberExpression(scopeIdentifier, builders.identifier('path')),
  property: builders.memberExpression(scopeIdentifier, builders.identifier('property')),
  proxyCallbacks: builders.memberExpression(
    scopeIdentifier,
    builders.identifier('proxyCallbacks'),
  ),
  proxyTree: builders.memberExpression(scopeIdentifier, builders.identifier('proxyTree')),
  sandbox: builders.memberExpression(scopeIdentifier, builders.identifier('sandbox')),
  traverse: builders.memberExpression(scopeIdentifier, builders.identifier('traverse')),
  value: builders.memberExpression(scopeIdentifier, builders.identifier('value')),
};

exports.default = scope;
exports.scopeIdentifier = scopeIdentifier;
