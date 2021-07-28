import * as astring from 'astring';

const QUOTE = /"/g;

const customGenerator = {
  ...astring.baseGenerator,
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

export default function (tree) {
  return astring.generate(tree, { generator: customGenerator });
}
