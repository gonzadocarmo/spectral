'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var fnParams = require('./fn-params.cjs');
var scope = require('./scope.cjs');

// fn(scope)

var fnCall = builders.callExpression(fnParams.fnIdentifier, [scope.scopeIdentifier]);

exports.default = fnCall;
