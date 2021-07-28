import { binaryExpression, identifier, numericLiteral, ifStatement, returnStatement, objectExpression, objectProperty, booleanLiteral, sequenceExpression, assignmentExpression, conditionalExpression, arrowFunctionExpression, expressionStatement, callExpression, stringLiteral, arrayExpression, memberExpression, blockStatement, variableDeclaration, variableDeclarator } from '../ast/builders.mjs';
import fastPaths from '../fast-paths/index.mjs';
import Iterator from '../iterator.mjs';
import scope, { scopeIdentifier } from '../templates/scope.mjs';
import fnCall from '../templates/fn-call.mjs';
import keyedFnCall from '../templates/keyed-fn-call.mjs';
import withKeysImportSpecifier from '../templates/with-keys-import-specifier.mjs';
import { generateFilterScriptExpression, generateSliceExpression, generateMultipleMemberExpression, generateMemberExpression } from './generators.mjs';
import ESTree from '../tree/tree.mjs';

function baseline(jsonPaths) {
  const tree = new ESTree();
  const hashes = new Map();
  const callbacks = new Map();

  const _callbacks = identifier('_callbacks');

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
          variableDeclaration('let', [
            variableDeclarator(identifier('pos'), numericLiteral(0)),
          ]),
        ];
      }

      if (iterator.fixed && iterator.pos === 0) {
        const conditionLhsAndRhs = [
          binaryExpression('+', identifier('pos'), scope.depth),
          numericLiteral(iterator.length - 1),
        ];

        branch.push(
          ifStatement(
            binaryExpression('!==', ...conditionLhsAndRhs),
            returnStatement(),
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
              objectExpression([
                objectProperty(
                  identifier('fn'),
                  arrowFunctionExpression([], booleanLiteral(false)),
                ),
                objectProperty(
                  identifier('deep'),
                  booleanLiteral(node.deep),
                ),
              ]),
            );
          } else if (iterator.nextNode === null && !iterator.fixed) {
            // nextNode === keyExpression???
            treeNode = sequenceExpression([
              assignmentExpression(
                '=',
                identifier('pos'),
                conditionalExpression(
                  binaryExpression(
                    '<',
                    scope.depth,
                    numericLiteral(iterator.pos),
                  ),
                  numericLiteral(-1),
                  scope.depth,
                ),
              ),
              binaryExpression(
                '===',
                identifier('pos'),
                numericLiteral(-1),
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
          objectExpression([
            objectProperty(
              identifier('fn'),
              arrowFunctionExpression([scopeIdentifier], treeNode),
            ),
            objectProperty(identifier('deep'), booleanLiteral(node.deep)),
          ]),
        );
      } else {
        branch.push(ifStatement(treeNode, returnStatement()));
      }
    }

    if (!iterator.fixed && !iterator.bailed) {
      branch.push(
        ifStatement(
          binaryExpression(
            '!==',
            scope.depth,
            iterator.pos === 0
              ? identifier('pos')
              : binaryExpression(
                  '+',
                  identifier('pos'),
                  numericLiteral(iterator.pos),
                ),
          ),
          returnStatement(),
        ),
      );
    }

    const placement = branch !== void 0 ? 'traverse' : 'body';
    branch ??= [];
    if (keyed) {
      branch.push(expressionStatement(keyedFnCall));
      tree.push(withKeysImportSpecifier, 'module');
    } else {
      branch.push(expressionStatement(fnCall));
    }

    if (bailedDeps !== void 0) {
      branch.push(
        expressionStatement(
          callExpression(scope.bail, [
            stringLiteral(id),
            branch.pop().expression.callee,
            arrayExpression(bailedDeps),
          ]),
        ),
      );
    }

    if (placement === 'body') {
      tree.push(
        expressionStatement(
          callExpression(
            memberExpression(
              identifier('_tree'),
              stringLiteral(id),
              true,
            ),
            [
              scopeIdentifier,
              memberExpression(_callbacks, stringLiteral(id), true),
            ],
          ),
        ),
        placement,
      );
    } else {
      tree.push(stringLiteral(id), placement);
    }

    tree.push(blockStatement(branch), 'tree-method');
  }

  tree.push(
    objectExpression(
      Array.from(callbacks.entries()).map(([key, values]) =>
        objectProperty(
          stringLiteral(key),
          arrayExpression(values.map(value => stringLiteral(value))),
        ),
      ),
    ),
    'callbacks',
  );

  return tree;
}

export default baseline;
