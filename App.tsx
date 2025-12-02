import React, { useState, useEffect, useRef } from 'react';
import { TreeNode, SimulationConfig, LogEntry, SimulationStats, ProcessorState, ProcessorInput, ProcessorOutput } from './types';
import { createInitialTree, getTreeStats, findUnexpandedNodes, expandNodeLogic, updateTreeWithNewNodes } from './services/treeLogic';
import TreeVisualizer from './components/TreeVisualizer';
import Controls from './components/Controls';
import StatsPanel from './components/StatsPanel';
import LogPanel from './components/LogPanel';
import ExpansionProcessor from './components/ExpansionProcessor';
import FlowConnector from './components/FlowConnector';

const App: React.FC = () => {
  // --- State ---
  const [tree, setTree] = useState<TreeNode>(createInitialTree());
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // New State for the Processor Module (supports Batch processing)
  const [processorState, setProcessorState] = useState<ProcessorState>({
    status: 'idle',
    inputs: [],
    outputs: []
  });
  
  const [config, setConfig] = useState<SimulationConfig>({
    maxDepth: 3,
    simulationSpeedMs: 1200, // Slower default to let animations play out
  });

  // Refs for async loop control
  const runningRef = useRef(false);
  const treeRef = useRef(tree); 
  const configRef = useRef(config);
  const previousDepthRef = useRef<number>(0);

  useEffect(() => { treeRef.current = tree; }, [tree]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { runningRef.current = isRunning; }, [isRunning]);

  // --- Helper Functions ---
  
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      message,
      type
    };
    
    // Keep only the last 5 logs to prevent list from getting too long
    setLogs(prev => {
      const updated = [...prev, entry];
      return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
    });
  };

  const calculateStats = (): SimulationStats => {
    return getTreeStats(tree);
  };

  // --- Simulation Loop (Multi-Stage & Batch Processing) ---

  const runSimulationStep = async () => {
    if (!runningRef.current) return;

    // 1. Identify unexpanded nodes
    // logic in findUnexpandedNodes ensures DEEPEST nodes come first (Depth-First Strategy)
    const unexpanded = findUnexpandedNodes(treeRef.current, configRef.current.maxDepth);

    if (unexpanded.length === 0) {
      setIsRunning(false);
      addLog(`Tree expansion complete (Max Depth: ${configRef.current.maxDepth}).`, 'success');
      return;
    }

    // --- STRATEGY LOGIC ---
    const currentStats = getTreeStats(treeRef.current);
    const targetDepth = configRef.current.maxDepth;

    // Phase 1: First Path (Probing)
    // If we haven't reached the target depth yet, strict single-file drill down.
    const isFirstPathPhase = currentStats.maxLevel < targetDepth;

    // Phase 2: Backfill (Expansion)
    // Once depth is established, we can process multiple nodes concurrently.
    const maxBatchSize = isFirstPathPhase ? 1 : 2;
    const batchCount = isFirstPathPhase ? 1 : (Math.floor(Math.random() * maxBatchSize) + 1);

    // Slice based on sort (Deepest first)
    const nodesToProcess = unexpanded.slice(0, batchCount);
    
    // Logging logic for Strategy transitions
    const currentDepth = nodesToProcess[0].level;
    if (currentDepth > previousDepthRef.current) {
        // Drilling down...
    } else if (currentDepth < previousDepthRef.current) {
        addLog(`Branch complete. Backtracking to Level ${currentDepth}...`, 'warning');
    }
    previousDepthRef.current = currentDepth;

    const stepDuration = configRef.current.simulationSpeedMs;

    // --- PHASE 1: SELECTION & TRANSMISSION ---
    // Highlight Nodes in Tree
    const selectedIds = nodesToProcess.map(n => n.id);
    setActiveNodeIds(selectedIds);
    
    // Prepare Processor Inputs
    const processorInputs: ProcessorInput[] = nodesToProcess.map(n => ({
        id: n.id,
        prompt: n.prompt
    }));

    // Update Processor: Receiving
    setProcessorState({
      status: 'receiving',
      inputs: processorInputs,
      outputs: []
    });
    
    const nodeNames = nodesToProcess.map(n => `"${n.prompt.split(' ')[0]}..."`).join(' & ');
    addLog(`Sending [${nodeNames}] to Module...`, 'process');
    
    // Wait
    await new Promise(resolve => setTimeout(resolve, stepDuration * 0.3));
    if (!runningRef.current) { resetStepState(); return; }

    // --- PHASE 2: PROCESSING ---
    setProcessorState(prev => ({ ...prev, status: 'processing' }));
    
    // Wait (Simulate AI thinking)
    await new Promise(resolve => setTimeout(resolve, stepDuration * 0.4));
    if (!runningRef.current) { resetStepState(); return; }

    // --- PHASE 3: GENERATION (Logic execution) ---
    const processorOutputs: ProcessorOutput[] = [];
    
    nodesToProcess.forEach(node => {
        const newChildren = expandNodeLogic(node);
        processorOutputs.push({
            parentId: node.id,
            children: newChildren
        });
    });

    const totalGenerated = processorOutputs.reduce((acc, curr) => acc + curr.children.length, 0);

    setProcessorState(prev => ({
      ...prev,
      status: 'completed',
      outputs: processorOutputs
    }));
    addLog(`Generated ${totalGenerated} nodes for Level ${currentDepth + 1}.`, 'info');

    // Wait (Show results on module)
    await new Promise(resolve => setTimeout(resolve, stepDuration * 0.3));
    if (!runningRef.current) { resetStepState(); return; }

    // --- PHASE 4: UPDATE TREE ---
    let newTree = treeRef.current;
    
    // Apply updates
    processorOutputs.forEach(output => {
        newTree = updateTreeWithNewNodes(newTree, output.parentId, output.children);
    });

    setTree(newTree);
    
    // Reset visual states
    resetStepState();

    // Loop
    setTimeout(runSimulationStep, 100); 
  };

  const resetStepState = () => {
    setActiveNodeIds([]);
    setProcessorState({
      status: 'idle',
      inputs: [],
      outputs: []
    });
  };

  // Trigger the loop
  useEffect(() => {
    if (isRunning) {
      addLog('Simulation started.', 'info');
      // Reset depth ref on start
      previousDepthRef.current = 0;
      runSimulationStep();
    } else {
        if (logs.length > 0 && processorState.status !== 'idle') {
            addLog('Simulation paused.', 'warning');
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);


  // --- Handlers ---

  const handleStart = () => {
    const unexpanded = findUnexpandedNodes(tree, config.maxDepth);
    if (unexpanded.length === 0) {
      addLog('No nodes to expand. Increase Max Depth or Reset.', 'warning');
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    resetStepState();
    setTree(createInitialTree());
    setLogs([]);
    addLog('System reset.', 'info');
  };

  const handleConfigChange = (newConfig: Partial<SimulationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 shadow-md z-10 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">T</div>
                <h1 className="text-xl font-bold tracking-tight text-white">TRIZ <span className="text-blue-400">Tree Visualizer</span></h1>
            </div>
            <div className="hidden sm:block text-xs text-slate-500 font-mono">
                AI-Driven Recursive Expansion Model
            </div>
        </div>
      </header>

      {/* Stats Bar (Full Width) */}
      <div className="bg-slate-900/50 border-b border-slate-800 p-4 shrink-0">
          <div className="max-w-7xl mx-auto">
             <StatsPanel stats={stats} />
          </div>
      </div>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 overflow-hidden">
        
        {/* Responsive Grid: Stacks on mobile, 3-column split on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-4 lg:gap-0">
            
            {/* Left: Tree Visualizer (7 cols) */}
            <div className="lg:col-span-7 h-[500px] lg:h-full flex flex-col">
                <TreeVisualizer 
                    data={tree} 
                    activeNodeIds={activeNodeIds} 
                    maxDepth={config.maxDepth}
                />
            </div>

            {/* Middle: Flow Connector (1 col) - Hidden on mobile */}
            <div className="hidden lg:flex lg:col-span-1 h-full items-start justify-center">
                 <FlowConnector status={processorState.status} />
            </div>

            {/* Right: Processor & Controls (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden pl-2">
                <div className="shrink-0">
                  <ExpansionProcessor state={processorState} />
                </div>

                <div className="shrink-0">
                  <Controls 
                      isRunning={isRunning}
                      config={config}
                      onConfigChange={handleConfigChange}
                      onStart={handleStart}
                      onPause={handlePause}
                      onReset={handleReset}
                      canStart={stats.unexpandedNodes > 0 || stats.maxLevel < config.maxDepth}
                  />
                </div>

                <div className="flex-1 min-h-[200px] lg:min-h-0">
                    <LogPanel logs={logs} />
                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;