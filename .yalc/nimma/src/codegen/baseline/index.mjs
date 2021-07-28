import * as b from '../ast/builders.mjs';
import fastPaths from '../fast-paths/index.mjs';
import Iterator from '../iterator.mjs';
import fnParams from '../templates/fn-params.mjs';
import fnCall from '../templates/fn-call.mjs';
import keyedFnCall from '../templates/keyed-fn-call.mjs';
import withKeysImportSpecifier from '../templates/with-keys-import-specifier.mjs';
import {
  generateFilterScriptExpression,
  generateMemberExpression,
  generateMultipleMemberExpression,
  generateSliceExpression,
} from './generators.mjs';
import scope, { scopeIdentifier } from '../templates/scope.mjs';
import ESTree from '../tree/tree.mjs';
import { isDeep } from '../guards.mjs';

export default function baseline(jsonPaths) {
  const tree = new ESTree();
  const hashes = new Map();
  const callbacks = new Map();

  const _callbacks = b.identifier('_callbacks');

  traverse: for (const [id, ast] of jsonPaths) {
    const ctx = { id };
    tree.ctx = ctx;

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

    for (const fastPath of fastPaths) {
      const f = fastPath(ast, ctx);
      if (f !== null) {
        tree.pushAll(f);
        continue traverse;
      }
    }

    const iterator = new Iterator(ast);

    let branch;
    let keyed;
    let bailedDeps;

    for (const node of iterator) {
      let treeNode;

      if (!iterator.bailed) {
        branch ??= [
          b.variableDeclaration('let', [
            b.variableDeclarator(b.identifier('pos'), b.numericLiteral(0)),
          ]),
        ];
      }

      if (iterator.fixed && iterator.pos === 0) {
        const conditionLhsAndRhs = [
          b.binaryExpression('+', b.identifier('pos'), scope.depth),
          b.numericLiteral(iterator.length - 1),
        ];

        branch.push(
          b.ifStatement(
            b.binaryExpression('!==', ...conditionLhsAndRhs),
            b.returnStatement(),
          ),
        );
      }

      switch (node.type) {
        case 'MemberExpression':
          treeNode = generateMemberExpression(iterator, node);
          break;
        case 'MultipleMemberExpression':
          treeNode = generateMultipleMemberExpression(iterator, node);
          break;
        case 'SliceExpression':
          treeNode = generateSliceExpression(iterator, node);
          break;
        case 'ScriptExpression':
          throw new SyntaxError('Unsupported');
        case 'ScriptFilterExpression':
          treeNode = generateFilterScriptExpression(iterator, node);
          break;
        case 'KeyExpression':
          keyed = true;
          continue;
        case 'WildcardExpression':
          if (iterator.bailed) {
            (bailedDeps ??= []).push(
              b.objectExpression([
                b.objectProperty(
                  b.identifier('fn'),
                  b.arrowFunctionExpression([], b.booleanLiteral(false)),
                ),
                b.objectProperty(
                  b.identifier('deep'),
                  b.booleanLiteral(node.deep),
                ),
              ]),
            );
          } else if (iterator.nextNode === null && !iterator.fixed) {
            // nextNode === keyExpression???
            treeNode = b.sequenceExpression([
              b.assignmentExpression(
                '=',
                b.identifier('pos'),
                b.conditionalExpression(
                  b.binaryExpression(
                    '<',
                    scope.depth,
                    b.numericLiteral(iterator.pos),
                  ),
                  b.numericLiteral(-1),
                  scope.depth,
                ),
              ),
              b.binaryExpression(
                '===',
                b.identifier('pos'),
                b.numericLiteral(-1),
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

      if (iterator.bailed) {
        (bailedDeps ??= []).push(
          b.objectExpression([
            b.objectProperty(
              b.identifier('fn'),
              b.arrowFunctionExpression([scopeIdentifier], treeNode),
            ),
            b.objectProperty(b.identifier('deep'), b.booleanLiteral(node.deep)),
          ]),
        );
      } else {
        branch.push(b.ifStatement(treeNode, b.returnStatement()));
      }
    }

    if (!iterator.fixed && !iterator.bailed) {
      branch.push(
        b.ifStatement(
          b.binaryExpression(
            '!==',
            scope.depth,
            iterator.pos === 0
              ? b.identifier('pos')
              : b.binaryExpression(
                  '+',
                  b.identifier('pos'),
                  b.numericLiteral(iterator.pos),
                ),
          ),
          b.returnStatement(),
        ),
      );
    }

    const placement = branch !== void 0 ? 'traverse' : 'body';
    branch ??= [];
    if (keyed) {
      branch.push(b.expressionStatement(keyedFnCall));
      tree.push(withKeysImportSpecifier, 'module');
    } else {
      branch.push(b.expressionStatement(fnCall));
    }

    if (bailedDeps !== void 0) {
      branch.push(
        b.expressionStatement(
          b.callExpression(scope.bail, [
            b.stringLiteral(id),
            branch.pop().expression.callee,
            b.arrayExpression(bailedDeps),
          ]),
        ),
      );
    }

    if (placement === 'body') {
      tree.push(
        b.expressionStatement(
          b.callExpression(
            b.memberExpression(
              b.identifier('_tree'),
              b.stringLiteral(id),
              true,
            ),
            [
              scopeIdentifier,
              b.memberExpression(_callbacks, b.stringLiteral(id), true),
            ],
          ),
        ),
        placement,
      );
    } else {
      tree.push(b.stringLiteral(id), placement);
    }

    tree.push(b.blockStatement(branch), 'tree-method');
  }

  tree.push(
    b.objectExpression(
      Array.from(callbacks.entries()).map(([key, values]) =>
        b.objectProperty(
          b.stringLiteral(key),
          b.arrayExpression(values.map(value => b.stringLiteral(value))),
        ),
      ),
    ),
    'callbacks',
  );

  return tree;
}
