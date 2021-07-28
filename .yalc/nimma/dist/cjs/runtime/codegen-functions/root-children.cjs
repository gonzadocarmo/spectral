'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function rootChildren(scope, fn) {
  if (scope.path.length === 1) {
    fn(scope);
  }
}

exports.default = rootChildren;
