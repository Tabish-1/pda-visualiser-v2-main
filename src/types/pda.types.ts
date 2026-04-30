
// the TypeScript interfaces for PDA.

export interface Transition {
  from: string;
  to: string;
  read: string;  // read from input
  pop: string;   // pop from stack
  push: string;  // push to stack
}

// One active branch in the nondeterministic simulation
export interface Configuration {
  state: string;
  stack: string[];
  inputPosition: number;
}

export interface PDAConfig {
  states: string[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  transitions: Transition[];
  startState: string;
  acceptStates: string[];
}

export interface StepResult {
  success: boolean;
  activeConfigurations: Configuration[];
  inputPosition: number;
  accepted: boolean;
  rejected: boolean;
  message?: string;
}

export interface SimulationStep {
  configurations: Configuration[];
  position: number;
}
