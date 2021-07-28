'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isMemberExpression(node) {
  return node.type === 'MemberExpression';
}

function isWildcardExpression(node) {
  return node.type === 'WildcardExpression';
}

function isDeep(node) {
  return node.deep;
}

exports.isDeep = isDeep;
exports.isMemberExpression = isMemberExpression;
exports.isWildcardExpression = isWildcardExpression;
