import { Scope, isObject } from 'nimma/runtime';
export const tree = {
  '$.paths[*][get,put,post,delete,options,head,patch,trace]': function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 2) return;
    if (scope.path[pos] !== 'paths') return;
    if (
      scope.path[pos + 2] !== 'get' &&
      scope.path[pos + 2] !== 'put' &&
      scope.path[pos + 2] !== 'post' &&
      scope.path[pos + 2] !== 'delete' &&
      scope.path[pos + 2] !== 'options' &&
      scope.path[pos + 2] !== 'head' &&
      scope.path[pos + 2] !== 'patch' &&
      scope.path[pos + 2] !== 'trace'
    )
      return;
    fn(scope);
  },
  '$.paths[*][get,put,post,delete,options,head,patch,trace].parameters': function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 3) return;
    if (scope.path[pos] !== 'paths') return;
    if (
      scope.path[pos + 2] !== 'get' &&
      scope.path[pos + 2] !== 'put' &&
      scope.path[pos + 2] !== 'post' &&
      scope.path[pos + 2] !== 'delete' &&
      scope.path[pos + 2] !== 'options' &&
      scope.path[pos + 2] !== 'head' &&
      scope.path[pos + 2] !== 'patch' &&
      scope.path[pos + 2] !== 'trace'
    )
      return;
    if (scope.path[pos + 3] !== 'parameters') return;
    fn(scope);
  },
  '$..enum': function (scope, fn) {
    if (scope.property === 'enum') {
      fn(scope);
    }
  },
  "$..[?(@property === 'description' || @property === 'title')]": function (scope, fn) {
    if (!(scope.sandbox.property === 'description' || scope.sandbox.property === 'title')) return;
    fn(scope);
  },
  '$.paths': function (scope, fn) {
    const value = scope.sandbox.root;
    if (isObject(value)) fn(scope.fork(['paths']));
  },
  '$..[?(@ && @.enum && @.type)]': function (scope, fn) {
    if (!(scope.sandbox.value && scope.sandbox.value.enum && scope.sandbox.value.type)) return;
    fn(scope);
  },
  '$.servers[*].url': function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 2) return;
    if (scope.path[pos] !== 'servers') return;
    if (scope.path[pos + 2] !== 'url') return;
    fn(scope);
  },
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _callbacks.$(scope);
    _tree['$.paths'](scope, _callbacks['$.paths']);
    for (const path of [
      // "$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
      // "$..content..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
      // "$..headers..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
      // "$..parameters..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0) && (@.enum || @.type || @.format || @.$ref || @.properties || @.items))]",
    ]) {
      Function(`return (input, path, fn) => {
            console.log(path);
            global[Symbol.for('@stoplight/spectral/jsonpath-plus')]({
                path,
                json: input,
                resultType: 'all',
                callback: (result => void fn({
                    path: global[Symbol.for('@stoplight/spectral/toPath')](result.path.slice(1)),
                    value: result.value,
                })),
            });
        }`)()(input, path, _callbacks[path]);
    }
    scope.traverse(() => {
      _tree['$.paths[*][get,put,post,delete,options,head,patch,trace]'](
        scope,
        _callbacks['$.paths[*][get,put,post,delete,options,head,patch,trace]'],
      );
      _tree['$.paths[*][get,put,post,delete,options,head,patch,trace].parameters'](
        scope,
        _callbacks['$.paths[*][get,put,post,delete,options,head,patch,trace].parameters'],
      );
      _tree['$..enum'](scope, _callbacks['$..enum']);
      _tree["$..[?(@property === 'description' || @property === 'title')]"](
        scope,
        _callbacks["$..[?(@property === 'description' || @property === 'title')]"],
      );
      _tree['$..[?(@ && @.enum && @.type)]'](scope, _callbacks['$..[?(@ && @.enum && @.type)]']);
      _tree['$.servers[*].url'](scope, _callbacks['$.servers[*].url']);
    });
  } finally {
    scope.destroy();
  }
}
