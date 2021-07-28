'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./baseline/index.cjs');

function codegen (expressions) {
  return index['default'](expressions);
}

exports.default = codegen;
