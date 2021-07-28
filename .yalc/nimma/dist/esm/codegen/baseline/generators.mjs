import { logicalExpression, binaryExpression, stringLiteral, unaryExpression, sequenceExpression, assignmentExpression, conditionalExpression, numericLiteral, callExpression, memberExpression, identifier, nullLiteral } from '../ast/builders.mjs';
import jsep from '../../parser/jsep/jsep.mjs';
import '../../parser/jsep/plugins/ternary/ternary.mjs';
import scope from '../templates/scope.mjs';
import sandbox from '../templates/sandbox.mjs';

const pos = identifier('pos');

function generateMemberExpression(iterator, { deep, value }) {
  if (iterator.bailed) {
    return binaryExpression('!==', scope.property, stringLiteral(value));
  }

  if (deep) {
    const isLastNode =
      iterator.nextNode === null || iterator.nextNode === 'KeyExpression';
    const right = sequenceExpression([
      assignmentExpression(
        '=',
        pos,
        isLastNode
          ? conditionalExpression(
              binaryExpression('!==', scope.property, stringLiteral(value)),
              numericLiteral(-1),
              scope.depth,
            )
          : callExpression(
              memberExpression(scope.path, identifier('indexOf')),
              [
                stringLiteral(value),
                iterator.pos === 0
                  ? pos
                  : binaryExpression('+', pos, numericLiteral(1)),
              ],
            ),
      ),
      binaryExpression('===', pos, numericLiteral(-1)),
    ]);

    if (isLastNode) {
      return logicalExpression(
        '||',
        binaryExpression('===', scope.depth, identifier('pos')),
        right,
      );
    }

    return right;
  }

  let left;

  if (!iterator.fixed) {
    left = binaryExpression(
      '<',
      scope.depth,
      iterator.pos === 0
        ? pos
        : binaryExpression('+', pos, numericLiteral(iterator.pos)),
    );
  }

  const right = binaryExpression(
    '!==',
    memberExpression(
      scope.path,
      iterator.pos === 0
        ? pos
        : binaryExpression('+', pos, numericLiteral(iterator.pos)),
      true,
    ),
    stringLiteral(value),
  );

  return left !== void 0 ? logicalExpression('||', left, right) : right;
}

function generateMultipleMemberExpression(iterator, node) {
  return node.value.slice(1).reduce(
    (concat, member) =>
      logicalExpression(
        '&&',
        concat,
        generateMemberExpression(iterator, {
          type: 'eMemberExpression',
          value: member,
          // eslint-disable-next-line sort-keys
          deep: node.deep,
        }),
      ),
    generateMemberExpression(iterator, {
      type: 'eMemberExpression',
      value: node.value[0],
      // eslint-disable-next-line sort-keys
      deep: node.deep,
    }),
  );
}

function generateSliceExpression(iterator, { value }) {
  const path = iterator.bailed
    ? scope.property
    : memberExpression(
        scope.path,
        iterator.pos === 0
          ? pos
          : binaryExpression('+', pos, numericLiteral(iterator.pos)),
        true,
      );

  return value.reduce((node, value, i) => {
    if (value === '') {
      return node;
    }

    const operator = i === 0 ? '<' : i === 1 ? '>' : '%';

    const expression = binaryExpression(
      operator,
      path,
      numericLiteral(Number(value)),
    );

    return logicalExpression(
      '||',
      node,
      operator === '%'
        ? binaryExpression('!==', expression, numericLiteral(0))
        : expression,
    );
  }, binaryExpression('!==', unaryExpression('typeof', path), stringLiteral('number')));
}

function generateFilterScriptExpression(iterator, { deep, value }) {
  const esTree = jsep(value);
  assertDefinedIdentifier(esTree);
  const node = unaryExpression('!', rewriteESTree(esTree));
  if (iterator.bailed || !deep) return node;

  const assignment = sequenceExpression([
    assignmentExpression(
      '=',
      identifier('pos'),
      conditionalExpression(node, numericLiteral(-1), scope.depth),
    ),
    binaryExpression('===', pos, numericLiteral(-1)),
  ]);

  if (iterator.pos === 0) return assignment;

  return logicalExpression(
    '||',
    binaryExpression('===', scope.depth, identifier('pos')),
    assignment,
  );
}

function rewriteESTree(node) {
  switch (node.type) {
    case 'LogicalExpression':
    case 'BinaryExpression':
      node.left = rewriteESTree(node.left);
      node.right = rewriteESTree(node.right);
      assertDefinedIdentifier(node.left);
      assertDefinedIdentifier(node.right);
      break;
    case 'UnaryExpression':
      assertDefinedIdentifier(node.argument);
      return node;
    case 'MemberExpression':
      node.object = rewriteESTree(node.object);
      assertDefinedIdentifier(node.object);
      node.property = rewriteESTree(node.property);
      break;
    case 'CallExpression':
      if (
        node.callee.type === 'Identifier' &&
        node.callee.name.startsWith('@')
      ) {
        return processJsonPathPlusAddition(node.callee.name);
      }

      node.callee = rewriteESTree(node.callee);
      assertDefinedIdentifier(node.callee);
      break;
    case 'Identifier':
      if (node.name.startsWith('@')) {
        return processJsonPathPlusAddition(node.name);
      }

      break;
  }

  return node;
}

function processJsonPathPlusAddition(name) {
  switch (name) {
    case '@':
      return sandbox.value;
    case '@parent':
      return sandbox.parent;
    case '@root':
      return sandbox.root;
    case '@path':
      return scope.path;
    case '@property':
      return sandbox.property;
    case '@parentProperty':
      return sandbox.parentProperty;
    case '@string':
    case '@number':
    case '@boolean':
      return binaryExpression(
        '===',
        unaryExpression('typeof', sandbox.value),
        stringLiteral(name.slice(1)),
      );
    case '@scalar':
      return logicalExpression(
        '&&',
        binaryExpression('!==', sandbox.value, nullLiteral()),
        binaryExpression(
          '!==',
          unaryExpression('typeof', sandbox.value),
          stringLiteral('object'),
        ),
      );
    case '@array':
      return callExpression(
        memberExpression(identifier('Array'), identifier('isArray')),
        [sandbox.value],
      );
    case '@null':
      return binaryExpression('===', sandbox.value, nullLiteral());
    case '@object':
      return logicalExpression(
        '&&',
        binaryExpression('!==', sandbox.value, nullLiteral()),
        binaryExpression(
          '===',
          unaryExpression('typeof', sandbox.value),
          stringLiteral('object'),
        ),
      );
    case '@integer':
      return callExpression(
        memberExpression(identifier('Number'), identifier('isInteger')),
        [sandbox.value],
      );
    default:
      throw new SyntaxError(`Unsupported shorthand '${name}'`);
  }
}

function assertDefinedIdentifier(node) {
  if (node.type !== 'Identifier') return;
  if (node.name === 'scope') return;
  throw ReferenceError(`'${node.name}' is not defined`);
}

export { generateFilterScriptExpression, generateMemberExpression, generateMultipleMemberExpression, generateSliceExpression, rewriteESTree };
