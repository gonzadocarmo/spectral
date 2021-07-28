'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isObject = require('./is-object.cjs');

function withKeys(scope, fn) {
  if (isObject['default'](scope.value)) {
    for (const key of Object.keys(scope.value)) {
      fn(scope.fork([...scope.path, key]));
    }
  }
}

exports.default = withKeys;
