'use client';

// PDA Visualiser - Built for Automata Theory course
// Author: Tabish Shoukat
// Last updated: March 2026

import React, { useState, useEffect, useRef } from 'react';

// Type definitions for PDA structure
interface Transition {
  from: string;
  read: string;
  pop: string;
  push: string;
  to: string;
}

interface PDA {
  states: string[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  transitions: Transition[];
}

interface Example {
  name: string;
  states: string[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  transitions: Transition[];
  testString: string;
}

// Pre-loaded example PDAs for testing
// TODO: Add more examples (divisible by 3, even parity, etc.)
const examples: Record<string, Example> = {
  balanced: {
    name: 'Balanced Parentheses',
    states: ['q0', 'q1', 'q2*'],
    inputAlphabet: ['(', ')'],
    stackAlphabet: ['Z0', 'A'],
    transitions: [
      { from: 'q0', read: '(', pop: 'Z0', push: 'AZ0', to: 'q0' },
      { from: 'q0', read: '(', pop: 'A', push: 'AA', to: 'q0' },
      { from: 'q0', read: ')', pop: 'A', push: '', to: 'q0' },
      { from: 'q0', read: 'ε', pop: 'Z0', push: '', to: 'q2' }
    ],
    testString: '(())'
  },
  anbn: {
    name: 'aⁿbⁿ Language',
    states: ['q0', 'q1', 'q2*'],
    inputAlphabet: ['a', 'b'],
    stackAlphabet: ['Z0', 'A'],
    transitions: [
      { from: 'q0', read: 'a', pop: 'Z0', push: 'AZ0', to: 'q0' },
      { from: 'q0', read: 'a', pop: 'A', push: 'AA', to: 'q0' },
      { from: 'q0', read: 'b', pop: 'A', push: '', to: 'q1' },
      { from: 'q1', read: 'b', pop: 'A', push: '', to: 'q1' },
      { from: 'q1', read: 'ε', pop: 'Z0', push: 'Z0', to: 'q2' }
    ],
    testString: 'aabb'
  },
  palindrome: {
    name: 'wcwᴿ Palindrome',
    states: ['q0', 'q1', 'q2*'],
    inputAlphabet: ['a', 'b', 'c'],
    stackAlphabet: ['Z0', 'A', 'B'],
    transitions: [
      { from: 'q0', read: 'a', pop: 'Z0', push: 'AZ0', to: 'q0' },
      { from: 'q0', read: 'a', pop: 'A', push: 'AA', to: 'q0' },
      { from: 'q0', read: 'a', pop: 'B', push: 'AB', to: 'q0' },
      { from: 'q0', read: 'b', pop: 'Z0', push: 'BZ0', to: 'q0' },
      { from: 'q0', read: 'b', pop: 'A', push: 'BA', to: 'q0' },
      { from: 'q0', read: 'b', pop: 'B', push: 'BB', to: 'q0' },
      { from: 'q0', read: 'c', pop: '', push: '', to: 'q1' },
      { from: 'q1', read: 'a', pop: 'A', push: '', to: 'q1' },
      { from: 'q1', read: 'b', pop: 'B', push: '', to: 'q1' },
      { from: 'q1', read: 'ε', pop: 'Z0', push: 'Z0', to: 'q2' }
    ],
    testString: 'abcba'
  }
};

export default function PDAVisualiser() {
  // Theme state
  const [theme, setTheme] = useState('dark');
  
  // UI state
  const [howItWorksCollapsed, setHowItWorksCollapsed] = useState(false);
  
  // PDA configuration
  const [pda, setPda] = useState<PDA | null>(null);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  
  // Test input
  const [testInput, setTestInput] = useState('');
  
  // Simulation state
  const [stack, setStack] = useState(['Z0']);
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [tapePosition, setTapePosition] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  
  // Settings
  const [simulationSpeed, setSimulationSpeed] = useState(800); // Default: medium speed
  const [resultStatus, setResultStatus] = useState<'idle' | 'running' | 'accepted' | 'rejected'>('idle');
  const [resultMessage, setResultMessage] = useState('Enter an input string and click Play to simulate');
  const [stepLog, setStepLog] = useState<string[]>([]);
  
  // Auto-generate
  const [nlDescription, setNlDescription] = useState('');
  const [nlError, setNlError] = useState('');
  
  // Manual configuration
  const [statesInput, setStatesInput] = useState('');
  const [inputAlphabet, setInputAlphabet] = useState('');
  const [stackAlphabet, setStackAlphabet] = useState('');

  // Refs for canvas and DOM elements
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepLogRef = useRef<HTMLDivElement>(null);

  function getStartState(states: string[]): string {
    return states.find(s => !s.includes('*')) || states[0]?.replace('*', '') || '';
  }

  function getAcceptStates(states: string[]): string[] {
    return states.filter(s => s.includes('*')).map(s => s.replace('*', ''));
  }

  function isAcceptState(s: string): boolean {
    const cleanState = s.replace('*', '');
    if (pda) {
      const acceptStates = getAcceptStates(pda.states);
      return acceptStates.includes(cleanState) || s.includes('*');
    }
    return false;
  }

  function loadExample(key: string) {
    const example = examples[key];
    if (!example) return;

    const newPda = {
      states: [...example.states],
      inputAlphabet: [...example.inputAlphabet],
      stackAlphabet: [...example.stackAlphabet],
      transitions: example.transitions.map(t => ({ ...t }))
    };

    setPda(newPda);
    setTransitions([...newPda.transitions]);
    setStatesInput(example.states.join(', '));
    setInputAlphabet(example.inputAlphabet.join(', '));
    setStackAlphabet(example.stackAlphabet.join(', '));
    setTestInput(example.testString);
    setNlError('');
    resetSimulation();
    setTimeout(() => drawCanvas(), 100);
  }

  function resetSimulation() {
    setIsRunning(false);
    setStepCount(0);
    setTapePosition(0);
    setStack(['Z0']);
    setCurrentState(pda ? getStartState(pda.states) : null);
    setResultStatus('idle');
    setResultMessage('Enter an input string and click Play to simulate');
    setStepLog([]);
  }

  function addStepLog(message: string) {
    setStepLog(prev => [...prev.slice(-199), message]);
    setTimeout(() => {
      if (stepLogRef.current) {
        stepLogRef.current.scrollTop = stepLogRef.current.scrollHeight;
      }
    }, 0);
  }

  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas || !pda) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    
    // Clear completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Fill background
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const states = pda.states;
    const acceptStates = getAcceptStates(states);
    const startState = getStartState(states);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3.5;

