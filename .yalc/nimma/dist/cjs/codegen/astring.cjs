'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var astring$1 = require('astring');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

var astring__namespace = /*#__PURE__*/_interopNamespace(astring$1);

const QUOTE = /"/g;

const customGenerator = {
  ...astring__namespace.baseGenerator,
  BooleanLiteral(node, state) {
    state.write(`${node.value}`);
  },
  NullLiteral(node, state) {
    state.write('null');
  },
  NumericLiteral(node, state) {
    state.write(node.value);
  },
  ObjectMethod(node, state) {
    // eslint-disable-next-line no-unused-vars
    const { key, type, ...value } = node;
    return this.ObjectProperty(
      {
        key: node.key,
        value: {
          type: 'FunctionExpression',
          ...value,
        },
      },
      state,
    );
  },
  ObjectProperty(node, state) {
    return this.Property(
      {
        ...node,
        kind: 'init',
      },
      state,
    );
  },
  StringLiteral(node, state) {
    state.write(`"${node.value.replace(QUOTE, '\\"')}"`);
  },
};

function astring (tree) {
  return astring__namespace.generate(tree, { generator: customGenerator });
}

exports.default = astring;
