'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var fnParams = require('./fn-params.cjs');
var scope = require('./scope.cjs');

var keyedFnCall = builders.callExpression(builders.identifier('withKeys'), [
  scope.scopeIdentifier,
  fnParams.fnIdentifier,
]);

exports.default = keyedFnCall;
