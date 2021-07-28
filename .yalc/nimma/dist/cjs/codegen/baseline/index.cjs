'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var index = require('../fast-paths/index.cjs');
var iterator = require('../iterator.cjs');
var scope = require('../templates/scope.cjs');
var fnCall = require('../templates/fn-call.cjs');
var keyedFnCall = require('../templates/keyed-fn-call.cjs');
var withKeysImportSpecifier = require('../templates/with-keys-import-specifier.cjs');
var generators = require('./generators.cjs');
var tree = require('../tree/tree.cjs');

function baseline(jsonPaths) {
  const tree$1 = new tree['default']();
  const hashes = new Map();
  const callbacks = new Map();

  const _callbacks = builders.identifier('_callbacks');

  traverse: for (const [id, ast] of jsonPaths) {
    const ctx = { id };
    tree$1.ctx = ctx;

    const hash = JSON.stringify(ast);
    const existingHash = hashes.get(hash);

    if (existingHash !== void 0) {
      void (
        callbacks.get(existingHash)?.push(id) ??
        callbacks.set(existingHash, [id])
      );

      continue;
    }

    hashes.set(hash, id);

    for (const fastPath of index['default']) {
      const f = fastPath(ast, ctx);
      if (f !== null) {
        tree$1.pushAll(f);
        continue traverse;
      }
    }

    const iterator$1 = new iterator['default'](ast);

    let branch;
    let keyed;
    let bailedDeps;

    for (const node of iterator$1) {
      let treeNode;

      if (!iterator$1.bailed) {
        branch ??= [
          builders.variableDeclaration('let', [
            builders.variableDeclarator(builders.identifier('pos'), builders.numericLiteral(0)),
          ]),
        ];
      }

      if (iterator$1.fixed && iterator$1.pos === 0) {
        const conditionLhsAndRhs = [
          builders.binaryExpression('+', builders.identifier('pos'), scope['default'].depth),
          builders.numericLiteral(iterator$1.length - 1),
        ];

        branch.push(
          builders.ifStatement(
            builders.binaryExpression('!==', ...conditionLhsAndRhs),
            builders.returnStatement(),
          ),
        );
      }

      switch (node.type) {
        case 'MemberExpression':
          treeNode = generators.generateMemberExpression(iterator$1, node);
          break;
        case 'MultipleMemberExpression':
          treeNode = generators.generateMultipleMemberExpression(iterator$1, node);
          break;
        case 'SliceExpression':
          treeNode = generators.generateSliceExpression(iterator$1, node);
          break;
        case 'ScriptExpression':
          throw new SyntaxError('Unsupported');
        case 'ScriptFilterExpression':
          treeNode = generators.generateFilterScriptExpression(iterator$1, node);
          break;
        case 'KeyExpression':
          keyed = true;
          continue;
        case 'WildcardExpression':
          if (iterator$1.bailed) {
            (bailedDeps ??= []).push(
              builders.objectExpression([
                builders.objectProperty(
                  builders.identifier('fn'),
                  builders.arrowFunctionExpression([], builders.booleanLiteral(false)),
                ),
                builders.objectProperty(
                  builders.identifier('deep'),
                  builders.booleanLiteral(node.deep),
                ),
              ]),
            );
          } else if (iterator$1.nextNode === null && !iterator$1.fixed) {
            // nextNode === keyExpression???
            treeNode = builders.sequenceExpression([
              builders.assignmentExpression(
                '=',
                builders.identifier('pos'),
                builders.conditionalExpression(
                  builders.binaryExpression(
                    '<',
                    scope['default'].depth,
                    builders.numericLiteral(iterator$1.pos),
                  ),
                  builders.numericLiteral(-1),
                  scope['default'].depth,
                ),
              ),
              builders.binaryExpression(
                '===',
                builders.identifier('pos'),
                builders.numericLiteral(-1),
              ),
            ]);
            break;
          }

          continue;
        case 'ParentExpression':
          continue;
        default:
          throw new SyntaxError('Unsupported');
      }

      if (iterator$1.bailed) {
        (bailedDeps ??= []).push(
          builders.objectExpression([
            builders.objectProperty(
              builders.identifier('fn'),
              builders.arrowFunctionExpression([scope.scopeIdentifier], treeNode),
            ),
            builders.objectProperty(builders.identifier('deep'), builders.booleanLiteral(node.deep)),
          ]),
        );
      } else {
        branch.push(builders.ifStatement(treeNode, builders.returnStatement()));
      }
    }

    if (!iterator$1.fixed && !iterator$1.bailed) {
      branch.push(
        builders.ifStatement(
          builders.binaryExpression(
            '!==',
            scope['default'].depth,
            iterator$1.pos === 0
              ? builders.identifier('pos')
              : builders.binaryExpression(
                  '+',
                  builders.identifier('pos'),
                  builders.numericLiteral(iterator$1.pos),
                ),
          ),
          builders.returnStatement(),
        ),
      );
    }

    const placement = branch !== void 0 ? 'traverse' : 'body';
    branch ??= [];
    if (keyed) {
      branch.push(builders.expressionStatement(keyedFnCall['default']));
      tree$1.push(withKeysImportSpecifier['default'], 'module');
    } else {
      branch.push(builders.expressionStatement(fnCall['default']));
    }

    if (bailedDeps !== void 0) {
      branch.push(
        builders.expressionStatement(
          builders.callExpression(scope['default'].bail, [
            builders.stringLiteral(id),
            branch.pop().expression.callee,
            builders.arrayExpression(bailedDeps),
          ]),
        ),
      );
    }

    if (placement === 'body') {
      tree$1.push(
        builders.expressionStatement(
          builders.callExpression(
            builders.memberExpression(
              builders.identifier('_tree'),
              builders.stringLiteral(id),
              true,
            ),
            [
              scope.scopeIdentifier,
              builders.memberExpression(_callbacks, builders.stringLiteral(id), true),
            ],
          ),
        ),
        placement,
      );
    } else {
      tree$1.push(builders.stringLiteral(id), placement);
    }

    tree$1.push(builders.blockStatement(branch), 'tree-method');
  }

  tree$1.push(
    builders.objectExpression(
      Array.from(callbacks.entries()).map(([key, values]) =>
        builders.objectProperty(
          builders.stringLiteral(key),
          builders.arrayExpression(values.map(value => builders.stringLiteral(value))),
        ),
      ),
    ),
    'callbacks',
  );

  return tree$1;
}

exports.default = baseline;
