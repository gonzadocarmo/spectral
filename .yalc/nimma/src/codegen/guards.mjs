export function isMemberExpression(node) {
  return node.type === 'MemberExpression';
}

export function isScriptExpression(node) {
  return (
    node.type === 'ScriptExpression' || node.type === 'ScriptFilterExpression'
  );
}

export function isWildcardExpression(node) {
  return node.type === 'WildcardExpression';
}

export function isDeep(node) {
  return node.deep;
}
