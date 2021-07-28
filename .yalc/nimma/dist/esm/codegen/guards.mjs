function isMemberExpression(node) {
  return node.type === 'MemberExpression';
}

function isWildcardExpression(node) {
  return node.type === 'WildcardExpression';
}

function isDeep(node) {
  return node.deep;
}

export { isDeep, isMemberExpression, isWildcardExpression };
