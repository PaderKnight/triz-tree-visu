import React from 'react';
import { ProcessorStatus } from '../types';

interface FlowConnectorProps {
  status: ProcessorStatus;
}

const FlowConnector: React.FC<FlowConnectorProps> = ({ status }) => {
  const isReceiving = status === 'receiving';
  const isCompleted = status === 'completed';

  return (
    <div className="h-full w-full flex flex-col justify-start pt-8 relative opacity-80">
      {/* Container for the arrows, aligned with the top portion where processor usually sits */}
      <div className="h-48 w-full relative">
        
        {/* TOP ARROW: Tree -> Processor (Data Input) */}
        <svg className="absolute top-4 left-0 w-full h-12 overflow-visible">
          <defs>
            <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
            <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Static Path Background */}
          <path d="M 0 6 L 100 6" stroke="#1e293b" strokeWidth="2" fill="none" strokeDasharray="4 4" />
          
          {/* Active Flow Line */}
          <path 
            d="M 0 6 L 90 6" 
            stroke="url(#grad-blue)" 
            strokeWidth="3" 
            fill="none" 
            markerEnd="url(#arrowhead-blue)"
            className={`transition-all duration-300 ${isReceiving ? 'opacity-100' : 'opacity-10'}`}
          />
          
          {/* Moving Particle */}
          {isReceiving && (
            <circle r="3" fill="#60a5fa" filter="drop-shadow(0 0 4px #60a5fa)">
              <animateMotion dur="1s" repeatCount="indefinite" path="M 0 6 L 100 6" />
            </circle>
          )}

          {/* Label */}
          <text x="50%" y="25" textAnchor="middle" fontSize="10" fill="#94a3b8" className="font-mono opacity-70">
            PROMPT
          </text>
        </svg>

        {/* BOTTOM ARROW: Processor -> Tree (Data Output) */}
        <svg className="absolute bottom-8 left-0 w-full h-12 overflow-visible">
          <defs>
            <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
            </marker>
            <linearGradient id="grad-green" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Static Path Background */}
          <path d="M 100 6 L 0 6" stroke="#1e293b" strokeWidth="2" fill="none" strokeDasharray="4 4" />

          {/* Active Flow Line */}
          <path 
            d="M 100 6 L 10 6" 
            stroke="url(#grad-green)" 
            strokeWidth="3" 
            fill="none" 
            markerEnd="url(#arrowhead-green)"
            className={`transition-all duration-300 ${isCompleted ? 'opacity-100' : 'opacity-10'}`}
          />

          {/* Moving Particle */}
          {isCompleted && (
            <circle r="3" fill="#4ade80" filter="drop-shadow(0 0 4px #4ade80)">
              <animateMotion dur="0.8s" repeatCount="indefinite" path="M 100 6 L 0 6" />
            </circle>
          )}

          {/* Label */}
          <text x="50%" y="25" textAnchor="middle" fontSize="10" fill="#94a3b8" className="font-mono opacity-70">
            NODES
          </text>
        </svg>
      </div>
    </div>
  );
};

export default FlowConnector;