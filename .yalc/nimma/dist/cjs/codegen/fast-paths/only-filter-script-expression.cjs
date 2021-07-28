'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var fnCall = require('../templates/fn-call.cjs');
var generators = require('../baseline/generators.cjs');
var jsep = require('../../parser/jsep/jsep.cjs');
require('../../parser/jsep/plugins/ternary/ternary.cjs');
var treeMethodCall = require('../templates/tree-method-call.cjs');
var guards = require('../guards.cjs');

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

  const condition = builders.unaryExpression(
    '!',
    generators.rewriteESTree(jsep['default'](nodes[0].value)),
    true,
  );

  return [
    [
      builders.blockStatement([builders.ifStatement(condition, builders.returnStatement()), fnCall['default']]),
      'tree-method',
    ],
    [
      guards.isDeep(nodes[0]) ? builders.stringLiteral(ctx.id) : treeMethodCall['default'](ctx.id),
      guards.isDeep(nodes[0]) ? 'traverse' : 'body',
    ],
  ];
};

exports.default = onlyFilterScriptExpression;
