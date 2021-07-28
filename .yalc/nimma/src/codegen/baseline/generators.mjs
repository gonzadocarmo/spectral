import * as b from '../ast/builders.mjs';
import jsep from '../../parser/jsep/index.js';
import scope from '../templates/scope.mjs';
import sandbox from '../templates/sandbox.mjs';

const pos = b.identifier('pos');

export function generateMemberExpression(iterator, { deep, value }) {
  if (iterator.bailed) {
    return b.binaryExpression('!==', scope.property, b.stringLiteral(value));
  }

  if (deep) {
    const isLastNode =
      iterator.nextNode === null || iterator.nextNode === 'KeyExpression';
    const right = b.sequenceExpression([
      b.assignmentExpression(
        '=',
        pos,
        isLastNode
          ? b.conditionalExpression(
              b.binaryExpression('!==', scope.property, b.stringLiteral(value)),
              b.numericLiteral(-1),
              scope.depth,
            )
          : b.callExpression(
              b.memberExpression(scope.path, b.identifier('indexOf')),
              [
                b.stringLiteral(value),
                iterator.pos === 0
                  ? pos
                  : b.binaryExpression('+', pos, b.numericLiteral(1)),
              ],
            ),
      ),
      b.binaryExpression('===', pos, b.numericLiteral(-1)),
    ]);

    if (isLastNode) {
      return b.logicalExpression(
        '||',
        b.binaryExpression('===', scope.depth, b.identifier('pos')),
        right,
      );
    }

    return right;
  }

  let left;

  if (!iterator.fixed) {
    left = b.binaryExpression(
      '<',
      scope.depth,
      iterator.pos === 0
        ? pos
        : b.binaryExpression('+', pos, b.numericLiteral(iterator.pos)),
    );
  }

  const right = b.binaryExpression(
    '!==',
    b.memberExpression(
      scope.path,
      iterator.pos === 0
        ? pos
        : b.binaryExpression('+', pos, b.numericLiteral(iterator.pos)),
      true,
    ),
    b.stringLiteral(value),
  );

  return left !== void 0 ? b.logicalExpression('||', left, right) : right;
}

export function generateMultipleMemberExpression(iterator, node) {
  return node.value.slice(1).reduce(
    (concat, member) =>
      b.logicalExpression(
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

export function generateSliceExpression(iterator, { value }) {
  const path = iterator.bailed
    ? scope.property
    : b.memberExpression(
        scope.path,
        iterator.pos === 0
          ? pos
          : b.binaryExpression('+', pos, b.numericLiteral(iterator.pos)),
        true,
      );

  return value.reduce((node, value, i) => {
    if (value === '') {
      return node;
    }

    const operator = i === 0 ? '<' : i === 1 ? '>' : '%';

    const expression = b.binaryExpression(
      operator,
      path,
      b.numericLiteral(Number(value)),
    );

    return b.logicalExpression(
      '||',
      node,
      operator === '%'
        ? b.binaryExpression('!==', expression, b.numericLiteral(0))
        : expression,
    );
  }, b.binaryExpression('!==', b.unaryExpression('typeof', path), b.stringLiteral('number')));
}

export function generateFilterScriptExpression(iterator, { deep, value }) {
  const esTree = jsep(value);
  assertDefinedIdentifier(esTree);
  const node = b.unaryExpression('!', rewriteESTree(esTree));
  if (iterator.bailed || !deep) return node;

  const assignment = b.sequenceExpression([
    b.assignmentExpression(
      '=',
      b.identifier('pos'),
      b.conditionalExpression(node, b.numericLiteral(-1), scope.depth),
    ),
    b.binaryExpression('===', pos, b.numericLiteral(-1)),
  ]);

  if (iterator.pos === 0) return assignment;

  return b.logicalExpression(
    '||',
    b.binaryExpression('===', scope.depth, b.identifier('pos')),
    assignment,
  );
}

export function rewriteESTree(node) {
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
      return b.binaryExpression(
        '===',
        b.unaryExpression('typeof', sandbox.value),
        b.stringLiteral(name.slice(1)),
      );
    case '@scalar':
      return b.logicalExpression(
        '&&',
        b.binaryExpression('!==', sandbox.value, b.nullLiteral()),
        b.binaryExpression(
          '!==',
          b.unaryExpression('typeof', sandbox.value),
          b.stringLiteral('object'),
        ),
      );
    case '@array':
      return b.callExpression(
        b.memberExpression(b.identifier('Array'), b.identifier('isArray')),
        [sandbox.value],
      );
    case '@null':
      return b.binaryExpression('===', sandbox.value, b.nullLiteral());
    case '@object':
      return b.logicalExpression(
        '&&',
        b.binaryExpression('!==', sandbox.value, b.nullLiteral()),
        b.binaryExpression(
          '===',
          b.unaryExpression('typeof', sandbox.value),
          b.stringLiteral('object'),
        ),
      );
    case '@integer':
      return b.callExpression(
        b.memberExpression(b.identifier('Number'), b.identifier('isInteger')),
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
