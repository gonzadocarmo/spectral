import { IDocument } from '../document';
import { DocumentInventory } from '../documentInventory';
import { IRuleResult } from '../types';
import { ComputeFingerprintFunc, prepareResults } from '../utils';
import { lintNode } from './lintNode';
import { RunnerRuntime } from './runtime';
import { IRunnerInternalContext } from './types';
import { Ruleset } from '../ruleset/ruleset';
import { Callback } from 'nimma';
import { isPlainObject } from '@stoplight/json';
import { isError } from 'lodash';
import { compileNimma } from '../utils/compileNimma';
import { performance } from 'perf_hooks';

export class Runner {
  public readonly results: IRuleResult[];

  constructor(protected readonly runtime: RunnerRuntime, protected readonly inventory: DocumentInventory) {
    this.results = [...this.inventory.diagnostics, ...(this.inventory.errors ?? [])];
  }

  protected get document(): IDocument {
    return this.inventory.document;
  }

  public addResult(result: IRuleResult): void {
    this.results.push(result);
  }

  public async run(ruleset: Ruleset): Promise<void> {
    this.runtime.emit('setup');

    const { inventory: documentInventory } = this;
    const { rules } = ruleset;

    const runnerContext: IRunnerInternalContext = {
      ruleset,
      documentInventory,
      results: this.results,
      promises: [],
    };

    const enabledRules = Object.values(rules).filter(rule => rule.enabled);
    const relevantRules = enabledRules.filter(rule => rule.matchesFormat(documentInventory.formats));
    const callbacks: { resolved: Record<string, Callback[]>; unresolved: Record<string, Callback[]> } = {
      resolved: {},
      unresolved: {},
    };

    for (const rule of relevantRules) {
      for (const given of rule.given) {
        const cb: Callback = (scope): void => {
          lintNode(
            runnerContext,
            {
              value: scope.value,
              path: scope.path,
            },
            rule,
          );
        };

        (callbacks[rule.resolved ? 'resolved' : 'unresolved'][given] ??= []).push(cb);
      }
    }

    execute(
      runnerContext.documentInventory.resolved,
      callbacks.resolved,
      relevantRules.flatMap(r => (r.resolved ? r.given : [])),
    );
    if (Object.keys(callbacks.unresolved).length > 0) {
      execute(
        runnerContext.documentInventory.unresolved,
        callbacks.unresolved,
        relevantRules.flatMap(r => (!r.resolved ? r.given : [])),
      );
    }

    this.runtime.emit('beforeTeardown');

    try {
      if (runnerContext.promises.length > 0) {
        await Promise.all(runnerContext.promises);
      }
    } finally {
      this.runtime.emit('afterTeardown');
    }
  }

  public getResults(computeFingerprint: ComputeFingerprintFunc): IRuleResult[] {
    return prepareResults(this.results, computeFingerprint);
  }
}

function execute(input: unknown, callbacks: Record<string, Callback[]>, jsonPathExpressions: string[]) {
  if (!isPlainObject(input) && !Array.isArray(input)) {
    for (const cb of callbacks.$ ?? []) {
      cb({
        path: [],
        value: input,
      });
    }
  } else {
    try {
      const a = performance.now();
      const nimma = compileNimma(jsonPathExpressions);
      console.log('compiled!', performance.now() - a);
      nimma.query(
        input,
        Object.entries(callbacks).reduce((mapped, [key, fns]) => {
          mapped[key] = <Callback>(s => {
            for (const fn of fns) {
              fn({
                path: s.path,
                value: s.value,
              });
            }
          });
          return mapped;
        }, {}),
      );
      console.log('executed!', performance.now() - a);
    } catch (e) {
      if (isAggregateError(e) && e.errors.length === 1) {
        throw e.errors[0];
      } else {
        throw e;
      }
    }
  }
}

function isAggregateError(maybeAggregateError: unknown): maybeAggregateError is Error & { errors: unknown[] } {
  return isError(maybeAggregateError) && maybeAggregateError.constructor.name === 'AggregateError';
}
