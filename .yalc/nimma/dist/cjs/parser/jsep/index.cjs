'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsep = require('./jsep.cjs');
require('./plugins/ternary/ternary.cjs');

// Add default plugins:

exports.Jsep = jsep.Jsep;
exports.default = jsep['default'];
