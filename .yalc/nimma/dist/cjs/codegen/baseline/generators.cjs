'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../ast/builders.cjs');
var jsep = require('../../parser/jsep/jsep.cjs');
require('../../parser/jsep/plugins/ternary/ternary.cjs');
var scope = require('../templates/scope.cjs');
var sandbox = require('../templates/sandbox.cjs');

const pos = builders.identifier('pos');

function generateMemberExpression(iterator, { deep, value }) {
  if (iterator.bailed) {
    return builders.binaryExpression('!==', scope['default'].property, builders.stringLiteral(value));
  }

  if (deep) {
    const isLastNode =
      iterator.nextNode === null || iterator.nextNode === 'KeyExpression';
    const right = builders.sequenceExpression([
      builders.assignmentExpression(
        '=',
        pos,
        isLastNode
          ? builders.conditionalExpression(
              builders.binaryExpression('!==', scope['default'].property, builders.stringLiteral(value)),
              builders.numericLiteral(-1),
              scope['default'].depth,
            )
          : builders.callExpression(
              builders.memberExpression(scope['default'].path, builders.identifier('indexOf')),
              [
                builders.stringLiteral(value),
                iterator.pos === 0
                  ? pos
                  : builders.binaryExpression('+', pos, builders.numericLiteral(1)),
              ],
            ),
      ),
      builders.binaryExpression('===', pos, builders.numericLiteral(-1)),
    ]);

    if (isLastNode) {
      return builders.logicalExpression(
        '||',
        builders.binaryExpression('===', scope['default'].depth, builders.identifier('pos')),
        right,
      );
    }

    return right;
  }

  let left;

  if (!iterator.fixed) {
    left = builders.binaryExpression(
      '<',
      scope['default'].depth,
      iterator.pos === 0
        ? pos
        : builders.binaryExpression('+', pos, builders.numericLiteral(iterator.pos)),
    );
  }

  const right = builders.binaryExpression(
    '!==',
    builders.memberExpression(
      scope['default'].path,
      iterator.pos === 0
        ? pos
        : builders.binaryExpression('+', pos, builders.numericLiteral(iterator.pos)),
      true,
    ),
    builders.stringLiteral(value),
  );

  return left !== void 0 ? builders.logicalExpression('||', left, right) : right;
}

function generateMultipleMemberExpression(iterator, node) {
  return node.value.slice(1).reduce(
    (concat, member) =>
      builders.logicalExpression(
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
    ? scope['default'].property
    : builders.memberExpression(
        scope['default'].path,
        iterator.pos === 0
          ? pos
          : builders.binaryExpression('+', pos, builders.numericLiteral(iterator.pos)),
        true,
      );

  return value.reduce((node, value, i) => {
    if (value === '') {
      return node;
    }

    const operator = i === 0 ? '<' : i === 1 ? '>' : '%';

    const expression = builders.binaryExpression(
      operator,
      path,
      builders.numericLiteral(Number(value)),
    );

    return builders.logicalExpression(
      '||',
      node,
      operator === '%'
        ? builders.binaryExpression('!==', expression, builders.numericLiteral(0))
        : expression,
    );
  }, builders.binaryExpression('!==', builders.unaryExpression('typeof', path), builders.stringLiteral('number')));
}

function generateFilterScriptExpression(iterator, { deep, value }) {
  const esTree = jsep['default'](value);
  assertDefinedIdentifier(esTree);
  const node = builders.unaryExpression('!', rewriteESTree(esTree));
  if (iterator.bailed || !deep) return node;

  const assignment = builders.sequenceExpression([
    builders.assignmentExpression(
      '=',
      builders.identifier('pos'),
      builders.conditionalExpression(node, builders.numericLiteral(-1), scope['default'].depth),
    ),
    builders.binaryExpression('===', pos, builders.numericLiteral(-1)),
  ]);

  if (iterator.pos === 0) return assignment;

  return builders.logicalExpression(
    '||',
    builders.binaryExpression('===', scope['default'].depth, builders.identifier('pos')),
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
      return sandbox['default'].value;
    case '@parent':
      return sandbox['default'].parent;
    case '@root':
      return sandbox['default'].root;
    case '@path':
      return scope['default'].path;
    case '@property':
      return sandbox['default'].property;
    case '@parentProperty':
      return sandbox['default'].parentProperty;
    case '@string':
    case '@number':
    case '@boolean':
      return builders.binaryExpression(
        '===',
        builders.unaryExpression('typeof', sandbox['default'].value),
        builders.stringLiteral(name.slice(1)),
      );
    case '@scalar':
      return builders.logicalExpression(
        '&&',
        builders.binaryExpression('!==', sandbox['default'].value, builders.nullLiteral()),
        builders.binaryExpression(
          '!==',
          builders.unaryExpression('typeof', sandbox['default'].value),
          builders.stringLiteral('object'),
        ),
      );
    case '@array':
      return builders.callExpression(
        builders.memberExpression(builders.identifier('Array'), builders.identifier('isArray')),
        [sandbox['default'].value],
      );
    case '@null':
      return builders.binaryExpression('===', sandbox['default'].value, builders.nullLiteral());
    case '@object':
      return builders.logicalExpression(
        '&&',
        builders.binaryExpression('!==', sandbox['default'].value, builders.nullLiteral()),
        builders.binaryExpression(
          '===',
          builders.unaryExpression('typeof', sandbox['default'].value),
          builders.stringLiteral('object'),
        ),
      );
    case '@integer':
      return builders.callExpression(
        builders.memberExpression(builders.identifier('Number'), builders.identifier('isInteger')),
        [sandbox['default'].value],
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

exports.generateFilterScriptExpression = generateFilterScriptExpression;
exports.generateMemberExpression = generateMemberExpression;
exports.generateMultipleMemberExpression = generateMultipleMemberExpression;
exports.generateSliceExpression = generateSliceExpression;
exports.rewriteESTree = rewriteESTree;
