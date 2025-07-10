import React from 'react';
import { WallSegment, DoorOpening, BackingPlacement, Clash, Point } from '@/types';

interface IntelligenceOverlayProps {
  walls: WallSegment[];
  doors: DoorOpening[];
  backings: BackingPlacement[];
  conflicts: Clash[];
  showWalls: boolean;
  showDoorSwings: boolean;
  showConflicts: boolean;
  showMeasurements: boolean;
  draggedBacking?: BackingPlacement;
  snapGuides: Point[];
  scale: number;
  pan: Point;
}

export function IntelligenceOverlay({
  walls,
  doors,
  backings,
  conflicts,
  showWalls,
  showDoorSwings,
  showConflicts,
  showMeasurements,
  draggedBacking,
  snapGuides,
  scale,
  pan
}: IntelligenceOverlayProps) {
  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={{ transform }}
    >
      <svg className="w-full h-full" viewBox="0 0 1000 1000">
        {/* Wall Overlay */}
        {showWalls && walls.map(wall => (
          <WallOverlay key={wall.id} wall={wall} />
        ))}

        {/* Door Swing Arcs */}
        {showDoorSwings && doors.map(door => (
          <DoorSwingOverlay key={door.id} door={door} />
        ))}

        {/* Conflict Highlighting */}
        {showConflicts && conflicts.map(conflict => (
          <ConflictOverlay 
            key={conflict.id} 
            conflict={conflict} 
            backings={backings} 
          />
        ))}

        {/* Distance Measurements */}
        {showMeasurements && (
          <DistanceMeasurements backings={backings} />
        )}

        {/* Snap Guides */}
        {draggedBacking && snapGuides.map((guide, index) => (
          <SnapGuide key={index} point={guide} />
        ))}

        {/* Dragging Preview */}
        {draggedBacking && (
          <DragPreview backing={draggedBacking} />
        )}
      </svg>
    </div>
  );
}

// Wall Overlay Component
function WallOverlay({ wall }: { wall: WallSegment }) {
  return (
    <g>
      <line
        x1={wall.startPoint.x}
        y1={wall.startPoint.y}
        x2={wall.endPoint.x}
        y2={wall.endPoint.y}
        stroke="rgba(59, 130, 246, 0.6)"
        strokeWidth={wall.thickness}
        strokeLinecap="round"
      />
      <line
        x1={wall.startPoint.x}
        y1={wall.startPoint.y}
        x2={wall.endPoint.x}
        y2={wall.endPoint.y}
        stroke="rgba(59, 130, 246, 0.3)"
        strokeWidth={wall.thickness + 4}
        strokeLinecap="round"
      />
      {/* Wall label */}
      <text
        x={(wall.startPoint.x + wall.endPoint.x) / 2}
        y={(wall.startPoint.y + wall.endPoint.y) / 2 - 10}
        fill="rgb(59, 130, 246)"
        fontSize="10"
        textAnchor="middle"
        className="font-semibold"
      >
        {wall.type} wall - {wall.length}"
      </text>
    </g>
  );
}

// Door Swing Overlay Component
function DoorSwingOverlay({ door }: { door: DoorOpening }) {
  const swingAngle = door.swingDirection === 'left' ? -90 : 90;
  const radius = door.width;
  
  return (
    <g>
      {/* Door opening */}
      <rect
        x={door.position.x}
        y={door.position.y}
        width={door.width}
        height={8}
        fill="rgba(34, 197, 94, 0.6)"
        stroke="rgb(34, 197, 94)"
        strokeWidth="2"
      />
      
      {/* Swing arc */}
      <path
        d={`M ${door.position.x} ${door.position.y + 4} A ${radius} ${radius} 0 0 ${door.swingDirection === 'left' ? 0 : 1} ${door.position.x + Math.cos(swingAngle * Math.PI / 180) * radius} ${door.position.y + 4 + Math.sin(swingAngle * Math.PI / 180) * radius}`}
        fill="none"
        stroke="rgba(34, 197, 94, 0.4)"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      
      {/* Clearance zone */}
      <circle
        cx={door.position.x}
        cy={door.position.y + 4}
        r={door.clearanceRequired}
        fill="rgba(34, 197, 94, 0.1)"
        stroke="rgba(34, 197, 94, 0.3)"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      
      {/* Door label */}
      <text
        x={door.position.x + door.width / 2}
        y={door.position.y - 5}
        fill="rgb(34, 197, 94)"
        fontSize="9"
        textAnchor="middle"
        className="font-medium"
      >
        {door.width}" door ({door.clearanceRequired}" clearance)
      </text>
    </g>
  );
}

