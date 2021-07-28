'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var scope = require('./scope.cjs');

const fnIdentifier = builders.identifier('fn');

// scope, fn
var fnParams = [scope.scopeIdentifier, fnIdentifier];

exports.default = fnParams;
exports.fnIdentifier = fnIdentifier;
