
// src/components/StackVisualizer.tsx
// Shows one stack card per active NPDA branch

'use client';

import React from 'react';
import { Configuration } from '../types/pda.types';

interface StackVisualizerProps {
  configurations: Configuration[];
  acceptStates: string[];
}

const MAX_DISPLAYED = 6;

export const StackVisualizer: React.FC<StackVisualizerProps> = ({ configurations, acceptStates }) => {
  const displayed = configurations.slice(0, MAX_DISPLAYED);
  const overflow = configurations.length - displayed.length;

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm h-full">
      <h3 className="font-semibold mb-3 text-center text-lg">
        Stack{configurations.length !== 1 ? 's' : ''}
        {configurations.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({configurations.length} branch{configurations.length !== 1 ? 'es' : ''})
          </span>
        )}
      </h3>

      {configurations.length === 0 ? (
        <div className="text-gray-400 italic text-center mt-8 text-sm">
          No active branches
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[420px] pr-1">
          {displayed.map((config, i) => {
            const isAcceptState = acceptStates.includes(config.state);
            const isAccepted = isAcceptState && config.stack.length === 0;

            return (
              <div
                key={i}
                className={`border-2 rounded-lg p-3 transition-colors ${
                  isAccepted
                    ? 'border-green-400 bg-green-50'
                    : isAcceptState
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Branch header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold">{config.state}</span>
                  <span className="text-xs text-gray-500">pos {config.inputPosition}</span>
                  {isAccepted && (
                    <span className="text-green-600 text-xs font-bold">✓ accept</span>
                  )}
                </div>

                {/* Stack blocks — bottom of stack at bottom of display */}
                <div className="flex flex-col-reverse items-center gap-1 min-h-[48px]">
                  {config.stack.length === 0 ? (
                    <div className="text-gray-400 text-xs italic">empty</div>
                  ) : (
                    config.stack.map((symbol, j) => (
                      <div
                        key={j}
                        className={`w-14 h-8 flex items-center justify-center rounded border font-mono text-sm font-semibold ${
                          j === config.stack.length - 1
                            ? 'bg-blue-500 border-blue-700 text-white'   // top of stack
                            : 'bg-blue-200 border-blue-400 text-blue-900'
                        }`}
                      >
                        {symbol}
                      </div>
                    ))
                  )}
                </div>

                <div className="text-center text-xs text-gray-400 mt-1">↑ top</div>
              </div>
            );
          })}

          {overflow > 0 && (
            <div className="text-center text-gray-500 text-xs py-1 border border-dashed border-gray-300 rounded">
              +{overflow} more branch{overflow !== 1 ? 'es' : ''} not shown
            </div>
          )}
        </div>
      )}
    </div>
  );
};
