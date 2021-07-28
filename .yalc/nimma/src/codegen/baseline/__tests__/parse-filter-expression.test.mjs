import forEach from 'mocha-each';
import mocha from 'mocha';
import chai from 'chai';

import { generateFilterScriptExpression } from '../generators.mjs';
import * as parser from '../../../parser/parser.cjs';
import Iterator from '../../iterator.mjs';
import astring from '../../astring.mjs';

const { describe, describe: context, it } = mocha;
const { expect } = chai;

function print(expr) {
  const ast = parser.parse(`$[${expr}]`);
  const iterator = new Iterator(ast);
  const { value: node } = iterator[Symbol.iterator]().next();
  return astring(generateFilterScriptExpression(iterator, node));
}

describe('parseFilterExpression', () => {
  it('@.access', () => {
    expect(print(`?(@.schema || @.ex)`)).to.eq(
      `!(scope.sandbox.value.schema || scope.sandbox.value.ex)`,
    );

    expect(print(`?(@.schema['d'] || @.ex.baz)`)).to.eq(
      `!(scope.sandbox.value.schema['d'] || scope.sandbox.value.ex.baz)`,
    );
  });

  it('at in string', () => {
    expect(print(`?(@property === "@.schema")`)).to.eq(
      `!(scope.sandbox.property === "@.schema")`,
    );

    expect(print(`?(@property === "@string")`)).to.eq(
      `!(scope.sandbox.property === "@string")`,
    );
  });

  it('basic binary expressions', () => {
    expect(print(`?(@.amount + 2 === 4)`)).to.eq(
      `!(scope.sandbox.value.amount + 2 === 4)`,
    );
  });

  forEach([
    `@property === Array`,
    `Array.isArray`,
    `Array`,
    `!Array`,
    `Array + Object`,
    `Array()`,
    `Array()()()`,
  ]).it('disallows usage of untrusted identifiers in %s', expression => {
    expect(print.bind(null, `?(${expression})`)).to.throw(
      ReferenceError,
      `'Array' is not defined`,
    );
  });

  context('jsonpath-plus exclusive additions', () => {
    it('@property', () => {
      expect(print(`?(@property === 'foo')`)).to.eq(
        `!(scope.sandbox.property === 'foo')`,
      );
    });

    it('@path', () => {
      expect(print(`?(@path.includes("foo"))`)).to.eq(
        `!scope.path.includes("foo")`,
      );
    });

    forEach(['string', 'boolean', 'number']).it('@%s', kind => {
      expect(print(`?(@${kind}())`)).to.eq(
        `!(typeof scope.sandbox.value === "${kind}")`,
      );
    });

    it('@scalar()', () => {
      expect(print(`?(@scalar())`)).to.eq(
        `!(scope.sandbox.value !== null && typeof scope.sandbox.value !== "object")`,
      );
    });

    it('@null()', () => {
      expect(print(`?(@null())`)).to.eq(`!(scope.sandbox.value === null)`);
    });

    it('@array()', () => {
      expect(print(`?(@array())`)).to.eq(`!Array.isArray(scope.sandbox.value)`);
    });

    it('@object()', () => {
      expect(print(`?(@object())`)).to.eq(
        `!(scope.sandbox.value !== null && typeof scope.sandbox.value === "object")`,
      );
    });

    it('@integer()', () => {
      expect(print(`?(@integer())`)).to.eq(
        `!Number.isInteger(scope.sandbox.value)`,
      );
    });

    it('throws upon unknown shorthand', () => {
      expect(print.bind(null, `?(@foo())`)).to.throw(
        SyntaxError,
        `Unsupported shorthand '@foo'`,
      );
    });
  });
});
