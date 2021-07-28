import isObject from './codegen-functions/is-object.mjs';

export class DeoptedSandbox {
  #history;
  #path;

  constructor(path, root, history = null) {
    this.#path = path;
    this.#history = history ?? [[0, root]];
  }

  get path() {
    if (this.#path.length - 1 !== this.#history[this.#history.length - 1][0]) {
      return this.#path.slice(0, this.#history[this.#history.length - 1][0]);
    }

    return this.#path;
  }

  destroy() {
    this.#history.length = 0;
  }

  get value() {
    return this.#history[this.#history.length - 1][1];
  }

  get depth() {
    return this.path.length - 1;
  }

  push() {
    const root =
      this.property !== null && isObject(this.value)
        ? this.value[this.property]
        : null;

    this.#history.push([this.path.length, root]);
    return this;
  }

  pop() {
    const length = Math.max(0, this.path.length + 1);
    while (this.#history.length > length) {
      this.#history.pop();
    }

    return this;
  }

  get property() {
    return unwrapOrNull(this.path, this.depth);
  }

  get parentProperty() {
    const { parent } = this;
    return parent === null ? null : parent.property;
  }

  get parent() {
    if (this.#history.length === 0) {
      return null;
    }

    const history = this.#history.slice();
    return new Sandbox(
      this.path.slice(0, history[history.length - 1][0]),
      history[history.length - 1][1],
      history,
    );
  }

  get root() {
    return unwrapOrNull(this.#history, 0)?.[1];
  }
}

export class Sandbox {
  #history;
  #path;
  #value;

  constructor(path, root, history = null) {
    this.root = root;
    this.#path = path;
    this.#history = history ?? [[0, root]];
    this.#value = void 0;
  }

  get path() {
    return this.#path;
  }

  destroy() {
    this.#history.length = 0;
  }

  get depth() {
    return this.path.length - 1;
  }

  get value() {
    if (this.#value !== void 0) {
      return this.#value;
    }

    return this.#history[this.#history.length - 1][1];
  }

  push() {
    const root =
      this.property !== null && isObject(this.value)
        ? this.value[this.property]
        : null;

    this.#history.push([this.path.length, root]);
    this.#value = root;
    return this;
  }

  pop() {
    const length = Math.max(0, this.path.length + 1);
    while (this.#history.length > length) {
      this.#history.pop();
    }

    this.#value = void 0;
    return this;
  }

  get property() {
    return unwrapOrNull(this.path, this.depth);
  }

  get parentProperty() {
    const { parent } = this;
    return parent === null ? null : parent.property;
  }

  get parent() {
    if (this.#history.length === 0) {
      return null;
    }

    const history = this.#history.slice();
    return new DeoptedSandbox(
      this.path.slice(0, history[history.length - 1][0]),
      history[history.length - 1][1],
      history,
    );
  }
}

function unwrapOrNull(collection, pos) {
  return pos >= 0 && collection.length > pos ? collection[pos] : null;
}
