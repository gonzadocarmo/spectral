'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var deepSingleMember = require('./deep-single-member.cjs');
var deepWildcard = require('./deep-wildcard.cjs');
var fixed = require('./fixed.cjs');
var onlyFilterScriptExpression = require('./only-filter-script-expression.cjs');
var root = require('./root.cjs');
var topLevelWildcard = require('./top-level-wildcard.cjs');

var fastPaths = [
  root['default'],
  onlyFilterScriptExpression['default'],
  deepSingleMember['default'],
  deepWildcard['default'],
  topLevelWildcard['default'],
  fixed['default'],
];

exports.default = fastPaths;
