export interface TreeNode {
  id: string;
  prompt: string;
  level: number;
  score: number;
  isExpanded: boolean;
  children: TreeNode[];
  parentId?: string; // Helpful for visualization links
}

export interface TreeData {
  root: TreeNode;
  totalNodes: number;
}

export interface SimulationStats {
  totalNodes: number;
  expandedNodes: number;
  unexpandedNodes: number;
  maxLevel: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'process' | 'warning';
}

export interface SimulationConfig {
  maxDepth: number;
  simulationSpeedMs: number;
}

export type ProcessorStatus = 'idle' | 'receiving' | 'processing' | 'completed';

export interface ProcessorInput {
  id: string;
  prompt: string;
}

export interface ProcessorOutput {
  parentId: string;
  children: TreeNode[];
}

export interface ProcessorState {
  status: ProcessorStatus;
  inputs: ProcessorInput[];
  outputs: ProcessorOutput[];
}