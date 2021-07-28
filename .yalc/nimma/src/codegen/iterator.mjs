import { isDeep, isMemberExpression, isWildcardExpression } from './guards.mjs';

export default class Iterator {
  #nodes;
  #i;

  static #compact(nodes) {
    let marked;
    for (let i = 0; i < nodes.length; i++) {
      if (
        isWildcardExpression(nodes[i]) &&
        isDeep(nodes[i]) &&
        i !== nodes.length - 1
      ) {
        (marked ??= []).push(i);
      }
    }

    if (marked === void 0) {
      return nodes;
    }

    const _nodes = nodes.slice();
    for (let i = 0; i < marked.length; i++) {
      _nodes[marked[i] - i + 1].deep = true;
      _nodes.splice(marked[i] - i, 1);
    }

    return _nodes;
  }

  constructor(nodes) {
    this.#nodes = Iterator.#compact(nodes);
    this.#i = -1;
    this.pos = -1;
    this.fixed = true;
    this.length = 0;
    this.bailed = false;

    for (const node of this.#nodes) {
      if (node.type === 'KeyExpression' || node.type === 'ParentExpression') {
        break;
      }

      if (isDeep(node)) {
        this.fixed = false;
        this.length = Infinity;
      } else if (this.fixed) {
        this.length++;
      }
    }
  }

  get nextNode() {
    return this.#i + 1 < this.#nodes.length ? this.#nodes[this.#i + 1] : null;
  }

  static getBailedPos(nodes) {
    for (const [i, node] of nodes.entries()) {
      if (i + 1 === nodes.length) {
        continue;
      }

      if (node.type === 'ScriptFilterExpression') {
        return i;
      }

      if (isDeep(node)) {
        if (isMemberExpression(node)) {
          for (let x = i; x < nodes.length; x++) {
            const nextNode = nodes[x];
            if (isDeep(nextNode) && isMemberExpression(nextNode)) {
              continue;
            }

            if (
              x === nodes.length - 1 &&
              nextNode.type === 'ScriptFilterExpression'
            ) {
              return -1;
            }

            return i;
          }
        } else {
          return i;
        }
      }
    }

    return -1;
  }

  *[Symbol.iterator]() {
    const bailedPos = Iterator.getBailedPos(this.#nodes);

    for (const node of this.#nodes) {
      this.pos++;
      this.#i++;

      if (bailedPos === this.#i) {
        this.bailed = true;
      }

      if (isDeep(node)) {
        yield node;
        this.pos = 0;
      } else {
        yield node;
      }
    }
  }
}