// Conflict Overlay Component
function ConflictOverlay({ 
  conflict, 
  backings 
}: { 
  conflict: Clash; 
  backings: BackingPlacement[]; 
}) {
  const conflictedBackings = backings.filter(b => conflict.items.includes(b.id));
  const color = conflict.severity === 'error' ? 'rgb(239, 68, 68)' : 'rgb(245, 158, 11)';
  const fillColor = conflict.severity === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';

  return (
    <g>
      {conflictedBackings.map(backing => (
        <g key={backing.id}>
          {/* Conflict highlight */}
          <rect
            x={backing.x - 2}
            y={backing.y - 2}
            width={backing.width + 4}
            height={backing.height + 4}
            fill={fillColor}
            stroke={color}
            strokeWidth="3"
            strokeDasharray="5,5"
          />
          
          {/* Conflict icon */}
          <circle
            cx={backing.x + backing.width - 8}
            cy={backing.y + 8}
            r="8"
            fill={color}
          />
          <text
            x={backing.x + backing.width - 8}
            y={backing.y + 12}
            fill="white"
            fontSize="10"
            textAnchor="middle"
            className="font-bold"
          >
            !
          </text>
        </g>
      ))}
      
      {/* Conflict connection lines for overlaps */}
      {conflict.type === 'backing_overlap' && conflictedBackings.length === 2 && (
        <line
          x1={conflictedBackings[0].x + conflictedBackings[0].width / 2}
          y1={conflictedBackings[0].y + conflictedBackings[0].height / 2}
          x2={conflictedBackings[1].x + conflictedBackings[1].width / 2}
          y2={conflictedBackings[1].y + conflictedBackings[1].height / 2}
          stroke={color}
          strokeWidth="2"
          strokeDasharray="3,3"
        />
      )}
    </g>
  );
}

// Distance Measurements Component
function DistanceMeasurements({ backings }: { backings: BackingPlacement[] }) {
  const measurements = [];
  
  // Calculate distances between nearby backings
  for (let i = 0; i < backings.length; i++) {
    for (let j = i + 1; j < backings.length; j++) {
      const b1 = backings[i];
      const b2 = backings[j];
      const distance = Math.sqrt(
        Math.pow(b2.x - b1.x, 2) + Math.pow(b2.y - b1.y, 2)
      );
      
      // Only show measurements for nearby backings
      if (distance < 100) {
        measurements.push({
          id: `${b1.id}-${b2.id}`,
          start: { x: b1.x + b1.width / 2, y: b1.y + b1.height / 2 },
          end: { x: b2.x + b2.width / 2, y: b2.y + b2.height / 2 },
          distance: Math.round(distance)
        });
      }
    }
  }

  return (
    <g>
      {measurements.map(measurement => (
        <g key={measurement.id}>
          {/* Measurement line */}
          <line
            x1={measurement.start.x}
            y1={measurement.start.y}
            x2={measurement.end.x}
            y2={measurement.end.y}
            stroke="rgba(156, 163, 175, 0.6)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          
          {/* Distance label */}
          <text
            x={(measurement.start.x + measurement.end.x) / 2}
            y={(measurement.start.y + measurement.end.y) / 2}
            fill="rgb(107, 114, 128)"
            fontSize="8"
            textAnchor="middle"
            className="bg-white px-1 rounded"
          >
            {measurement.distance}"
          </text>
        </g>
      ))}
    </g>
  );
}

// Snap Guide Component
function SnapGuide({ point }: { point: Point }) {
  return (
    <g>
      {/* Snap guide cross */}
      <line
        x1={point.x - 10}
        y1={point.y}
        x2={point.x + 10}
        y2={point.y}
        stroke="rgb(168, 85, 247)"
        strokeWidth="2"
      />
      <line
        x1={point.x}
        y1={point.y - 10}
        x2={point.x}
        y2={point.y + 10}
        stroke="rgb(168, 85, 247)"
        strokeWidth="2"
      />
      
      {/* Snap guide circle */}
      <circle
        cx={point.x}
        cy={point.y}
        r="4"
        fill="none"
        stroke="rgb(168, 85, 247)"
        strokeWidth="2"
      />
    </g>
  );
}

// Drag Preview Component
function DragPreview({ backing }: { backing: BackingPlacement }) {
  return (
    <rect
      x={backing.x}
      y={backing.y}
      width={backing.width}
      height={backing.height}
      fill="rgba(59, 130, 246, 0.3)"
      stroke="rgb(59, 130, 246)"
      strokeWidth="2"
      strokeDasharray="5,5"
    />
  );
}