    const statePositions: Record<string, { x: number; y: number }> = {};
    const angleStep = (2 * Math.PI) / states.length;

    states.forEach((s, i) => {
      const angle = i * angleStep - Math.PI / 2;
      statePositions[s] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    const colors = {
      text: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
      text2: getComputedStyle(document.documentElement).getPropertyValue('--text2').trim(),
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
      border: getComputedStyle(document.documentElement).getPropertyValue('--border').trim(),
      surface: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim(),
      green: getComputedStyle(document.documentElement).getPropertyValue('--green').trim(),
      cyan: getComputedStyle(document.documentElement).getPropertyValue('--cyan').trim()
    };

    // Draw transitions FIRST (behind states)
    pda.transitions.forEach(t => {
      const fromPos = statePositions[t.from];
      const toPos = statePositions[t.to];
      if (!fromPos || !toPos) return;
      
      const isActive = currentState && currentState.replace('*', '') === t.from.replace('*', '');
      
      if (t.from === t.to) {
        // Self-loop
        const loopSize = 40;
        ctx.beginPath();
        ctx.moveTo(fromPos.x - 10, fromPos.y - 20);
        ctx.quadraticCurveTo(fromPos.x - loopSize, fromPos.y - loopSize * 1.5, fromPos.x + 10, fromPos.y - 20);
        ctx.strokeStyle = isActive ? colors.accent : colors.text2;
        ctx.lineWidth = isActive ? 2 : 1.5;
        ctx.stroke();
        
        // Label background
        ctx.fillStyle = colors.surface;
        ctx.fillRect(fromPos.x - 40, fromPos.y - loopSize * 1.5 - 10, 80, 20);
        
        // Label text
        ctx.fillStyle = isActive ? colors.accent : colors.text;
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${t.read},${t.pop}→${t.push || 'ε'}`, fromPos.x, fromPos.y - loopSize * 1.5);
      } else {
        // Regular transition
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        const controlX = midX - (toPos.y - fromPos.y) * 0.3;
        const controlY = midY + (toPos.x - fromPos.x) * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.quadraticCurveTo(controlX, controlY, toPos.x, toPos.y);
        ctx.strokeStyle = isActive ? colors.accent : colors.text2;
        ctx.lineWidth = isActive ? 2 : 1.5;
        ctx.stroke();
        
        // Label background
        ctx.fillStyle = colors.surface;
        ctx.fillRect(controlX - 35, controlY - 10, 70, 20);
        
        // Label text
        ctx.fillStyle = isActive ? colors.accent : colors.text;
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${t.read}/${t.pop}→${t.push || 'ε'}`, controlX, controlY - 10);
      }
    });

    // Draw states LAST (on top)
    states.forEach(s => {
      const pos = statePositions[s];
      const isStart = s.replace('*', '') === startState;
      const isAccept = acceptStates.includes(s.replace('*', ''));
      const isCurrent = currentState && currentState.replace('*', '') === s.replace('*', '');
      const stateRadius = 25;
      
      // Glow for current state
      if (isCurrent) {
        ctx.save();
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, stateRadius + 5, 0, 2 * Math.PI);
        ctx.fillStyle = colors.accent;
        ctx.fill();
        ctx.restore();
      }
      
      // State circle (white background to cover any overlap)
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, stateRadius, 0, 2 * Math.PI);
      ctx.fillStyle = colors.surface;
      ctx.fill();
      ctx.lineWidth = isCurrent ? 3 : 2;
      ctx.strokeStyle = isCurrent ? colors.accent : colors.border;
      ctx.stroke();
      
      // Accept state (double circle)
      if (isAccept) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, stateRadius - 5, 0, 2 * Math.PI);
        ctx.strokeStyle = colors.green;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Start state arrow
      if (isStart && !isCurrent) {
        ctx.beginPath();
        ctx.moveTo(pos.x - stateRadius - 30, pos.y);
        ctx.lineTo(pos.x - stateRadius, pos.y);
        ctx.strokeStyle = colors.cyan;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // State label (with background to prevent overwrite)
      ctx.fillStyle = colors.surface;
      ctx.fillRect(pos.x - 20, pos.y - 10, 40, 20);
      
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s, pos.x, pos.y);
    });
  }

  function handleGenerate() {
    const desc = nlDescription.toLowerCase();
    let key = '';
    
    if (desc.includes('balanced') && desc.includes('parenthes')) key = 'balanced';
    else if (desc.includes('equal') && (desc.includes('a') || desc.includes('b'))) key = 'anbn';
    else if (desc.includes('palindrome') || desc.includes('reverse')) key = 'palindrome';
    
    if (key) {
      loadExample(key);
      setNlError('');
    } else {
      setNlError('Try: "balanced parentheses", "equal a\'s and b\'s", or "palindrome"');
    }
  }

  function runSimulation() {
    if (!pda || !testInput) return;
    
    resetSimulation();
    setIsRunning(true);
    setResultStatus('running');
    setResultMessage('⏳ Running simulation...');
    
    let currentStack = ['Z0'];
    let currentPos = 0;
    let currentStep = 0;
    let currentStateTemp = getStartState(pda.states);
    const maxSteps = 500;
    
    const runStep = () => {
      if (currentStep >= maxSteps) {
        setResultStatus('rejected');
        setResultMessage('❌ REJECTED — Max steps reached');
        setIsRunning(false);
        return;
      }
      
      const readSymbol = currentPos < testInput.length ? testInput[currentPos] : 'ε';
      const topOfStack = currentStack.length > 0 ? currentStack[currentStack.length - 1] : null;
      
      const availableTransitions = pda.transitions.filter(t => {
        const fromMatch = t.from.replace('*', '') === currentStateTemp.replace('*', '');
        const readMatch = t.read === 'ε' || t.read === readSymbol;
        const popMatch = t.pop === 'ε' || t.pop === '' || t.pop === topOfStack;
        return fromMatch && readMatch && popMatch;
      });
      
      if (availableTransitions.length === 0) {
        if (isAcceptState(currentStateTemp) && currentStack.length === 1 && currentPos >= testInput.length) {
          setResultStatus('accepted');
          setResultMessage('✅ ACCEPTED — String matches!');
          addStepLog(`Step ${currentStep}: ACCEPTED`);
        } else {
          setResultStatus('rejected');
          setResultMessage(`❌ REJECTED — No transition from ${currentStateTemp}`);
        }
        setIsRunning(false);
        return;
      }
      
      const t = availableTransitions[0];
      
      if (t.pop !== 'ε' && t.pop !== '' && currentStack.length > 0) {
        currentStack.pop();
      }
      if (t.push !== '' && t.push !== 'ε') {
        for (const char of t.push) {
          currentStack.push(char);
        }
      }
      
      if (t.read !== 'ε' && t.read === readSymbol && currentPos < testInput.length) {
        currentPos++;
      }
      
      currentStateTemp = t.to;
      setCurrentState(t.to);
      setStack([...currentStack]);
      setTapePosition(currentPos);
      setStepCount(++currentStep);
      
      // Plain text step log (no HTML)
      const readText = t.read === 'ε' ? 'ε' : readSymbol;
      const popText = t.pop || 'ε';
      const pushText = t.push || 'ε';
      
      addStepLog(
        `#${currentStep} ${t.from} → Read: ${readText} → Pop: ${popText} → Push: ${pushText} → ${t.to}`
      );
      
      setTimeout(runStep, 2100 - simulationSpeed);
    };
    
    runStep();
  }

  useEffect(() => {
    loadExample('balanced');
  }, []);

  useEffect(() => {
    if (pda && currentState) {
      drawCanvas();
    }
  }, [pda, currentState]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">P</div>
          <div>
            <div className="header-title">PDA Visualiser</div>
            <div className="header-tagline">Pushdown Automata Simulator</div>
          </div>
        </div>
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </header>

      {/* How It Works */}
      <section className={`how-it-works ${howItWorksCollapsed ? 'collapsed' : ''}`}>
        <div className="how-it-works-header" onClick={() => setHowItWorksCollapsed(!howItWorksCollapsed)}>
          <h3 className="how-it-works-title">
            <span></span> How It Works
          </h3>
          <span className="how-it-works-toggle">▼</span>
        </div>
        <div className="how-it-works-content">
          <div className="hiw-card">
            <h4>What is a PDA?</h4>
            <p>A Pushdown Automaton is a finite automaton with an auxiliary stack memory, enabling it to recognize context-free languages like balanced parentheses and palindromes.</p>
          </div>
          <div className="hiw-card">
            <h4>How the Stack Works</h4>
            <p>The stack follows LIFO (Last-In-First-Out): symbols are pushed on top and popped from top. The bottom marker Z₀ indicates an empty stack.</p>
          </div>
          <div className="hiw-card">
            <h4>How to Use</h4>
            <ol>
              <li>Select a pre-loaded example or describe your own PDA</li>
              <li>Enter an input string to test</li>
              <li>Click Play or press Space to step through</li>
              <li>Watch the state diagram and stack animate</li>
              <li>See if the string is ACCEPTED or REJECTED</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Quick Builder */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <span></span> Quick Builder
            </h3>
            <div className="form-group">
              <label className="form-label">What should the PDA accept?</label>
              <textarea
                className="form-textarea"
                defaultValue={nlDescription}
                onChange={(e) => setNlDescription(e.target.value)}
                placeholder="e.g., strings with equal a's and b's"
              />
              <p className="form-helper">Type a description to auto-generate</p>
              {nlError && <p className="form-error">{nlError}</p>}
            </div>
            <button className="btn btn-primary btn-full" onClick={handleGenerate}>
              <span>⚡ Auto-Generate</span>
            </button>
          </div>

          {/* Examples */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <span></span> Examples
            </h3>
            <div className="example-grid">
              {Object.entries(examples).map(([key, example]) => (
                <div
                  key={key}
                  className="example-card"
                  onClick={() => loadExample(key)}
                >
                  <div className="example-name">{example.name}</div>
                  <div className="example-desc">Try: {example.testString}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="sidebar-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 className="sidebar-title" style={{ margin: 0 }}>
                <span>⚙️</span> Configuration (Editable)
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setStatesInput('');
                  setInputAlphabet('');
                  setStackAlphabet('');
                  setTransitions([]);
                  setPda(null);
                  resetSimulation();
                  setTestInput('');
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                  }
                }}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
              >
                 Clear All
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">States (comma-separated)</label>
              <input 
                type="text" 
                className="form-input" 
                value={statesInput}
                onChange={(e) => setStatesInput(e.target.value)}
                placeholder="q0, q1, q2*"
              />
              <p className="form-helper">* marks accept state (e.g., q2*)</p>
            </div>
            <div className="form-group">
              <label className="form-label">Input Alphabet (comma-separated)</label>
              <input 
                type="text" 
                className="form-input"
                value={inputAlphabet}
                onChange={(e) => setInputAlphabet(e.target.value)}
                placeholder="a, b, (, )"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stack Alphabet (comma-separated)</label>
              <input 
                type="text" 
                className="form-input"
                value={stackAlphabet}
                onChange={(e) => setStackAlphabet(e.target.value)}
                placeholder="Z0, A, B"
              />
              <p className="form-helper">Z₀ = bottom marker</p>
            </div>
            <button 
              className="btn btn-primary btn-full mt-2"
              onClick={() => {
                if (!statesInput) {
                  alert('Please enter at least one state');
                  return;
                }
                // Parse and update PDA
                const states = statesInput.split(',').map(s => s.trim()).filter(s => s);
                const inputAlpha = inputAlphabet.split(',').map(s => s.trim()).filter(s => s);
                const stackAlpha = stackAlphabet.split(',').map(s => s.trim()).filter(s => s);
                
                const newPda = {
                  states,
                  inputAlphabet: inputAlpha,
                  stackAlphabet: stackAlpha,
                  transitions: [...transitions]
                };
                
                setPda(newPda);
                resetSimulation();
                // Force canvas redraw with new state names
                setTimeout(() => {
                  drawCanvas();
                }, 50);
                alert(`Configuration updated with states: ${states.join(', ')}\nState diagram updated!`);
              }}
            >
               Update Configuration
            </button>
          </div>

          {/* Add Transition */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <span></span> Add Transition
            </h3>
            <div className="form-group">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="From (e.g., q0)"
                  id="transFrom"
                  style={{ fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Read (e.g., a or ε)"
                  id="transRead"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Pop (e.g., Z0 or ε)"
                  id="transPop"
                  style={{ fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Push (e.g., AZ0 or ε)"
                  id="transPush"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="To (e.g., q1)"
                  id="transTo"
                  style={{ fontSize: '0.8rem' }}
                />
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const from = (document.getElementById('transFrom') as HTMLInputElement).value.trim();
                    const read = (document.getElementById('transRead') as HTMLInputElement).value.trim() || 'ε';
                    const pop = (document.getElementById('transPop') as HTMLInputElement).value.trim() || 'ε';
                    const push = (document.getElementById('transPush') as HTMLInputElement).value.trim() || '';
                    const to = (document.getElementById('transTo') as HTMLInputElement).value.trim();
                    
                    if (!from || !to) {
                      alert('From and To states are required');
                      return;
                    }
                    
                    const newTransition: Transition = { from, read, pop, push, to };
                    setTransitions(prev => [...prev, newTransition]);
                    
                    // Update PDA if it exists
                    if (pda) {
                      setPda({ ...pda, transitions: [...transitions, newTransition] });
                    }
                    
                    // Clear inputs
                    (document.getElementById('transFrom') as HTMLInputElement).value = '';
                    (document.getElementById('transRead') as HTMLInputElement).value = '';
                    (document.getElementById('transPop') as HTMLInputElement).value = '';
                    (document.getElementById('transPush') as HTMLInputElement).value = '';
                    (document.getElementById('transTo') as HTMLInputElement).value = '';
                    
                    drawCanvas();
                  }}
                >
                  Add
                </button>
              </div>
              <p className="form-helper mt-2">Use ε for epsilon (empty) transitions</p>
            </div>
          </div>

          {/* Transitions */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <span></span> Transitions ({transitions.length})
            </h3>
            <div className="transition-list">
              {transitions.map((t, i) => (
                <div key={i} className="transition-item">
                  <span>δ({t.from}, {t.read}, {t.pop})</span>
                  <span className="text-accent">→</span>
                  <span>({t.to}, {t.push || 'ε'})</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Result Banner */}
          <div className={`result-banner ${resultStatus}`}>
            <span>{resultMessage}</span>
          </div>

          {/* Canvas */}
          <div className="canvas-container">
            <div className="canvas-header">
              <span className="canvas-title"> State Diagram</span>
            </div>
            <canvas ref={canvasRef} id="stateCanvas" />
          </div>

          {/* Stack & Tape */}
          <div className="viz-grid">
            {/* Stack */}
            <div className="viz-panel">
              <div className="viz-panel-header">
                <span className="viz-panel-title"> Stack</span>
                <span className="text-cyan">Height: {stack.length}</span>
              </div>
              <div className="viz-panel-content">
                <div className="stack-container">
                  {stack.map((symbol, index) => (
                    <div
                      key={index}
                      className={`stack-cell ${index === 0 ? 'bottom-marker' : ''} ${index === stack.length - 1 ? 'top' : ''}`}
                    >
                      <span>{symbol === 'Z0' ? 'Z₀' : symbol}</span>
                      {index === 0 && <span className="text-cyan">bottom</span>}
                      {index === stack.length - 1 && <span className="text-accent">top</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Tape */}
            <div className="viz-panel">
              <div className="viz-panel-header">
                <span className="viz-panel-title"> Input Tape</span>
                <span className="text-accent">Position: {tapePosition}</span>
              </div>
              <div className="viz-panel-content">
                {testInput ? (
                  <div className="tape-container">
                    {testInput.split('').map((char, index) => (
                      <div
                        key={index}
                        className={`tape-cell ${index === tapePosition ? 'current' : ''} ${index < tapePosition ? 'consumed' : ''}`}
                      >
                        {char}
                      </div>
                    ))}
                    {tapePosition >= testInput.length && (
                      <div className="tape-cell current">␣</div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>No input string</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="viz-panel">
            <div className="viz-panel-header">
              <span className="viz-panel-title"> Simulation Controls</span>
              <div className="shortcuts-hint">
                <span><kbd className="kbd">Space</kbd> Step</span>
                <span><kbd className="kbd">R</kbd> Reset</span>
                <span><kbd className="kbd">P</kbd> Play/Pause</span>
              </div>
            </div>
            <div className="viz-panel-content">
              <div className="sim-controls">
                <div className="sim-input-group">
                  <label className="form-label" style={{ marginBottom: '0.5rem' }}>📝 Test String:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={testInput}
                      onChange={(e) => {
                        setTestInput(e.target.value);
                        setTapePosition(0);
                        resetSimulation();
                      }}
                      placeholder="Type: (()) or aabb or abcba"
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setTestInput('');
                        setTapePosition(0);
                        resetSimulation();
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className="btn btn-primary"
                    onClick={runSimulation}
                    disabled={!pda || !testInput || isRunning}
                  >
                    ▶ Play
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={resetSimulation}
                  >
                    ↻ Reset
                  </button>
                  <div className="speed-control">
                    <label className="form-label" style={{ margin: 0 }}>Speed:</label>
                    <input
                      type="range"
                      className="speed-slider"
                      min="100"
                      max="2000"
                      value={simulationSpeed}
                      onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step Log */}
          <div className="step-log">
            <div className="step-log-header">
              <span className="step-log-title"> Step Log</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setStepLog([])}>Clear</button>
            </div>
            <div className="step-log-content" ref={stepLogRef}>
              {stepLog.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '0.85rem', padding: '1rem' }}>
                  No steps yet. Click Play to start!
                </div>
              ) : (
                stepLog.map((log, i) => (
                  <div key={i} className="step-item">
                    <span className="step-number">{log.split(' ')[0]}</span>
                    <span>{log.substring(log.indexOf(' '))}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
