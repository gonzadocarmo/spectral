import { objectExpression, importSpecifier, identifier, objectProperty, stringLiteral, objectMethod, program, importDeclaration, emptyStatement, variableDeclaration, variableDeclarator, exportDefaultDeclaration, functionDeclaration, blockStatement, callExpression, tryStatement, expressionStatement, arrowFunctionExpression, newExpression } from '../ast/builders.mjs';
import scope, { scopeIdentifier } from '../templates/scope.mjs';
import astring from '../astring.mjs';
import treeMethodCall from '../templates/tree-method-call.mjs';
import fnParams from '../templates/fn-params.mjs';

const params = [identifier('input'), identifier('callbacks')];

const newScope = variableDeclaration('const', [
  variableDeclarator(
    scopeIdentifier,
    newExpression(identifier('Scope'), [params[0]]),
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
  #tree = objectExpression([]);
  #module = new Set([
    importSpecifier(identifier('Scope'), identifier('Scope')),
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
          objectMethod(
            'method',
            stringLiteral(this.ctx.id),
            fnParams,
            node,
          ),
        );
        break;
      case 'tree-property':
        this.#tree.properties.push(
          objectProperty(stringLiteral(this.ctx.id), node),
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
    const proxyTree = variableDeclaration('const', [
      variableDeclarator(
        identifier('_tree'),
        callExpression(scope.proxyTree, [identifier('tree')]),
      ),
    ]);

    return astring(
      program([
        importDeclaration(
          [...this.#module],
          stringLiteral('nimma/runtime'),
        ),
        this.#tree.properties.length === 0
          ? emptyStatement()
          : variableDeclaration('const', [
              variableDeclarator(identifier('tree'), this.#tree),
            ]),
        exportDefaultDeclaration(
          functionDeclaration(
            null,
            params,
            blockStatement([
              newScope,
              this.#tree.properties.length === 0
                ? emptyStatement()
                : proxyTree,
              variableDeclaration('const', [
                variableDeclarator(
                  identifier('_callbacks'),
                  callExpression(scope.proxyCallbacks, [
                    identifier('callbacks'),
                    this.#callbacks ?? objectExpression([]),
                  ]),
                ),
              ]),
              tryStatement(
                blockStatement([
                  ...this.#body,
                  this.#traverse.size === 0
                    ? emptyStatement()
                    : expressionStatement(
                        callExpression(scope.traverse, [
                          arrowFunctionExpression(
                            [],
                            blockStatement(Array.from(this.#traverse)),
                          ),
                        ]),
                      ),
                ]),
                null,
                blockStatement([
                  expressionStatement(callExpression(scope.destroy, [])),
                ]),
              ),
            ]),
          ),
        ),
      ]),
    );
  }
}

export default ESTree;
