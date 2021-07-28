import { forOfStatement, blockStatement, callExpression, identifier, memberExpression, templateLiteral, arrayExpression, stringLiteral, variableDeclaration, variableDeclarator, templateElement } from '../codegen/ast/builders.mjs';
import codegen from '../codegen/index.mjs';
import parser from '../parser/parser.mjs';
import * as index from '../runtime/index.mjs';
import Iterator from '../codegen/iterator.mjs';

class Nimma {
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
      const path = identifier('path');
      tree.push(
        forOfStatement(
          variableDeclaration('const', [variableDeclarator(path)]),
          arrayExpression(
            erroredExpressions.map(expression => stringLiteral(expression)),
          ),
          blockStatement([
            callExpression(
              callExpression(
                callExpression(identifier('Function'), [
                  templateLiteral(
                    [templateElement({ raw: `return ${extraCode}` })],
                    [],
                  ),
                ]),
                [],
              ),
              [
                identifier('input'),
                path,
                memberExpression(identifier('_callbacks'), path, true),
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

    Function(globals, code)(index)(input, callbacks);
  }
}

export default Nimma;
