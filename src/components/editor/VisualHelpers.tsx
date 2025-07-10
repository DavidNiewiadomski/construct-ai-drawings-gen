import React from 'react';
import { BackingPlacement, Point } from '@/types';

interface VisualHelpersProps {
  // Dragging state
  isDragging: boolean;
  draggedBacking?: BackingPlacement;
  dragPosition?: Point;
  
  // Selection state
  selectedBackings: BackingPlacement[];
  
  // All backings for collision/alignment calculations
  allBackings: BackingPlacement[];
  
  // Snap state
  snapPoints: Array<{
    point: Point;
    type: 'edge' | 'center' | 'corner';
    targetId?: string;
  }>;
  
  // Alignment guides
  alignmentGuides: Array<{
    type: 'horizontal' | 'vertical';
    position: number;
    start: Point;
    end: Point;
  }>;
  
  // Distance measurements
  distanceMeasurements: Array<{
    from: Point;
    to: Point;
    distance: number;
    label: string;
  }>;
  
  // Collisions
  collisions: Array<{
    backingId: string;
    bounds: { x: number; y: number; width: number; height: number };
  }>;
  
  // Container dimensions for proper positioning
  containerBounds: { width: number; height: number };
  zoom: number;
  pan: Point;
}

export function VisualHelpers({
  isDragging,
  draggedBacking,
  dragPosition,
  selectedBackings,
  allBackings,
  snapPoints,
  alignmentGuides,
  distanceMeasurements,
  collisions,
  containerBounds,
  zoom,
  pan
}: VisualHelpersProps) {
  
  // Transform coordinates from drawing space to screen space
  const transformPoint = (point: Point): Point => ({
    x: (point.x + pan.x) * zoom,
    y: (point.y + pan.y) * zoom
  });

  const transformRect = (rect: { x: number; y: number; width: number; height: number }) => ({
    x: (rect.x + pan.x) * zoom,
    y: (rect.y + pan.y) * zoom,
    width: rect.width * zoom,
    height: rect.height * zoom
  });

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-20"
      width={containerBounds.width}
      height={containerBounds.height}
      style={{ overflow: 'visible' }}
    >
      {/* Alignment guides - dashed lines */}
      {isDragging && alignmentGuides.map((guide, index) => {
        const start = transformPoint(guide.start);
        const end = transformPoint(guide.end);
        
        return (
          <line
            key={`alignment-${index}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="8,4"
            className="animate-pulse"
          />
        );
      })}

      {/* Snap indicators - small circles at snap points */}
      {isDragging && snapPoints.map((snap, index) => {
        const point = transformPoint(snap.point);
        const colors = {
          edge: '#10b981',
          center: '#f59e0b',
          corner: '#8b5cf6'
        };
        
        return (
          <g key={`snap-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={6 * zoom}
              fill={colors[snap.type]}
              stroke="white"
              strokeWidth={2}
              className="animate-scale-in"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={3 * zoom}
              fill="white"
            />
          </g>
        );
      })}

      {/* Distance measurements */}
      {isDragging && distanceMeasurements.map((measurement, index) => {
        const from = transformPoint(measurement.from);
        const to = transformPoint(measurement.to);
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        return (
          <g key={`distance-${index}`} className="animate-fade-in">
            {/* Measurement line */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#6b7280"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            
            {/* End markers */}
            <circle cx={from.x} cy={from.y} r={2} fill="#6b7280" />
            <circle cx={to.x} cy={to.y} r={2} fill="#6b7280" />
            
            {/* Distance label */}
            <rect
              x={midX - 20}
              y={midY - 10}
              width={40}
              height={20}
              fill="white"
              stroke="#6b7280"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={midX}
              y={midY + 4}
              textAnchor="middle"
              fontSize={12}
              fill="#374151"
              fontFamily="monospace"
            >
              {measurement.label}
            </text>
          </g>
        );
      })}

      {/* Collision warnings - red outlines */}
      {collisions.map((collision, index) => {
        const rect = transformRect(collision.bounds);
        
        return (
          <rect
            key={`collision-${index}`}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill="none"
            stroke="#dc2626"
            strokeWidth={3}
            strokeDasharray="6,3"
            className="animate-pulse"
          />
        );
      })}

      {/* Dimension labels on selected backings */}
      {selectedBackings.map((backing, index) => {
        const rect = transformRect({
          x: backing.location.x,
          y: backing.location.y,
          width: backing.dimensions.width,
          height: backing.dimensions.height
        });
        
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        
        // Dimension labels
        const widthLabel = `${backing.dimensions.width}"`;
        const heightLabel = `${backing.dimensions.height}"`;
        const typeLabel = backing.backingType;
        
        return (
          <g key={`dimensions-${backing.id}`} className="animate-fade-in">
            {/* Selection outline */}
            <rect
              x={rect.x - 2}
              y={rect.y - 2}
              width={rect.width + 4}
              height={rect.height + 4}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4,2"
            />
            
            {/* Width dimension - top */}
            <g>
              <line
                x1={rect.x}
                y1={rect.y - 15}
                x2={rect.x + rect.width}
                y2={rect.y - 15}
                stroke="#374151"
                strokeWidth={1}
              />
              <line x1={rect.x} y1={rect.y - 20} x2={rect.x} y2={rect.y - 10} stroke="#374151" strokeWidth={1} />
              <line x1={rect.x + rect.width} y1={rect.y - 20} x2={rect.x + rect.width} y2={rect.y - 10} stroke="#374151" strokeWidth={1} />
              
              <rect
                x={centerX - 15}
                y={rect.y - 25}
                width={30}
                height={16}
                fill="white"
                stroke="#374151"
                strokeWidth={1}
                rx={2}
              />
              <text
                x={centerX}
                y={rect.y - 13}
                textAnchor="middle"
                fontSize={10}
                fill="#374151"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {widthLabel}
              </text>
            </g>
            
            {/* Height dimension - right */}
            <g>
              <line
                x1={rect.x + rect.width + 15}
                y1={rect.y}
                x2={rect.x + rect.width + 15}
                y2={rect.y + rect.height}
                stroke="#374151"
                strokeWidth={1}
              />
              <line x1={rect.x + rect.width + 10} y1={rect.y} x2={rect.x + rect.width + 20} y2={rect.y} stroke="#374151" strokeWidth={1} />
              <line x1={rect.x + rect.width + 10} y1={rect.y + rect.height} x2={rect.x + rect.width + 20} y2={rect.y + rect.height} stroke="#374151" strokeWidth={1} />
              
              <rect
                x={rect.x + rect.width + 22}
                y={centerY - 8}
                width={30}
                height={16}
                fill="white"
                stroke="#374151"
                strokeWidth={1}
                rx={2}
              />
              <text
                x={rect.x + rect.width + 37}
                y={centerY + 4}
                textAnchor="middle"
                fontSize={10}
                fill="#374151"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {heightLabel}
              </text>
            </g>
            
            {/* Type label - center */}
            <rect
              x={centerX - 25}
              y={centerY - 10}
              width={50}
              height={20}
              fill="rgba(59, 130, 246, 0.9)"
              stroke="#3b82f6"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={centerX}
              y={centerY + 4}
              textAnchor="middle"
              fontSize={11}
              fill="white"
              fontFamily="system-ui"
              fontWeight="600"
            >
              {typeLabel}
            </text>
            
            {/* Z-height indicator - bottom left */}
            <rect
              x={rect.x - 35}
              y={rect.y + rect.height - 8}
              width={32}
              height={16}
              fill="rgba(16, 185, 129, 0.9)"
              stroke="#10b981"
              strokeWidth={1}
              rx={2}
            />
            <text
              x={rect.x - 19}
              y={rect.y + rect.height + 4}
              textAnchor="middle"
              fontSize={9}
              fill="white"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {backing.location.z}"
            </text>
          </g>
        );
      })}

      {/* Grid snap helpers when dragging */}
      {isDragging && dragPosition && (
        <g className="animate-fade-in">
          {/* Crosshair at drag position */}
          <line
            x1={transformPoint(dragPosition).x - 20}
            y1={transformPoint(dragPosition).y}
            x2={transformPoint(dragPosition).x + 20}
            y2={transformPoint(dragPosition).y}
            stroke="#f59e0b"
            strokeWidth={2}
          />
          <line
            x1={transformPoint(dragPosition).x}
            y1={transformPoint(dragPosition).y - 20}
            x2={transformPoint(dragPosition).x}
            y2={transformPoint(dragPosition).y + 20}
            stroke="#f59e0b"
            strokeWidth={2}
          />
          
          {/* Position label */}
          <rect
            x={transformPoint(dragPosition).x + 25}
            y={transformPoint(dragPosition).y - 15}
            width={80}
            height={30}
            fill="rgba(245, 158, 11, 0.9)"
            stroke="#f59e0b"
            strokeWidth={1}
            rx={4}
          />
          <text
            x={transformPoint(dragPosition).x + 65}
            y={transformPoint(dragPosition).y - 5}
            textAnchor="middle"
            fontSize={10}
            fill="white"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {`X: ${dragPosition.x.toFixed(1)}"`}
          </text>
          <text
            x={transformPoint(dragPosition).x + 65}
            y={transformPoint(dragPosition).y + 7}
            textAnchor="middle"
            fontSize={10}
            fill="white"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {`Y: ${dragPosition.y.toFixed(1)}"`}
          </text>
        </g>
      )}
    </svg>
  );
}