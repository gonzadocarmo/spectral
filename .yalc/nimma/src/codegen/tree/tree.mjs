import * as b from '../ast/builders.mjs';
import scope, { scopeIdentifier } from '../templates/scope.mjs';
import astring from '../astring.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';
import fnParams from '../templates/fn-params.mjs';

const params = [b.identifier('input'), b.identifier('callbacks')];

const newScope = b.variableDeclaration('const', [
  b.variableDeclarator(
    scopeIdentifier,
    b.newExpression(b.identifier('Scope'), [params[0]]),
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

export default class ESTree {
  #tree = b.objectExpression([]);
  #module = new Set([
    b.importSpecifier(b.identifier('Scope'), b.identifier('Scope')),
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
          b.objectMethod(
            'method',
            b.stringLiteral(this.ctx.id),
            fnParams,
            node,
          ),
        );
        break;
      case 'tree-property':
        this.#tree.properties.push(
          b.objectProperty(b.stringLiteral(this.ctx.id), node),
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
        this.#traverse.add(treeMethodCall(node.value));
        break;
    }
  }

  pushAll(items) {
    for (const item of items) {
      this.push(...item);
    }
  }

  toString() {
    const proxyTree = b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier('_tree'),
        b.callExpression(scope.proxyTree, [b.identifier('tree')]),
      ),
    ]);

    return astring(
      b.program([
        b.importDeclaration(
          [...this.#module],
          b.stringLiteral('nimma/runtime'),
        ),
        this.#tree.properties.length === 0
          ? b.emptyStatement()
          : b.variableDeclaration('const', [
              b.variableDeclarator(b.identifier('tree'), this.#tree),
            ]),
        b.exportDefaultDeclaration(
          b.functionDeclaration(
            null,
            params,
            b.blockStatement([
              newScope,
              this.#tree.properties.length === 0
                ? b.emptyStatement()
                : proxyTree,
              b.variableDeclaration('const', [
                b.variableDeclarator(
                  b.identifier('_callbacks'),
                  b.callExpression(scope.proxyCallbacks, [
                    b.identifier('callbacks'),
                    this.#callbacks ?? b.objectExpression([]),
                  ]),
                ),
              ]),
              b.tryStatement(
                b.blockStatement([
                  ...this.#body,
                  this.#traverse.size === 0
                    ? b.emptyStatement()
                    : b.expressionStatement(
                        b.callExpression(scope.traverse, [
                          b.arrowFunctionExpression(
                            [],
                            b.blockStatement(Array.from(this.#traverse)),
                          ),
                        ]),
                      ),
                ]),
                null,
                b.blockStatement([
                  b.expressionStatement(b.callExpression(scope.destroy, [])),
                ]),
              ),
            ]),
          ),
        ),
      ]),
    );
  }
}
