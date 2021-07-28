'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var builders = require('../codegen/ast/builders.cjs');
var index = require('../codegen/index.cjs');
var parser = require('../parser/parser.cjs');
var index$1 = require('../runtime/index.cjs');
var iterator = require('../codegen/iterator.cjs');

class Nimma {
  constructor(expressions, { fallback = null, handleBailout = true } = {}) {
    const mappedExpressions = [];
    const erroredExpressions = [];

    for (const expression of new Set(expressions)) {
      try {
        const parsed = parser['default'].parse(expression);
        if (handleBailout === false && iterator['default'].getBailedPos(parsed) !== -1) {
          throw Error('Bail');
        }

        mappedExpressions.push([expression, parsed]);
      } catch (e) {
        if (fallback === null) {
          throw e;
        }

        erroredExpressions.push(expression);
      }
    }

    const tree = index['default'](mappedExpressions);

    const extraCode =
      fallback !== null ? Reflect.apply(Function.toString, fallback, []) : null;

    if (extraCode !== null) {
      const path = builders.identifier('path');
      tree.push(
        builders.forOfStatement(
          builders.variableDeclaration('const', [builders.variableDeclarator(path)]),
          builders.arrayExpression(
            erroredExpressions.map(expression => builders.stringLiteral(expression)),
          ),
          builders.blockStatement([
            builders.callExpression(
              builders.callExpression(
                builders.callExpression(builders.identifier('Function'), [
                  builders.templateLiteral(
                    [builders.templateElement({ raw: `return ${extraCode}` })],
                    [],
                  ),
                ]),
                [],
              ),
              [
                builders.identifier('input'),
                path,
                builders.memberExpression(builders.identifier('_callbacks'), path, true),
              ],
            ),
          ]),
        ),
        'body',
      );
    }

    this.sourceCode = String(tree);
  }

  query(input, callbacks) {
    const globals = '__nimma_globals__';
    const code = `${this.sourceCode
      .replace('export default function', `return function`)
      .replace(
        /import\s*({[^}]+})\s*from\s*['"][^'"]+['"];?/,
        `const $1 = ${globals}`,
      )}`;

    Function(globals, code)(index$1)(input, callbacks);
  }
}

exports.default = Nimma;
