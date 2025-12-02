import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '../types';

interface TreeVisualizerProps {
  data: TreeNode;
  activeNodeIds: string[];
  maxDepth: number;
  width?: number;
  height?: number;
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ data, activeNodeIds, maxDepth, width = 800, height = 600 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle responsive resizing
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute D3 Layout
  const root = useMemo(() => {
    const hierarchy = d3.hierarchy(data);
    
    // Determine tree layout size based on node count to prevent cramping
    // We toggle between horizontal or vertical based on preference, here using vertical (top-down)
    const treeLayout = d3.tree<TreeNode>()
      .size([dimensions.width - 100, dimensions.height - 100]); // Margins
      
    return treeLayout(hierarchy);
  }, [data, dimensions]);

  // Render SVG Elements via React (for better control over state/animations)
  // We use D3 only for calculation (x, y coordinates)
  
  return (
    <div ref={wrapperRef} className="w-full h-full bg-slate-900 overflow-hidden relative rounded-lg border border-slate-700 shadow-inner">
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="pointer-events-none" // Allow panning if implemented later
      >
        <g transform={`translate(50, 50)`}>
          {/* Links */}
          {root.links().map((link, i) => {
            const d = d3.linkVertical()
              .x((d: any) => d.x)
              .y((d: any) => d.y)
              (link as any);
            
            return (
              <path
                key={`link-${i}`}
                d={d || ''}
                fill="none"
                stroke="#334155"
                strokeWidth={2}
                className="transition-all duration-500 ease-in-out"
              />
            );
          })}

          {/* Nodes */}
          {root.descendants().map((node) => {
            const isActive = activeNodeIds.includes(node.data.id);
            const isExpanded = node.data.isExpanded;
            // A node is pending if it's not expanded AND hasn't reached the max depth yet
            // AND it is not currently active (being processed)
            const isPending = !isExpanded && node.data.level < maxDepth && !isActive;
            const isTerminal = !isExpanded && node.data.level >= maxDepth;

            // Dynamic Styling
            let circleColor = "#64748b"; // Fallback
            let strokeColor = "#1e293b"; // Default stroke
            
            if (isActive) {
                circleColor = "#fbbf24"; // Amber-400 (Processing) - Bright Yellow
                strokeColor = "#f59e0b";
            } else if (isExpanded) {
                circleColor = "#22c55e"; // Green-500 (Done)
                strokeColor = "#15803d";
            } else if (isPending) {
                circleColor = "#d97706"; // Amber-600 (Pending Queue) - Darker/Solid Orange-Yellow
                strokeColor = "#92400e";
            } else if (isTerminal) {
                circleColor = "#3b82f6"; // Blue-500 (Max Depth Reached)
                strokeColor = "#1d4ed8";
            }

            return (
              <g 
                key={node.data.id} 
                transform={`translate(${node.x},${node.y})`}
                className="transition-all duration-500 ease-in-out"
              >
                {/* Ping Animation for Active Node */}
                {isActive && (
                  <circle
                    r="20"
                    className="animate-ping opacity-75"
                    fill={circleColor}
                  />
                )}

                {/* Main Circle */}
                <circle
                  r={isActive ? 12 : 8}
                  fill={circleColor}
                  stroke={strokeColor}
                  strokeWidth={2}
                  className={`transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]' : ''}`}
                />

                {/* Label */}
                <foreignObject x={-75} y={15} width={150} height={60} style={{ overflow: 'visible' }}>
                  <div className={`text-center text-xs px-2 py-1 rounded backdrop-blur-sm border shadow-sm transition-all duration-300
                    ${isActive 
                        ? 'bg-amber-900/80 border-amber-500/50 text-amber-100 z-10 scale-110' 
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }
                  `}>
                     <div className="font-semibold truncate">{node.data.prompt}</div>
                     <div className="text-[10px] text-slate-500 font-mono opacity-80">
                       Lvl:{node.data.level} | {node.data.score.toFixed(2)}
                     </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-slate-900/90 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 border border-green-700"></span>
          <span>Expanded</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-600 border border-amber-800"></span>
          <span>Pending (Queue)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse border border-amber-600"></span>
          <span>Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-700"></span>
          <span>Terminal (Max Depth)</span>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;