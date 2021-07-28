import Nimma from 'nimma';
import { JSONPath } from 'jsonpath-plus';
import { toPath } from 'lodash';

global[Symbol.for('@stoplight/spectral/jsonpath-plus')] = JSONPath;
global[Symbol.for('@stoplight/spectral/toPath')] = toPath;

function isOptionalSupported(): boolean {
  try {
    const foo = { bar: 2 };
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return Function('foo', 'return foo?.bar')(foo) === foo.bar;
  } catch {
    return false;
  }
}

export function compileNimma(jsonPaths: string[]) {
  const nimma = new Nimma(jsonPaths, {
    // @ts-expect-error:
    format: isOptionalSupported(),
    handleBailout: false,
    fallback: (input, path, fn): void => {
      console.log(path);
      // (global[Symbol.for('@stoplight/spectral/jsonpath-plus')] as typeof JSONPath)({
      //   path,
      //   json: input,
      //   resultType: 'all',
      //   callback: (result =>
      //     void fn({
      //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
      //       path: (global[Symbol.for('@stoplight/spectral/toPath')] as typeof toPath)(result.path.slice(1)),
      //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      //       value: result.value as unknown,
      //     })) as JSONPathCallback,
      // });
    },
  });
  console.log(nimma.sourceCode);
  return nimma;
}
