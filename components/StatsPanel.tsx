import React from 'react';
import { SimulationStats } from '../types';
import { Network, Layers, GitBranch, Circle } from 'lucide-react';

interface StatsPanelProps {
  stats: SimulationStats;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, color: string }> = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-md border border-slate-700 min-w-[140px]">
    <div className={`p-1.5 rounded-md bg-opacity-20 ${color} text-white`}>
      {React.cloneElement(icon as React.ReactElement, { size: 16, className: color.replace('bg-', 'text-') })}
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-slate-100 leading-none">{value}</p>
    </div>
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
      <StatCard 
        icon={<Network />} 
        label="Total Nodes" 
        value={stats.totalNodes} 
        color="bg-indigo-500" 
      />
      <StatCard 
        icon={<GitBranch />} 
        label="Expanded" 
        value={stats.expandedNodes} 
        color="bg-green-500" 
      />
      <StatCard 
        icon={<Circle />} 
        label="Pending" 
        value={stats.unexpandedNodes} 
        color="bg-blue-500" 
      />
      <StatCard 
        icon={<Layers />} 
        label="Max Depth" 
        value={stats.maxLevel} 
        color="bg-purple-500" 
      />
    </div>
  );
};

export default StatsPanel;