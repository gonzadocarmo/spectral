'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var deepWildcard = require('./codegen-functions/deep-wildcard.cjs');
var isObject = require('./codegen-functions/is-object.cjs');
var noop = require('./codegen-functions/noop.cjs');
var rootChildren = require('./codegen-functions/root-children.cjs');
var withKeys = require('./codegen-functions/with-keys.cjs');
var scope = require('./scope.cjs');



exports.deepWildcard = deepWildcard['default'];
exports.isObject = isObject['default'];
exports.noop = noop['default'];
exports.rootChildren = rootChildren['default'];
exports.withKeys = withKeys['default'];
exports.Scope = scope.Scope;
