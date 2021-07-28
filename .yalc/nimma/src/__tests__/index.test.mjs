import mocha from 'mocha';
import chai from 'chai';
import Nimma from '../index.mjs';

const { describe, it } = mocha;
const { expect } = chai;

function collect(input, expressions) {
  const collected = {};
  const _ = (expr, scope) => {
    collected[expr] ??= [];
    collected[expr].push([scope.value, [...scope.path]]);
  };

  const n = new Nimma(expressions);

  n.query(
    input,
    expressions.reduce((mapped, expression) => {
      mapped[expression] = _.bind(null, expression);
      return mapped;
    }, {}),
  );

  return collected;
}

describe('Nimma', () => {
  it('root', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, ['$']);
    expect(collected).to.deep.equal({
      $: [[document, []]],
    });
  });

  it('works', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, ['$.info.contact']);
    expect(collected).to.deep.equal({
      '$.info.contact': [[{ test: 'c' }, ['info', 'contact']]],
    });
  });

  it('works #2', () => {
    const document = {
      info: {
        contact: {
          foo: 'bar',
          test: 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, ['$.info.contact.*']);
    expect(collected).to.deep.equal({
      '$.info.contact.*': [
        ['bar', ['info', 'contact', 'foo']],
        ['c', ['info', 'contact', 'test']],
      ],
    });
  });

  it('works #3', () => {
    const document = {
      info: {
        contact: {
          bar: false,
          foo: 'a',
          'foo-2': 'b',
          'foo-3': 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, [
      '$.info..[?(@property.startsWith("foo"))]',
    ]);

    expect(collected).to.deep.equal({
      '$.info..[?(@property.startsWith("foo"))]': [
        ['a', ['info', 'contact', 'foo']],
        ['b', ['info', 'contact', 'foo-2']],
        ['c', ['info', 'contact', 'foo-3']],
      ],
    });
  });

  it('works #4', () => {
    const document = {
      info: {
        contact: {
          bar: false,
          foo: 'a',
          'foo-2': 'b',
          'foo-3': 'c',
        },
        x: 'foo',
      },
    };

    const collected = collect(document, [
      '$.info..*[?(@property.startsWith("foo"))]',
    ]);

    expect(collected).to.deep.equal({
      '$.info..*[?(@property.startsWith("foo"))]': [
        ['a', ['info', 'contact', 'foo']],
        ['b', ['info', 'contact', 'foo-2']],
        ['c', ['info', 'contact', 'foo-3']],
      ],
    });
  });

  it('works #5', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        x: '',
      },
    };

    const collected = collect(document, [
      "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
    ]);

    expect(collected).to.deep.equal({
      "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
        ],
    });
  });

  it('works #6', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        x: '',
      },
    };

    const collected = collect(document, [
      "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
    ]);

    expect(collected).to.deep.equal({
      "$..[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
          [{}, ['paths', 'foo', 'get', 'post']],
        ],
    });
  });

  it('works #7', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        x: '',
      },
    };

    const collected = collect(document, [
      "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
    ]);

    expect(collected).to.deep.equal({
      "$..paths..[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
          [{}, ['paths', 'foo', 'get', 'post']],
        ],
    });
  });

  it('works #8', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        x: '',
      },
    };

    const collected = collect(document, [
      "$..paths..*[?( @property === 'get' || @property === 'put' || @property === 'post' )]",
    ]);
    expect(collected).to.deep.equal({
      "$..paths..*[?( @property === 'get' || @property === 'put' || @property === 'post' )]":
        [
          [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
          [{ baz: 2 }, ['paths', 'bar', 'get', 'put']],
          [2, ['paths', 'bar', 'put']],
          [{ post: {} }, ['paths', 'foo', 'get']],
          [{}, ['paths', 'foo', 'get', 'post']],
        ],
    });
  });

  it('works #9', () => {
    const document = {
      paths: {
        bar: {
          get: {
            put: {
              baz: 2,
            },
          },
          put: 2,
        },
        foo: {
          get: {
            post: {},
          },
        },
        get: {},
        x: '',
      },
    };

    const collected = collect(document, ['$..paths..get']);
    expect(collected).to.deep.equal({
      '$..paths..get': [
        [{ put: { baz: 2 } }, ['paths', 'bar', 'get']],
        [{ post: {} }, ['paths', 'foo', 'get']],
        [{}, ['paths', 'get']],
      ],
    });
  });

  it('works #10', () => {
    const document = {
      bar: {
        foo: {
          bar: {
            c: true,
            bar: {
              x: {
                c: false,
              },
            },
          },
        },
      },
      foo: {
        x: {
          bar: {
            d: {
              c: 'yup!',
            },
          },
        },
      },
    };

    const collected = collect(document, ['$..bar..c']);
    expect(collected).to.deep.equal({
      '$..bar..c': [
        [true, ['bar', 'foo', 'bar', 'c']],
        [false, ['bar', 'foo', 'bar', 'bar', 'x', 'c']],
        ['yup!', ['foo', 'x', 'bar', 'd', 'c']],
      ],
    });
  });

  it('works #11', () => {
    const document = {
      bar: {
        200: {
          foo: 'a',
          z: {
            foo: 'b',
          },
        },
        401: {
          foo: 'c',
          z: {
            foo: 'd',
            900: {
              foo: 'e',
            },
          },
        },
      },
    };

    const collected = collect(document, ['$.bar[?( @property >= 400 )]..foo']);
    expect(collected).to.deep.equal({
      '$.bar[?( @property >= 400 )]..foo': [
        ['c', ['bar', '401', 'foo']],
        ['e', ['bar', '401', 'z', '900', 'foo']],
        ['d', ['bar', '401', 'z', 'foo']],
      ],
    });
  });

  it('works #12', () => {
    const document = {
      bar: {
        200: {
          foo: 'a',
          z: {
            foo: 'b',
          },
        },
        401: {
          foo: 'c',
          z: {
            foo: 'd',
            900: {
              foo: 'e',
            },
          },
        },
      },
    };

    const collected = collect(document, ['$..[?( @property >= 400 )]..foo']);
    expect(collected).to.deep.equal({
      '$..[?( @property >= 400 )]..foo': [
        ['c', ['bar', '401', 'foo']],
        ['e', ['bar', '401', 'z', '900', 'foo']],
        ['d', ['bar', '401', 'z', 'foo']],
        ['e', ['bar', '401', 'z', '900', 'foo']],
      ],
    });
  });

  it('works #13', () => {
    const document = {
      bar: {
        200: {
          foo: 'a',
          z: {
            foo: 'b',
          },
        },
        401: {
          foo: 'c',
          z: {
            foo: {
              900: {
                foo: 'e',
              },
            },
          },
        },
      },
    };

    const collected = collect(document, [
      '$..foo..[?( @property >= 900 )]..foo',
    ]);

    expect(collected).to.deep.equal({
      '$..foo..[?( @property >= 900 )]..foo': [
        ['e', ['bar', '401', 'z', 'foo', '900', 'foo']],
      ],
    });
  });

  it('works #14', () => {
    const document = {
      bar: {
        examples: {
          foo: 'a',
          z: {
            foo: 'b',
          },
        },
      },
    };

    const collected = collect(document, ['$..examples.*', '$..examples..*']);
    expect(collected).to.deep.equal({
      '$..examples.*': [
        ['a', ['bar', 'examples', 'foo']],
        [{ foo: 'b' }, ['bar', 'examples', 'z']],
      ],
      '$..examples..*': [
        ['a', ['bar', 'examples', 'foo']],
        [{ foo: 'b' }, ['bar', 'examples', 'z']],
        ['b', ['bar', 'examples', 'z', 'foo']],
      ],
    });
  });

  it('works #15', () => {
    const document = {
      info: {
        contact: {
          test: 'c',
        },
      },
    };

    const collected = collect(document, ['$.info']);

    expect(collected).to.deep.equal({
      '$.info': [[{ contact: { test: 'c' } }, ['info']]],
    });
  });

  it('works #16', () => {
    const document = {
      parameters: [
        {
          in: 'header',
          name: 'fooA',
        },
      ],
      foo: {
        parameters: [
          {
            in: 'header',
            name: 'd 1',
          },
        ],
      },
    };
    const collected = collect(document, [
      "$..parameters[?(@.in === 'header')]",
    ]);
    expect(collected).to.deep.equal({
      "$..parameters[?(@.in === 'header')]": [
        [{ in: 'header', name: 'fooA' }, ['parameters', 0]],
        [{ in: 'header', name: 'd 1' }, ['foo', 'parameters', 0]],
      ],
    });
  });

  it('works #17', () => {
    const document = {
      user: {
        name: 'Eva',
      },
      foo: {
        user: {
          name: 'John',
        },
      },
    };
    const collected = collect(document, [
      "$..[?(@parentProperty === 'user' && @.name)]",
    ]);
    expect(collected).to.deep.equal({
      "$..[?(@parentProperty === 'user' && @.name)]": [
        [{ name: 'Eva' }, ['user']],
        [{ name: 'John' }, ['foo', 'user']],
      ],
    });
  });

  it('works #18', () => {
    const document = {
      example: 'test',
      examples: {
        user: {
          name: 'Eva',
        },
        foo: {
          user: {
            name: 'John',
          },
        },
      },
      author: {
        name: 'Jakub',
      },
    };

    const collected = collect(document, ['$.examples..*']);
    expect(collected).to.deep.eq({
      '$.examples..*': [
        [{ name: 'Eva' }, ['examples', 'user']],
        ['Eva', ['examples', 'user', 'name']],
        [{ user: { name: 'John' } }, ['examples', 'foo']],
        [{ name: 'John' }, ['examples', 'foo', 'user']],
        ['John', ['examples', 'foo', 'user', 'name']],
      ],
    });
  });
});
