import { Sandbox } from './sandbox.mjs';
import { traverse, bailedTraverse } from './traverse.mjs';
import proxyCallbacks from './proxy-callbacks.mjs';
import noop from './codegen-functions/noop.mjs';

class Scope {
  #ticks = 0;
  #parent;
  #tree;

  constructor(root, parent = null) {
    this.root = root;
    this.#parent = parent;
    this.#tree = null;
    this.path = [];
    this.errors = [];
    this.sandbox = new Sandbox(this.path, root, null);
  }

  get ticks() {
    return this.#ticks;
  }

  set ticks(value) {
    this.#ticks = value;
    if (this.#parent !== null) {
      this.#parent.ticks++;
    }
  }

  get depth() {
    return this.path.length - 1;
  }

  get property() {
    return this.sandbox.property;
  }

  get value() {
    return this.sandbox.value;
  }

  enter(key) {
    this.ticks += 1;
    this.path.push(key);
    this.sandbox = this.sandbox.push();

    return this.path.length;
  }

  next() {
    this.ticks += 1;
  }

  exit(depth) {
    const length = Math.max(0, depth - 1);
    while (this.path.length > length) {
      this.path.pop();
    }

    this.sandbox = this.sandbox.pop();

    return this.path.length;
  }

  fork(path) {
    const newScope = new Scope(this.root, this);

    for (const segment of path) {
      newScope.enter(segment);
    }

    return newScope;
  }

  traverse(fn) {
    traverse.call(this, fn);
  }

  bail(id, fn, deps) {
    this.#tree[id] = noop;
    const scope = this.fork(this.path);
    bailedTraverse.call(scope, fn, deps);
  }

  proxyCallbacks() {
    return proxyCallbacks.apply(this, arguments);
  }

  proxyTree(tree) {
    this.#tree = { ...tree };
    return this.#tree;
  }

  destroy() {
    this.path.length = 0;
    this.sandbox.destroy();
    this.sandbox = null;

    if (this.errors.length > 0) {
      // eslint-disable-next-line no-undef
      throw AggregateError(this.errors);
    }
  }
}

export { Scope };
