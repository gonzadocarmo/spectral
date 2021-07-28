import { unaryExpression, blockStatement, stringLiteral, ifStatement, returnStatement } from '../ast/builders.mjs';
import fnCall from '../templates/fn-call.mjs';
import { rewriteESTree } from '../baseline/generators.mjs';
import jsep from '../../parser/jsep/jsep.mjs';
import '../../parser/jsep/plugins/ternary/ternary.mjs';
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

var onlyFilterScriptExpression = (nodes, ctx) => {
  if (nodes.length !== 1 || nodes[0].type !== 'ScriptFilterExpression') {
    return null;
  }

  const condition = unaryExpression(
    '!',
    rewriteESTree(jsep(nodes[0].value)),
    true,
  );

  return [
    [
      blockStatement([ifStatement(condition, returnStatement()), fnCall]),
      'tree-method',
    ],
    [
      isDeep(nodes[0]) ? stringLiteral(ctx.id) : treeMethodCall(ctx.id),
      isDeep(nodes[0]) ? 'traverse' : 'body',
    ],
  ];
};

export default onlyFilterScriptExpression;
