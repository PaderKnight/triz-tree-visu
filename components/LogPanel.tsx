import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface LogPanelProps {
  logs: LogEntry[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Instant scroll to bottom on new log
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-full overflow-hidden shadow-inner">
      <div className="flex items-center gap-2 p-3 border-b border-slate-700 bg-slate-800/50">
        <Terminal size={16} className="text-slate-400" />
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">System Logs</h3>
        <span className="ml-auto text-[10px] text-slate-500">{logs.length} entries</span>
      </div>
      
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2"
        style={{ scrollBehavior: 'auto' }} // Use auto to prevent jank on fast updates
      >
        {logs.length === 0 && (
          <div className="text-slate-500 italic text-center mt-10">System ready...</div>
        )}
        
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-500 shrink-0 opacity-70">[{log.timestamp}]</span>
            <span className={`break-words ${
              log.type === 'process' ? 'text-amber-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'warning' ? 'text-orange-400' :
              'text-slate-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;