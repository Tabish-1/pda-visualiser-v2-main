// src/components/PDAVisualiser.tsx

'use client';

import React, { useState, useRef } from 'react';
import { Play, SkipForward, RotateCcw, Save, Upload } from 'lucide-react';
import { PDAEngine } from '../engine/PDAEngine';
import { PDAConfig, Transition, Configuration } from '../types/pda.types';
import { examplePDAs } from '../utils/examples';
import { StateEditor } from './StateEditor';
import { TransitionEditor } from './TransitionEditor';
import { StackVisualiser } from './StackVisualiser';
import { InputTape } from './InputTape';
import { StateDiagram } from './StateDiagram';

type SimStatus = 'idle' | 'ready' | 'stepping' | 'accepted' | 'rejected';

export const PDAVisualiser: React.FC = () => {
  const [states, setStates] = useState<string[]>(['q0', 'q1']);
  const [startState, setStartState] = useState<string>('q0');
  const [acceptStates, setAcceptStates] = useState<string[]>(['q1']);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [input, setInput] = useState<string>('');
  const [engine, setEngine] = useState<PDAEngine | null>(null);
  const [activeConfigurations, setActiveConfigurations] = useState<Configuration[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [simStatus, setSimStatus] = useState<SimStatus>('idle');
  const [stepCount, setStepCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear engine whenever the PDA definition or input changes
  const resetSim = () => {
    setEngine(null);
    setActiveConfigurations([]);
    setSimStatus('idle');
    setStepCount(0);
  };

  const handleStatesChange = (s: string[]) => { setStates(s); resetSim(); };
  const handleStartStateChange = (s: string) => { setStartState(s); resetSim(); };
  const handleAcceptStatesChange = (s: string[]) => { setAcceptStates(s); resetSim(); };
  const handleTransitionsChange = (t: Transition[]) => { setTransitions(t); resetSim(); };
  const handleInputChange = (val: string) => { setInput(val); resetSim(); };

  // Build a fresh engine from current PDA config
  const buildEngine = (): PDAEngine | null => {
    if (states.length === 0 || !startState) {
      alert('Please define at least one state and set a start state');
      return null;
    }
    const config: PDAConfig = { states, inputAlphabet: [], stackAlphabet: [], transitions, startState, acceptStates };
    const e = new PDAEngine(config);
    setEngine(e);
    const initialConfigs = e.getConfigurations();
    setActiveConfigurations(initialConfigs);
    return e;
  };

  // Determine where the simulation stands for a given set of configurations
  const getStatus = (configs: Configuration[], currentInput: string): SimStatus => {
    if (configs.length === 0) return 'rejected';
    const accepted = configs.some(c =>
      c.inputPosition >= currentInput.length &&
      acceptStates.includes(c.state) &&
      c.stack.length === 0
    );
    if (accepted) return 'accepted';
    const allDone = configs.every(c => c.inputPosition >= currentInput.length);
    if (allDone) return 'rejected';
    return 'stepping';
  };

  const stepForward = () => {
    let e = engine;

    // First click: initialise and show the starting configuration
    if (!e) {
      e = buildEngine();
      if (!e) return;
      const initialStatus = getStatus(e.getConfigurations(), input);
      setSimStatus(initialStatus === 'stepping' ? 'ready' : initialStatus);
      return;
    }

    // If already at a terminal state, just refresh the status display
    const current = getStatus(e.getConfigurations(), input);
    if (current !== 'stepping' && current !== 'ready') {
      setSimStatus(current);
      return;
    }

    const result = e.step(input);
    setActiveConfigurations([...result.activeConfigurations]);
    setStepCount(prev => prev + 1);
    setSimStatus(getStatus(result.activeConfigurations, input));
  };

  const playSimulation = async () => {
    let e = engine;
    if (!e) {
      e = buildEngine();
      if (!e) return;
    }

    // Check if already done after init
    const initialStatus = getStatus(e.getConfigurations(), input);
    if (initialStatus !== 'stepping' && initialStatus !== 'ready') {
      setSimStatus(initialStatus);
      return;
    }

    setIsRunning(true);

    while (true) {
      const status = getStatus(e.getConfigurations(), input);
      if (status !== 'stepping' && status !== 'ready') {
        setSimStatus(status);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      const result = e.step(input);
      setActiveConfigurations([...result.activeConfigurations]);
      setStepCount(prev => prev + 1);

      const next = getStatus(result.activeConfigurations, input);
      if (next !== 'stepping') {
        setSimStatus(next);
        break;
      }
      setSimStatus('stepping');
    }

    setIsRunning(false);
  };

  const resetSimulation = () => {
    if (!engine) return;
    engine.reset();
    setActiveConfigurations([...engine.getConfigurations()]);
    setSimStatus('ready');
    setStepCount(0);
  };

  const loadExample = (key: string) => {
    const example = examplePDAs[key];
    setStates(example.states);
    setStartState(example.startState);
    setAcceptStates(example.acceptStates);
    setTransitions(example.transitions);
    setInput('');
    resetSim();
  };

  const saveConfig = () => {
    const config = { states, startState, acceptStates, transitions };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pda-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const cfg = JSON.parse(evt.target?.result as string);
        if (cfg.states && cfg.startState && Array.isArray(cfg.transitions)) {
          setStates(cfg.states);
          setStartState(cfg.startState);
          setAcceptStates(cfg.acceptStates ?? []);
          setTransitions(cfg.transitions);
          setInput('');
          resetSim();
        } else {
          alert('Invalid PDA config file — missing states, startState, or transitions');
        }
      } catch {
        alert('Failed to parse config file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // What states to highlight in the diagram
  const currentStates =
    activeConfigurations.length > 0
      ? [...new Set(activeConfigurations.map(c => c.state))]
      : [startState];

  const maxInputPosition =
    activeConfigurations.length > 0
      ? Math.max(...activeConfigurations.map(c => c.inputPosition))
      : 0;

  const canStep = !isRunning && simStatus !== 'accepted' && simStatus !== 'rejected';
  const canPlay = !isRunning && simStatus !== 'accepted' && simStatus !== 'rejected';
  const canReset = !isRunning && engine !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Pushdown Automata Visualiser
          </h1>
          <p className="text-gray-600 text-lg">
            Interactive tool for learning and visualizing PDAs — with full nondeterminism
          </p>
        </div>

        {/* Example & file controls */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="font-semibold mb-3 text-lg">Load Example PDA</h3>
          <div className="flex gap-2 flex-wrap items-center">
            <button onClick={() => loadExample('balancedParentheses')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors shadow-sm">
              Balanced Parentheses
            </button>
            <button onClick={() => loadExample('anbn')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors shadow-sm">
              aⁿbⁿ Language
            </button>
            <button onClick={() => loadExample('palindrome')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors shadow-sm">
              Palindrome (Odd)
            </button>

            <div className="ml-auto flex gap-2">
              <input ref={fileInputRef} type="file" accept=".json" onChange={loadConfig} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 flex items-center gap-2 transition-colors shadow-sm">
                <Upload size={16} /> Load File
              </button>
              <button onClick={saveConfig}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors shadow-sm">
                <Save size={16} /> Save Config
              </button>
            </div>
          </div>
        </div>

        {/* PDA definition editors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StateEditor
            states={states}
            onStatesChange={handleStatesChange}
            startState={startState}
            acceptStates={acceptStates}
            onStartStateChange={handleStartStateChange}
            onAcceptStatesChange={handleAcceptStatesChange}
          />
          <TransitionEditor
            transitions={transitions}
            states={states}
            onTransitionsChange={handleTransitionsChange}
          />
        </div>

        {/* Simulation controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="font-semibold mb-4 text-lg">Simulation Controls</h3>

          <div className="mb-4">
            <input
              type="text"
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Enter input string (e.g. ()(), aabb, abcba) — changing this resets the simulation"
              className="border border-gray-300 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={stepForward}
              disabled={!canStep}
              className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm font-semibold"
            >
              <SkipForward size={18} />
              {simStatus === 'idle' ? 'Start / Step' : 'Step Forward'}
            </button>
            <button
              onClick={playSimulation}
              disabled={!canPlay}
              className="bg-green-700 text-white px-5 py-3 rounded-lg hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm font-semibold"
            >
              <Play size={18} />
              {isRunning ? 'Running…' : 'Play All'}
            </button>
            <button
              onClick={resetSimulation}
              disabled={!canReset}
              className="bg-orange-500 text-white px-5 py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm font-semibold"
            >
              <RotateCcw size={18} /> Reset
            </button>
            {stepCount > 0 && (
              <span className="text-gray-500 text-sm ml-1">Step {stepCount}</span>
            )}
          </div>

          {/* Status banner */}
          {simStatus !== 'idle' && (
            <div className={`mt-4 p-4 rounded-lg font-semibold text-base ${
              simStatus === 'accepted'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : simStatus === 'rejected'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
              {simStatus === 'accepted' && ' String Accepted — at least one branch reached an accept state with empty stack'}
              {simStatus === 'rejected' && ' String Rejected — no branch reached an accept state with empty stack'}
              {simStatus === 'ready'    && `Ready — ${activeConfigurations.length} starting branch${activeConfigurations.length !== 1 ? 'es' : ''} (click Step Forward to advance)`}
              {simStatus === 'stepping' && `Step ${stepCount} — ${activeConfigurations.length} active branch${activeConfigurations.length !== 1 ? 'es' : ''}`}
            </div>
          )}
        </div>

        {/* Visualisation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <StateDiagram
              states={states}
              transitions={transitions}
              currentStates={currentStates}
              startState={startState}
              acceptStates={acceptStates}
            />
          </div>
          <div>
            <StackVisualiser
              configurations={activeConfigurations}
              acceptStates={acceptStates}
            />
          </div>
        </div>

        <InputTape input={input} position={maxInputPosition} />

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-3 text-lg">📖 How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Load a built-in example <strong>or</strong> load a saved JSON file with <em>Load File</em></li>
            <li>Or define your own PDA: add states (left panel), then transitions (right panel)</li>
            <li>Mark the start state (radio) and accept states (checkbox) in the States panel</li>
            <li>Type any input string — the simulation resets automatically when it changes</li>
            <li>Click <strong>Start / Step</strong> once to initialise, then again to advance one symbol at a time</li>
            <li>Or click <strong>Play All</strong> to run the full simulation automatically</li>
            <li><strong>All nondeterministic branches run in parallel</strong> — blue states are active, green are accepting</li>
            <li>Each branch&apos;s stack is shown separately in the Stack panel</li>
            <li>Use <strong>Save Config</strong> to export your PDA and reload it later with <em>Load File</em></li>
          </ol>
        </div>

      </div>
    </div>
  );
};
