import React, { useState } from 'react';
import { BackingPlacement, WallSegment } from '@/types';

interface OptimizationPreviewProps {
  originalBackings: BackingPlacement[];
  optimizedBackings: BackingPlacement[];
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function OptimizationPreview({
  originalBackings,
  optimizedBackings,
  isVisible,
  onToggle,
  onApply,
  onCancel
}: OptimizationPreviewProps) {
  const [showComparison, setShowComparison] = useState(false);

  if (!isVisible) return null;

  const savings = calculateSavings(originalBackings, optimizedBackings);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Preview Controls */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Optimization Preview</h4>
            <button
              onClick={() => onToggle(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Original pieces:</span>
              <span className="font-medium">{originalBackings.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Optimized pieces:</span>
              <span className="font-medium text-green-600">{optimizedBackings.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Material saved:</span>
              <span className="font-medium text-green-600">{savings.material} sq"</span>
            </div>
            <div className="flex justify-between">
              <span>Labor saved:</span>
              <span className="font-medium text-green-600">{savings.labor} min</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show before/after comparison</span>
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onApply}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
            >
              Apply
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Visual Preview */}
      <svg className="w-full h-full" viewBox="0 0 1000 1000">
        {/* Original backings (faded) */}
        {showComparison && originalBackings.map(backing => (
          <rect
            key={`original-${backing.id}`}
            x={backing.x}
            y={backing.y}
            width={backing.width}
            height={backing.height}
            fill="rgba(239, 68, 68, 0.2)"
            stroke="rgb(239, 68, 68)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        ))}

        {/* Optimized backings */}
        {optimizedBackings.map(backing => (
          <g key={`optimized-${backing.id}`}>
            <rect
              x={backing.x}
              y={backing.y}
              width={backing.width}
              height={backing.height}
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
            />
            
            {/* Optimization badge */}
            <circle
              cx={backing.x + backing.width - 10}
              cy={backing.y + 10}
              r="8"
              fill="rgb(34, 197, 94)"
            />
            <text
              x={backing.x + backing.width - 10}
              y={backing.y + 14}
              fill="white"
              fontSize="8"
              textAnchor="middle"
              className="font-bold"
            >
              ✓
            </text>
          </g>
        ))}

        {/* Connection lines showing combinations */}
        {showComparison && getOptimizationConnections(originalBackings, optimizedBackings).map((connection, index) => (
          <line
            key={index}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke="rgb(34, 197, 94)"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
          />
        ))}
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="rgb(34, 197, 94)"
            />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function calculateSavings(original: BackingPlacement[], optimized: BackingPlacement[]) {
  const originalArea = original.reduce((sum, b) => sum + (b.width * b.height), 0);
  const optimizedArea = optimized.reduce((sum, b) => sum + (b.width * b.height), 0);
  
  return {
    material: Math.round(originalArea - optimizedArea),
    labor: (original.length - optimized.length) * 15, // 15 minutes per backing saved
    pieces: original.length - optimized.length
  };
}

function getOptimizationConnections(original: BackingPlacement[], optimized: BackingPlacement[]) {
  const connections = [];
  
  // Simple heuristic: connect original backings to nearest optimized backing
  original.forEach(orig => {
    const nearest = optimized.reduce((closest, opt) => {
      const distOrig = Math.sqrt(
        Math.pow(opt.x - orig.x, 2) + Math.pow(opt.y - orig.y, 2)
      );
      const distClosest = closest ? Math.sqrt(
        Math.pow(closest.x - orig.x, 2) + Math.pow(closest.y - orig.y, 2)
      ) : Infinity;
      
      return distOrig < distClosest ? opt : closest;
    }, null as BackingPlacement | null);
    
    if (nearest) {
      connections.push({
        from: { x: orig.x + orig.width / 2, y: orig.y + orig.height / 2 },
        to: { x: nearest.x + nearest.width / 2, y: nearest.y + nearest.height / 2 }
      });
    }
  });
  
  return connections;
}