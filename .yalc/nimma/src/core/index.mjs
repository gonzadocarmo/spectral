import * as t from '../codegen/ast/builders.mjs';
import codegen from '../codegen/index.mjs';
import * as parser from '../parser/parser.cjs';
import * as runtime from '../runtime/index.mjs';
import Iterator from '../codegen/iterator.mjs';

export default class Nimma {
  constructor(expressions, { fallback = null, handleBailout = true } = {}) {
    const mappedExpressions = [];
    const erroredExpressions = [];

    for (const expression of new Set(expressions)) {
      try {
        const parsed = parser.parse(expression);
        if (handleBailout === false && Iterator.getBailedPos(parsed) !== -1) {
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

    const tree = codegen(mappedExpressions);

    const extraCode =
      fallback !== null ? Reflect.apply(Function.toString, fallback, []) : null;

    if (extraCode !== null) {
      const path = t.identifier('path');
      tree.push(
        t.forOfStatement(
          t.variableDeclaration('const', [t.variableDeclarator(path)]),
          t.arrayExpression(
            erroredExpressions.map(expression => t.stringLiteral(expression)),
          ),
          t.blockStatement([
            t.callExpression(
              t.callExpression(
                t.callExpression(t.identifier('Function'), [
                  t.templateLiteral(
                    [t.templateElement({ raw: `return ${extraCode}` })],
                    [],
                  ),
                ]),
                [],
              ),
              [
                t.identifier('input'),
                path,
                t.memberExpression(t.identifier('_callbacks'), path, true),
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

    Function(globals, code)(runtime)(input, callbacks);
  }
}
