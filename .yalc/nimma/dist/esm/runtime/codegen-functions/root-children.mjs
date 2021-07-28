function rootChildren(scope, fn) {
  if (scope.path.length === 1) {
    fn(scope);
  }
}

export default rootChildren;
