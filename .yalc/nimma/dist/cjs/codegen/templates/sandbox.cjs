'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var scope = require('./scope.cjs');

var sandbox = {
  parent: builders.memberExpression(scope['default'].sandbox, builders.identifier('parent')),
  parentProperty: builders.memberExpression(
    scope['default'].sandbox,
    builders.identifier('parentProperty'),
  ),
  property: builders.memberExpression(scope['default'].sandbox, builders.identifier('property')),
  root: builders.memberExpression(scope['default'].sandbox, builders.identifier('root')),
  value: builders.memberExpression(scope['default'].sandbox, builders.identifier('value')),
};

exports.default = sandbox;
