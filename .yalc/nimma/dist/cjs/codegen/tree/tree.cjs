'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var scope = require('../templates/scope.cjs');
var astring = require('../astring.cjs');
var treeMethodCall = require('../templates/tree-method-call.cjs');
var fnParams = require('../templates/fn-params.cjs');

const params = [builders.identifier('input'), builders.identifier('callbacks')];

const newScope = builders.variableDeclaration('const', [
  builders.variableDeclarator(
    scope.scopeIdentifier,
    builders.newExpression(builders.identifier('Scope'), [params[0]]),
  ),
]);

/*
import {
 // deps
} from 'nimma/runtime';
// placement: tree
const tree = {};

// placement: program

export default function (input, callbacks) {
  const scope = new Scope(input);

  try {
    // placement: body

    scope.traverse(() => {
      // placement: traverse
    });
  } finally {
    scope.destroy();
  }
}
*/

class ESTree {
  #tree = builders.objectExpression([]);
  #module = new Set([
    builders.importSpecifier(builders.identifier('Scope'), builders.identifier('Scope')),
  ]);
  #body = new Set();
  #traverse = new Set();
  #callbacks = null;

  constructor() {
    this.ctx = null;
  }

  push(node, placement) {
    switch (placement) {
      case 'tree-method':
        this.#tree.properties.push(
          builders.objectMethod(
            'method',
            builders.stringLiteral(this.ctx.id),
            fnParams['default'],
            node,
          ),
        );
        break;
      case 'tree-property':
        this.#tree.properties.push(
          builders.objectProperty(builders.stringLiteral(this.ctx.id), node),
        );
        break;
      case 'module':
        for (const mod of this.#module) {
          if (mod.local.name === node.local.name) {
            return;
          }
        }

        this.#module.add(node);
        break;
      case 'body':
        this.#body.add(node);
        break;
      case 'callbacks':
        this.#callbacks = node;
        break;
      case 'traverse':
        this.#traverse.add(treeMethodCall['default'](node.value));
        break;
    }
  }

  pushAll(items) {
    for (const item of items) {
      this.push(...item);
    }
  }

  toString() {
    const proxyTree = builders.variableDeclaration('const', [
      builders.variableDeclarator(
        builders.identifier('_tree'),
        builders.callExpression(scope['default'].proxyTree, [builders.identifier('tree')]),
      ),
    ]);

    return astring['default'](
      builders.program([
        builders.importDeclaration(
          [...this.#module],
          builders.stringLiteral('nimma/runtime'),
        ),
        this.#tree.properties.length === 0
          ? builders.emptyStatement()
          : builders.variableDeclaration('const', [
              builders.variableDeclarator(builders.identifier('tree'), this.#tree),
            ]),
        builders.exportDefaultDeclaration(
          builders.functionDeclaration(
            null,
            params,
            builders.blockStatement([
              newScope,
              this.#tree.properties.length === 0
                ? builders.emptyStatement()
                : proxyTree,
              builders.variableDeclaration('const', [
                builders.variableDeclarator(
                  builders.identifier('_callbacks'),
                  builders.callExpression(scope['default'].proxyCallbacks, [
                    builders.identifier('callbacks'),
                    this.#callbacks ?? builders.objectExpression([]),
                  ]),
                ),
              ]),
              builders.tryStatement(
                builders.blockStatement([
                  ...this.#body,
                  this.#traverse.size === 0
                    ? builders.emptyStatement()
                    : builders.expressionStatement(
                        builders.callExpression(scope['default'].traverse, [
                          builders.arrowFunctionExpression(
                            [],
                            builders.blockStatement(Array.from(this.#traverse)),
                          ),
                        ]),
                      ),
                ]),
                null,
                builders.blockStatement([
                  builders.expressionStatement(builders.callExpression(scope['default'].destroy, [])),
                ]),
              ),
            ]),
          ),
        ),
      ]),
    );
  }
}

exports.default = ESTree;
