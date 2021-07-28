import * as astring$1 from 'astring';

const QUOTE = /"/g;

const customGenerator = {
  ...astring$1.baseGenerator,
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
  return astring$1.generate(tree, { generator: customGenerator });
}

export default astring;
