
// Main PDA simulation engine — nondeterministic (tracks all branches simultaneously)

import { PDAConfig, Configuration, StepResult, SimulationStep, Transition } from '../types/pda.types';

export class PDAEngine {
  private config: PDAConfig;
  private activeConfigurations: Configuration[];
  private history: SimulationStep[];

  constructor(config: PDAConfig) {
    this.config = config;
    const initial: Configuration = { state: config.startState, stack: [], inputPosition: 0 };
    this.activeConfigurations = this.epsilonClosure([initial]);
    this.history = [{ configurations: [...this.activeConfigurations], position: 0 }];
  }

  getCurrentStates(): string[] {
    return [...new Set(this.activeConfigurations.map(c => c.state))];
  }

  getConfigurations(): Configuration[] {
    return this.activeConfigurations;
  }

  getInputPosition(): number {
    if (this.activeConfigurations.length === 0) return 0;
    return Math.max(...this.activeConfigurations.map(c => c.inputPosition));
  }

  getHistory(): SimulationStep[] {
    return this.history;
  }

  private isEpsilon(s: string): boolean {
    return s === '' || s === 'ε';
  }

  private applyTransition(config: Configuration, t: Transition, consumeInput: boolean): Configuration {
    const newStack = [...config.stack];
    if (!this.isEpsilon(t.pop)) newStack.pop();
    if (!this.isEpsilon(t.push)) {
      for (let i = t.push.length - 1; i >= 0; i--) newStack.push(t.push[i]);
    }
    return {
      state: t.to,
      stack: newStack,
      inputPosition: config.inputPosition + (consumeInput ? 1 : 0)
    };
  }

  private canApply(config: Configuration, t: Transition, symbol: string | null): boolean {
    if (t.from !== config.state) return false;

    const isEpsilonRead = this.isEpsilon(t.read);
    if (symbol === null) {
      if (!isEpsilonRead) return false;
    } else {
      if (isEpsilonRead || t.read !== symbol) return false;
    }

    if (!this.isEpsilon(t.pop)) {
      const stackTop = config.stack[config.stack.length - 1];
      if (stackTop === undefined || stackTop !== t.pop) return false;
    }

    return true;
  }

  // Compute epsilon closure: follow all epsilon transitions exhaustively
  private epsilonClosure(configs: Configuration[]): Configuration[] {
    const visited = new Set<string>();
    const result: Configuration[] = [];

    const visit = (config: Configuration, depth: number) => {
      if (depth > 100) return; // guard against infinite epsilon loops
      const key = `${config.state}|${config.inputPosition}|${config.stack.join(',')}`;
      if (visited.has(key)) return;
      visited.add(key);
      result.push(config);

      for (const t of this.config.transitions) {
        if (!this.isEpsilon(t.read)) continue;
        if (!this.canApply(config, t, null)) continue;
        visit(this.applyTransition(config, t, false), depth + 1);
      }
    };

    for (const config of configs) visit(config, 0);
    return result;
  }

  // Advance all active branches by consuming one input symbol
  step(input: string): StepResult {
    const nextMap = new Map<string, Configuration>();

    for (const config of this.activeConfigurations) {
      if (config.inputPosition >= input.length) continue;
      const symbol = input[config.inputPosition];

      for (const t of this.config.transitions) {
        if (this.isEpsilon(t.read)) continue; // epsilon transitions handled in closure
        if (!this.canApply(config, t, symbol)) continue;
        const next = this.applyTransition(config, t, true);
        const key = `${next.state}|${next.inputPosition}|${next.stack.join(',')}`;
        if (!nextMap.has(key)) nextMap.set(key, next);
      }
    }

    const withClosure = this.epsilonClosure([...nextMap.values()]);
    this.activeConfigurations = withClosure;

    const maxPos = withClosure.length > 0
      ? Math.max(...withClosure.map(c => c.inputPosition))
      : (this.history[this.history.length - 1]?.position ?? 0);

    this.history.push({ configurations: [...withClosure], position: maxPos });

    const accepted = withClosure.some(c =>
      c.inputPosition >= input.length &&
      this.config.acceptStates.includes(c.state) &&
      c.stack.length === 0
    );

    return {
      success: withClosure.length > 0,
      activeConfigurations: withClosure,
      inputPosition: maxPos,
      accepted,
      rejected: withClosure.length === 0
    };
  }

  reset(): void {
    const initial: Configuration = { state: this.config.startState, stack: [], inputPosition: 0 };
    this.activeConfigurations = this.epsilonClosure([initial]);
    this.history = [{ configurations: [...this.activeConfigurations], position: 0 }];
  }
}

// Re-export Transition so engine consumers don't need to import types separately
export type { Transition } from '../types/pda.types';
