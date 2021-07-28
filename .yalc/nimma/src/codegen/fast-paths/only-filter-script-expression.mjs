import * as b from '../ast/builders.mjs';
import fnCall from '../templates/fn-call.mjs';
import { rewriteESTree } from '../baseline/generators.mjs';
import jsep from '../../parser/jsep/index.js';
import treeMethodCall from '../templates/tree-method-call.mjs';
import { isDeep } from '../guards.mjs';

// covers:
// $..[?(@.bar])
// $[?(@.bar])

// function (scope, fn) {
//  if ('bar' in scope.sandbox.value) {
//    fn(scope);
//  }
// }

export default (nodes, ctx) => {
  if (nodes.length !== 1 || nodes[0].type !== 'ScriptFilterExpression') {
    return null;
  }

  const condition = b.unaryExpression(
    '!',
    rewriteESTree(jsep(nodes[0].value)),
    true,
  );

  return [
    [
      b.blockStatement([b.ifStatement(condition, b.returnStatement()), fnCall]),
      'tree-method',
    ],
    [
      isDeep(nodes[0]) ? b.stringLiteral(ctx.id) : treeMethodCall(ctx.id),
      isDeep(nodes[0]) ? 'traverse' : 'body',
    ],
  ];
};
