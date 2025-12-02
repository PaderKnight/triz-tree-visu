import React from 'react';
import { Play, Pause, RotateCcw, Settings, FastForward } from 'lucide-react';
import { SimulationConfig } from '../types';

interface ControlsProps {
  isRunning: boolean;
  config: SimulationConfig;
  onConfigChange: (newConfig: Partial<SimulationConfig>) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  canStart: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  isRunning, 
  config, 
  onConfigChange, 
  onStart, 
  onPause, 
  onReset,
  canStart
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
        <Settings size={18} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-200">Simulation Controls</h2>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        {!isRunning ? (
          <button
            onClick={onStart}
            disabled={!canStart}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              canStart 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play size={16} />
            Start
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
          >
            <Pause size={16} />
            Pause
          </button>
        )}
        
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <label>Max Depth Level</label>
            <span>{config.maxDepth}</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={config.maxDepth}
            onChange={(e) => onConfigChange({ maxDepth: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <label className="flex items-center gap-1"><FastForward size={12}/> Speed (Delay)</label>
            <span>{config.simulationSpeedMs}ms</span>
          </div>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={config.simulationSpeedMs}
            onChange={(e) => onConfigChange({ simulationSpeedMs: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Controls;