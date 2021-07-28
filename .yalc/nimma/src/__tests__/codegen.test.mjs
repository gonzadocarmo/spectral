import mocha from 'mocha';
import chai from 'chai';
import Nimma from '../core/index.mjs';

const { describe, it } = mocha;
const { expect } = chai;

function generate(expressions, opts) {
  return new Nimma(expressions, opts).sourceCode;
}

describe('Code Generator', () => {
  it('fixed', () => {
    expect(
      generate([
        '$.info',
        '$.info.contact',
        '$.info.contact.*',
        '$.servers[*].url',
        '$.servers[0:2]',
        '$.servers[:5]',
        "$.bar['children']",
        "$.bar['0']",
        "$.bar['children.bar']",
      ]),
    ).to.eq(`import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.info": function (scope, fn) {
    const value = scope.sandbox.root;
    if (isObject(value)) fn(scope.fork(["info"]));
  },
  "$.info.contact": function (scope, fn) {
    const value = scope.sandbox.root?.["info"];
    if (isObject(value)) fn(scope.fork(["info", "contact"]));
  },
  "$.info.contact.*": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 2) return;
    if (scope.path[pos] !== "info") return;
    if (scope.path[pos + 1] !== "contact") return;
    fn(scope);
  },
  "$.servers[*].url": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 2) return;
    if (scope.path[pos] !== "servers") return;
    if (scope.path[pos + 2] !== "url") return;
    fn(scope);
  },
  "$.servers[0:2]": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 1) return;
    if (scope.path[pos] !== "servers") return;
    if (typeof scope.path[pos + 1] !== "number" || scope.path[pos + 1] < 0 || scope.path[pos + 1] > 2) return;
    fn(scope);
  },
  "$.servers[:5]": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 1) return;
    if (scope.path[pos] !== "servers") return;
    if (typeof scope.path[pos + 1] !== "number" || scope.path[pos + 1] > 5) return;
    fn(scope);
  },
  "$.bar['children']": function (scope, fn) {
    const value = scope.sandbox.root?.["bar"];
    if (isObject(value)) fn(scope.fork(["bar", "children"]));
  },
  "$.bar['0']": function (scope, fn) {
    const value = scope.sandbox.root?.["bar"];
    if (isObject(value)) fn(scope.fork(["bar", "0"]));
  },
  "$.bar['children.bar']": function (scope, fn) {
    const value = scope.sandbox.root?.["bar"];
    if (isObject(value)) fn(scope.fork(["bar", "children.bar"]));
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$.info"](scope, _callbacks["$.info"]);
    _tree["$.info.contact"](scope, _callbacks["$.info.contact"]);
    _tree["$.bar['children']"](scope, _callbacks["$.bar['children']"]);
    _tree["$.bar['0']"](scope, _callbacks["$.bar['0']"]);
    _tree["$.bar['children.bar']"](scope, _callbacks["$.bar['children.bar']"]);
    scope.traverse(() => {
      _tree["$.info.contact.*"](scope, _callbacks["$.info.contact.*"]);
      _tree["$.servers[*].url"](scope, _callbacks["$.servers[*].url"]);
      _tree["$.servers[0:2]"](scope, _callbacks["$.servers[0:2]"]);
      _tree["$.servers[:5]"](scope, _callbacks["$.servers[:5]"]);
    });
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('with keys', () => {
    expect(generate(['$.info~', '$.servers[*].url~', '$.servers[:5]~'])).to.deep
      .equal(`import {Scope, withKeys} from "nimma/runtime";
const tree = {
  "$.info~": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 0) return;
    if (scope.path[pos] !== "info") return;
    withKeys(scope, fn);
  },
  "$.servers[*].url~": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 2) return;
    if (scope.path[pos] !== "servers") return;
    if (scope.path[pos + 2] !== "url") return;
    withKeys(scope, fn);
  },
  "$.servers[:5]~": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 1) return;
    if (scope.path[pos] !== "servers") return;
    if (typeof scope.path[pos + 1] !== "number" || scope.path[pos + 1] > 5) return;
    withKeys(scope, fn);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    scope.traverse(() => {
      _tree["$.info~"](scope, _callbacks["$.info~"]);
      _tree["$.servers[*].url~"](scope, _callbacks["$.servers[*].url~"]);
      _tree["$.servers[:5]~"](scope, _callbacks["$.servers[:5]~"]);
    });
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('supported deep', () => {
    expect(
      generate([
        // "$.components.schemas..[?(@property !== 'properties' && @ && (@ && @.example !== void 0 || @.default !== void 0))]",
        '$..empty',
        '$.baz..baz',
        '$.baz.bar..baz',
        '$..foo..bar..baz',
        '$..baz..baz',
        "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
        "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$..empty": function (scope, fn) {
    if (scope.property === "empty") {
      fn(scope);
    }
  },
  "$.baz..baz": function (scope, fn) {
    let pos = 0;
    if (scope.depth < pos || scope.path[pos] !== "baz") return;
    if (scope.depth === pos || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    fn(scope);
  },
  "$.baz.bar..baz": function (scope, fn) {
    let pos = 0;
    if (scope.depth < pos || scope.path[pos] !== "baz") return;
    if (scope.depth < pos + 1 || scope.path[pos + 1] !== "bar") return;
    if (scope.depth === pos || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    fn(scope);
  },
  "$..foo..bar..baz": function (scope, fn) {
    let pos = 0;
    if ((pos = scope.path.indexOf("foo", pos), pos === -1)) return;
    if ((pos = scope.path.indexOf("bar", pos + 1), pos === -1)) return;
    if (scope.depth === pos || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    fn(scope);
  },
  "$..baz..baz": function (scope, fn) {
    let pos = 0;
    if ((pos = scope.path.indexOf("baz", pos), pos === -1)) return;
    if (scope.depth === pos || (pos = scope.property !== "baz" ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    fn(scope);
  },
  "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]": function (scope, fn) {
    if (!(scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post')) return;
    fn(scope)
  },
  "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]": function (scope, fn) {
    let pos = 0;
    if ((pos = scope.path.indexOf("paths", pos), pos === -1)) return;
    if (scope.depth === pos || (pos = !(scope.sandbox.property === 'get' || scope.sandbox.property === 'put' || scope.sandbox.property === 'post') ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    fn(scope);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    scope.traverse(() => {
      _tree["$..empty"](scope, _callbacks["$..empty"]);
      _tree["$.baz..baz"](scope, _callbacks["$.baz..baz"]);
      _tree["$.baz.bar..baz"](scope, _callbacks["$.baz.bar..baz"]);
      _tree["$..foo..bar..baz"](scope, _callbacks["$..foo..bar..baz"]);
      _tree["$..baz..baz"](scope, _callbacks["$..baz..baz"]);
      _tree["$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"](scope, _callbacks["$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"]);
      _tree["$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"](scope, _callbacks["$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]"]);
    });
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('trailing wildcards', () => {
    expect(
      generate([
        `$..examples.*`,
        `$..examples..*`,
        // `$..examples..*~`,
        `$.examples..*`,
        `$.examples.*`,
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$..examples.*": function (scope, fn) {
    scope.bail("$..examples.*", fn, [{
      fn: scope => scope.property !== "examples",
      deep: true
    }, {
      fn: () => false,
      deep: false
    }]);
  },
  "$..examples..*": function (scope, fn) {
    scope.bail("$..examples..*", fn, [{
      fn: scope => scope.property !== "examples",
      deep: true
    }, {
      fn: () => false,
      deep: true
    }]);
  },
  "$.examples..*": function (scope, fn) {
    let pos = 0;
    if (scope.depth < pos || scope.path[pos] !== "examples") return;
    if ((pos = scope.depth < 1 ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    fn(scope);
  },
  "$.examples.*": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 1) return;
    if (scope.path[pos] !== "examples") return;
    fn(scope);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$..examples.*"](scope, _callbacks["$..examples.*"]);
    _tree["$..examples..*"](scope, _callbacks["$..examples..*"]);
    scope.traverse(() => {
      _tree["$.examples..*"](scope, _callbacks["$.examples..*"]);
      _tree["$.examples.*"](scope, _callbacks["$.examples.*"]);
    });
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('bailed', () => {
    expect(
      generate([
        '$..[?(@.example && @.schema)]..[?(@.example && @.schema)]',
        '$..[?( @property >= 400 )]..foo',
        '$.bar..[?(@.example && @.schema)].test',
        '$..foo..[?( @property >= 900 )]..foo',
        '$.paths..content.*.examples',
        '$.paths..content.bar..examples',
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$..[?(@.example && @.schema)]..[?(@.example && @.schema)]": function (scope, fn) {
    scope.bail("$..[?(@.example && @.schema)]..[?(@.example && @.schema)]", fn, [{
      fn: scope => !(scope.sandbox.value.example && scope.sandbox.value.schema),
      deep: true
    }, {
      fn: scope => !(scope.sandbox.value.example && scope.sandbox.value.schema),
      deep: true
    }]);
  },
  "$..[?( @property >= 400 )]..foo": function (scope, fn) {
    scope.bail("$..[?( @property >= 400 )]..foo", fn, [{
      fn: scope => !(scope.sandbox.property >= 400),
      deep: true
    }, {
      fn: scope => scope.property !== "foo",
      deep: true
    }]);
  },
  "$.bar..[?(@.example && @.schema)].test": function (scope, fn) {
    let pos = 0;
    if (scope.depth < pos || scope.path[pos] !== "bar") return;
    scope.bail("$.bar..[?(@.example && @.schema)].test", fn, [{
      fn: scope => !(scope.sandbox.value.example && scope.sandbox.value.schema),
      deep: true
    }, {
      fn: scope => scope.property !== "test",
      deep: false
    }]);
  },
  "$..foo..[?( @property >= 900 )]..foo": function (scope, fn) {
    scope.bail("$..foo..[?( @property >= 900 )]..foo", fn, [{
      fn: scope => scope.property !== "foo",
      deep: true
    }, {
      fn: scope => !(scope.sandbox.property >= 900),
      deep: true
    }, {
      fn: scope => scope.property !== "foo",
      deep: true
    }]);
  },
  "$.paths..content.*.examples": function (scope, fn) {
    let pos = 0;
    if (scope.depth < pos || scope.path[pos] !== "paths") return;
    scope.bail("$.paths..content.*.examples", fn, [{
      fn: scope => scope.property !== "content",
      deep: true
    }, {
      fn: () => false,
      deep: false
    }, {
      fn: scope => scope.property !== "examples",
      deep: false
    }]);
  },
  "$.paths..content.bar..examples": function (scope, fn) {
    let pos = 0;
    if (scope.depth < pos || scope.path[pos] !== "paths") return;
    scope.bail("$.paths..content.bar..examples", fn, [{
      fn: scope => scope.property !== "content",
      deep: true
    }, {
      fn: scope => scope.property !== "bar",
      deep: false
    }, {
      fn: scope => scope.property !== "examples",
      deep: true
    }]);
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$..[?(@.example && @.schema)]..[?(@.example && @.schema)]"](scope, _callbacks["$..[?(@.example && @.schema)]..[?(@.example && @.schema)]"]);
    _tree["$..[?( @property >= 400 )]..foo"](scope, _callbacks["$..[?( @property >= 400 )]..foo"]);
    _tree["$..foo..[?( @property >= 900 )]..foo"](scope, _callbacks["$..foo..[?( @property >= 900 )]..foo"]);
    scope.traverse(() => {
      _tree["$.bar..[?(@.example && @.schema)].test"](scope, _callbacks["$.bar..[?(@.example && @.schema)].test"]);
      _tree["$.paths..content.*.examples"](scope, _callbacks["$.paths..content.*.examples"]);
      _tree["$.paths..content.bar..examples"](scope, _callbacks["$.paths..content.bar..examples"]);
    });
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('filter expressions', () => {
    expect(
      generate([
        `$.info..[?(@property.startsWith('foo'))]`,
        `$.info.*[?(@property.startsWith('foo'))]`,
        '$..headers..[?(@.example && @.schema)]',
        '$..[?(@ && @.example)]',
        '$[?(@ && @.example)]',
      ]),
    ).to.eq(`import {Scope} from "nimma/runtime";
const tree = {
  "$.info..[?(@property.startsWith('foo'))]": function (scope, fn) {
    let pos = 0;
    if (scope.depth < pos || scope.path[pos] !== "info") return;
    if (scope.depth === pos || (pos = !scope.sandbox.property.startsWith('foo') ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    fn(scope);
  },
  "$.info.*[?(@property.startsWith('foo'))]": function (scope, fn) {
    let pos = 0;
    if (pos + scope.depth !== 2) return;
    if (scope.path[pos] !== "info") return;
    if (!scope.sandbox.property.startsWith('foo')) return;
    fn(scope);
  },
  "$..headers..[?(@.example && @.schema)]": function (scope, fn) {
    let pos = 0;
    if ((pos = scope.path.indexOf("headers", pos), pos === -1)) return;
    if (scope.depth === pos || (pos = !(scope.sandbox.value.example && scope.sandbox.value.schema) ? -1 : scope.depth, pos === -1)) return;
    if (scope.depth !== pos) return;
    fn(scope);
  },
  "$..[?(@ && @.example)]": function (scope, fn) {
    if (!(scope.sandbox.value && scope.sandbox.value.example)) return;
    fn(scope)
  },
  "$[?(@ && @.example)]": function (scope, fn) {
    if (!(scope.sandbox.value && scope.sandbox.value.example)) return;
    fn(scope)
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _tree["$[?(@ && @.example)]"](scope, _callbacks["$[?(@ && @.example)]"]);
    scope.traverse(() => {
      _tree["$.info..[?(@property.startsWith('foo'))]"](scope, _callbacks["$.info..[?(@property.startsWith('foo'))]"]);
      _tree["$.info.*[?(@property.startsWith('foo'))]"](scope, _callbacks["$.info.*[?(@property.startsWith('foo'))]"]);
      _tree["$..headers..[?(@.example && @.schema)]"](scope, _callbacks["$..headers..[?(@.example && @.schema)]"]);
      _tree["$..[?(@ && @.example)]"](scope, _callbacks["$..[?(@ && @.example)]"]);
    });
  } finally {
    scope.destroy();
  }
}
`);
  });

  describe('fast paths', () => {
    it('root', () => {
      expect(generate(['$'])).to.deep
        .equal(`import {Scope} from "nimma/runtime";
;
export default function (input, callbacks) {
  const scope = new Scope(input);
  ;
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    _callbacks.$(scope)
    ;
  } finally {
    scope.destroy();
  }
}
`);
    });

    it('top-level-wildcard', () => {
      expect(generate(['$[*]', '$.*'])).to.deep
        .equal(`import {Scope, rootChildren} from "nimma/runtime";
const tree = {
  "$[*]": rootChildren
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {
    "$[*]": ["$.*"]
  });
  try {
    _tree["$[*]"](scope, _callbacks["$[*]"]);
    ;
  } finally {
    scope.destroy();
  }
}
`);
    });
  });

  it('deduplicate', () => {
    expect(
      generate(['$.info.contact', '$.info["contact"]', "$.info['contact']"]),
    ).to.eq(`import {Scope, isObject} from "nimma/runtime";
const tree = {
  "$.info.contact": function (scope, fn) {
    const value = scope.sandbox.root?.["info"];
    if (isObject(value)) fn(scope.fork(["info", "contact"]));
  }
};
export default function (input, callbacks) {
  const scope = new Scope(input);
  const _tree = scope.proxyTree(tree);
  const _callbacks = scope.proxyCallbacks(callbacks, {
    "$.info.contact": ["$.info[\\"contact\\"]", "$.info['contact']"]
  });
  try {
    _tree["$.info.contact"](scope, _callbacks["$.info.contact"]);
    ;
  } finally {
    scope.destroy();
  }
}
`);
  });

  it('fallback', () => {
    expect(
      generate(['$.foo^.info'], {
        fallback: (input, path, fn) => {
          // eslint-disable-next-line no-undef
          alternativePath(input, path, fn);
        },
      }),
    ).to.eq(`import {Scope} from "nimma/runtime";
;
export default function (input, callbacks) {
  const scope = new Scope(input);
  ;
  const _callbacks = scope.proxyCallbacks(callbacks, {});
  try {
    for (const path of ["$.foo^.info"]) {
      Function(\`return (input, path, fn) => {
          // eslint-disable-next-line no-undef
          alternativePath(input, path, fn);
        }\`)()(input, path, _callbacks[path])
    }
    ;
  } finally {
    scope.destroy();
  }
}
`);
  });
});
