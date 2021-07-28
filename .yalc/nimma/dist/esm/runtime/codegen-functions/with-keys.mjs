import isObject from './is-object.mjs';

function withKeys(scope, fn) {
  if (isObject(scope.value)) {
    for (const key of Object.keys(scope.value)) {
      fn(scope.fork([...scope.path, key]));
    }
  }
}

export default withKeys;
