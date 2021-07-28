export type Callback = (scope: Scope | MinimalScope) => void;

type Path = (string | number)[];

type Input = Record<string, unknown> | unknown[];

type MinimalScope = Partial<Scope> & Pick<Scope, 'path' | 'value'>

export declare class Scope {
  readonly path: Path;
  readonly depth: number;
  readonly property: string | number | null;
  readonly value: unknown;
}

export default class Nimma {
  constructor(expressions: string[], opts?: {
    fallback: ((input: Input, path: Path, fn: (scope: MinimalScope) => void) => void) | null;
    handleBailout: boolean; // todo: rename to unsafe
  }): Nimma;

  public query(input: Input, callbacks: Record<string, Callback>): void;

  public readonly sourceCode: string;
}
