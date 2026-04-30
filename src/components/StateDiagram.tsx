
// src/components/StateDiagram.tsx
// Canvas-based state diagram visualization — highlights ALL currently active states

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Transition } from '../types/pda.types';

interface StateDiagramProps {
  states: string[];
  transitions: Transition[];
  currentStates: string[];   // all states the NPDA could currently be in
  startState: string;
  acceptStates: string[];
}

export const StateDiagram: React.FC<StateDiagramProps> = ({
  states,
  transitions,
  currentStates,
  startState,
  acceptStates
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    if (states.length === 0) return;

    const newPositions: Record<string, { x: number; y: number }> = {};
    const centerX = 400;
    const centerY = 250;
    const radius = Math.min(150, 60 * states.length);

    states.forEach((state, index) => {
      const angle = (2 * Math.PI * index) / states.length - Math.PI / 2;
      newPositions[state] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    setPositions(newPositions);
  }, [states]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw transitions
    transitions.forEach(t => {
      const from = positions[t.from];
      const to = positions[t.to];
      if (!from || !to) return;

      ctx.beginPath();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;

      if (t.from === t.to) {
        ctx.arc(from.x, from.y - 40, 20, 0, 2 * Math.PI);
      } else {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
      }
      ctx.stroke();

      // Arrowhead
      if (t.from !== t.to) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowX = to.x - 32 * Math.cos(angle);
        const arrowY = to.y - 32 * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI / 6), arrowY - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI / 6), arrowY - 10 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = '#94A3B8';
        ctx.fill();
      }

      // Transition label
      const midX = t.from === t.to ? from.x : (from.x + to.x) / 2;
      const midY = t.from === t.to ? from.y - 65 : (from.y + to.y) / 2;
      ctx.fillStyle = '#374151';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      const label = `${t.read || 'ε'},${t.pop || 'ε'}→${t.push || 'ε'}`;
      ctx.fillText(label, midX, midY - 5);
    });

    // Draw states
    states.forEach(state => {
      const pos = positions[state];
      if (!pos) return;

      const isActive = currentStates.includes(state);
      const isAccept = acceptStates.includes(state);

      // Pick fill colour based on active/accept combination
      let fillColor: string;
      if (isActive && isAccept) fillColor = '#22C55E';  // green — active accept state
      else if (isActive)        fillColor = '#3B82F6';  // blue  — active non-accept
      else if (isAccept)        fillColor = '#94A3B8';  // gray  — inactive accept
      else                      fillColor = '#94A3B8';  // gray  — inactive

      // Glow ring for active states
      if (isActive) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 36, 0, 2 * Math.PI);
        ctx.fillStyle = isAccept ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)';
        ctx.fill();
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Double ring for accept states
      if (isAccept) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Start-state arrow
      if (state === startState) {
        ctx.beginPath();
        ctx.moveTo(pos.x - 50, pos.y);
        ctx.lineTo(pos.x - 33, pos.y);
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pos.x - 33, pos.y);
        ctx.lineTo(pos.x - 40, pos.y - 5);
        ctx.lineTo(pos.x - 40, pos.y + 5);
        ctx.closePath();
        ctx.fillStyle = '#1E293B';
        ctx.fill();
      }

      // State label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state, pos.x, pos.y);
    });

    // Legend
    const lx = 16;
    let ly = 16;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const legend: [string, string][] = [
      ['#3B82F6', 'Active'],
      ['#22C55E', 'Active + Accept'],
      ['#94A3B8', 'Inactive'],
    ];
    legend.forEach(([color, label]) => {
      ctx.beginPath();
      ctx.arc(lx + 8, ly + 8, 8, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = '#374151';
      ctx.fillText(label, lx + 22, ly + 8);
      ly += 22;
    });

  }, [positions, states, transitions, currentStates, acceptStates, startState]);

  return (
    <div className="border rounded-lg bg-white shadow-sm p-4">
      <h3 className="font-semibold mb-2 text-lg text-center">State Diagram</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full border rounded"
      />
    </div>
  );
};
