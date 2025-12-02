import React from 'react';
import { Cpu, ArrowRight, Database, Wifi } from 'lucide-react';
import { ProcessorState } from '../types';

interface ExpansionProcessorProps {
  state: ProcessorState;
}

const ExpansionProcessor: React.FC<ExpansionProcessorProps> = ({ state }) => {
  const { status, inputs, outputs } = state;

  // Visual state helpers
  const isIdle = status === 'idle';
  const isReceiving = status === 'receiving';
  const isProcessing = status === 'processing';
  const isCompleted = status === 'completed';

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col shadow-xl">
      {/* Header */}
      <div className="bg-slate-800 p-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className={`w-5 h-5 ${isProcessing ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
          <h2 className="text-sm font-semibold text-slate-200">AI Expansion Module</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isIdle ? 'bg-slate-600' : 'bg-green-500 animate-pulse'}`} />
          <span className="text-[10px] uppercase text-slate-500 font-mono">
            {status}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 relative min-h-[180px] flex flex-col justify-center">
        
        {/* Background Grid Effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '10px 10px' }} 
        />

        {/* 1. Input Flow */}
        <div className={`transition-all duration-300 transform ${isReceiving || isProcessing || isCompleted ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-4'}`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 mt-1 rounded-md bg-slate-800 border ${isReceiving ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-slate-700'}`}>
              <Database size={16} className="text-blue-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Incoming Batch ({inputs.length})</div>
              {inputs.length > 0 ? (
                <div className="space-y-1">
                  {inputs.map((input) => (
                    <div key={input.id} className={`text-xs font-mono bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 truncate transition-colors ${isReceiving ? 'border-blue-500/50 text-blue-100' : ''}`}>
                      {input.prompt}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs font-mono bg-slate-950 p-2 rounded border border-slate-800 text-slate-500 italic">
                  Waiting for data...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Processing Animation (Center) */}
        <div className="flex justify-center items-center py-2">
          {isProcessing ? (
             <div className="flex flex-col items-center gap-1">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-6 bg-amber-500 animate-[pulse_0.6s_ease-in-out_infinite]"></span>
                  <span className="w-1.5 h-6 bg-amber-500 animate-[pulse_0.6s_ease-in-out_0.2s_infinite]"></span>
                  <span className="w-1.5 h-6 bg-amber-500 animate-[pulse_0.6s_ease-in-out_0.4s_infinite]"></span>
                </div>
                <span className="text-[10px] text-amber-500 font-mono animate-pulse">PARALLEL PROCESSING</span>
             </div>
          ) : (
             <ArrowRight size={20} className={`text-slate-700 transform rotate-90 my-1 transition-all duration-300 ${isCompleted ? 'text-green-500 scale-125' : ''}`} />
          )}
        </div>

        {/* 3. Output Flow */}
        <div className={`transition-all duration-300 transform ${isCompleted ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 mt-1 rounded-md bg-slate-800 border ${isCompleted ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'border-slate-700'}`}>
              <Wifi size={16} className="text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Generated Output</div>
              <div className={`text-xs font-mono bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 transition-colors ${isCompleted ? 'border-green-500/50 text-green-100' : ''}`}>
                 {isCompleted ? (
                   <div className="flex flex-col gap-2">
                     {outputs.map((output, idx) => (
                       <div key={idx}>
                         <span className="text-green-400 font-bold block mb-1">Batch {idx + 1}: {output.children.length} Nodes</span>
                         {output.children.map((child, i) => (
                           <div key={i} className="truncate opacity-70 border-l-2 border-slate-700 pl-2 text-[10px]">
                             └ {child.prompt}
                           </div>
                         ))}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <span className="italic text-slate-600">Waiting for generation...</span>
                 )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExpansionProcessor;