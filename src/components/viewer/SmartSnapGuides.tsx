import React, { useState, useEffect } from 'react';
import { BackingPlacement, Point } from '@/types';
import { intelligenceUtils } from '@/utils/intelligenceUtils';

interface SmartSnapGuidesProps {
  draggedBacking?: BackingPlacement;
  allBackings: BackingPlacement[];
  walls: any[];
  enabled: boolean;
  snapDistance: number;
}

export function SmartSnapGuides({
  draggedBacking,
  allBackings,
  walls,
  enabled,
  snapDistance = 12
}: SmartSnapGuidesProps) {
  const [snapPoints, setSnapPoints] = useState<Point[]>([]);
  const [alignmentGuides, setAlignmentGuides] = useState<Array<{
    type: 'horizontal' | 'vertical';
    position: number;
    start: Point;
    end: Point;
  }>>([]);

  useEffect(() => {
    if (!enabled || !draggedBacking) {
      setSnapPoints([]);
      setAlignmentGuides([]);
      return;
    }

    const otherBackings = allBackings.filter(b => b.id !== draggedBacking.id);
    const newSnapPoints: Point[] = [];
    const newAlignmentGuides: Array<{
      type: 'horizontal' | 'vertical';
      position: number;
      start: Point;
      end: Point;
    }> = [];

    // Generate snap points from other backings
    otherBackings.forEach(backing => {
      // Corner snap points
      newSnapPoints.push(
        { x: backing.x, y: backing.y }, // Top-left
        { x: backing.x + backing.width, y: backing.y }, // Top-right
        { x: backing.x, y: backing.y + backing.height }, // Bottom-left
        { x: backing.x + backing.width, y: backing.y + backing.height }, // Bottom-right
        { x: backing.x + backing.width / 2, y: backing.y + backing.height / 2 } // Center
      );

      // Alignment guides
      const draggedCenter = {
        x: draggedBacking.x + draggedBacking.width / 2,
        y: draggedBacking.y + draggedBacking.height / 2
      };
      const backingCenter = {
        x: backing.x + backing.width / 2,
        y: backing.y + backing.height / 2
      };

      // Horizontal alignment (same Y)
      if (Math.abs(draggedCenter.y - backingCenter.y) < snapDistance) {
        newAlignmentGuides.push({
          type: 'horizontal',
          position: backingCenter.y,
          start: { x: Math.min(draggedCenter.x, backingCenter.x) - 50, y: backingCenter.y },
          end: { x: Math.max(draggedCenter.x, backingCenter.x) + 50, y: backingCenter.y }
        });
      }

      // Vertical alignment (same X)
      if (Math.abs(draggedCenter.x - backingCenter.x) < snapDistance) {
        newAlignmentGuides.push({
          type: 'vertical',
          position: backingCenter.x,
          start: { x: backingCenter.x, y: Math.min(draggedCenter.y, backingCenter.y) - 50 },
          end: { x: backingCenter.x, y: Math.max(draggedCenter.y, backingCenter.y) + 50 }
        });
      }

      // Edge alignment
      if (Math.abs(draggedBacking.x - backing.x) < snapDistance) {
        newAlignmentGuides.push({
          type: 'vertical',
          position: backing.x,
          start: { x: backing.x, y: Math.min(draggedBacking.y, backing.y) - 20 },
          end: { x: backing.x, y: Math.max(draggedBacking.y + draggedBacking.height, backing.y + backing.height) + 20 }
        });
      }

      if (Math.abs(draggedBacking.y - backing.y) < snapDistance) {
        newAlignmentGuides.push({
          type: 'horizontal',
          position: backing.y,
          start: { x: Math.min(draggedBacking.x, backing.x) - 20, y: backing.y },
          end: { x: Math.max(draggedBacking.x + draggedBacking.width, backing.x + backing.width) + 20, y: backing.y }
        });
      }
    });

    // Wall snap points
    walls.forEach(wall => {
      // Add snap points along wall at regular intervals
      const wallLength = Math.sqrt(
        Math.pow(wall.endPoint.x - wall.startPoint.x, 2) +
        Math.pow(wall.endPoint.y - wall.startPoint.y, 2)
      );
      const segments = Math.ceil(wallLength / 24); // Every 24 inches
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        newSnapPoints.push({
          x: wall.startPoint.x + (wall.endPoint.x - wall.startPoint.x) * t,
          y: wall.startPoint.y + (wall.endPoint.y - wall.startPoint.y) * t
        });
      }
    });

    setSnapPoints(newSnapPoints);
    setAlignmentGuides(newAlignmentGuides);
  }, [draggedBacking, allBackings, walls, enabled, snapDistance]);

  if (!enabled || !draggedBacking) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-15">
      <svg className="w-full h-full" viewBox="0 0 1000 1000">
        {/* Snap Points */}
        {snapPoints.map((point, index) => {
          const distance = Math.sqrt(
            Math.pow(point.x - (draggedBacking.x + draggedBacking.width / 2), 2) +
            Math.pow(point.y - (draggedBacking.y + draggedBacking.height / 2), 2)
          );
          
          if (distance > snapDistance) return null;
          
          return (
            <g key={`snap-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgba(168, 85, 247, 0.8)"
                stroke="white"
                strokeWidth="1"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="none"
                stroke="rgba(168, 85, 247, 0.4)"
                strokeWidth="1"
                className="animate-ping"
              />
            </g>
          );
        })}

        {/* Alignment Guides */}
        {alignmentGuides.map((guide, index) => (
          <line
            key={`guide-${index}`}
            x1={guide.start.x}
            y1={guide.start.y}
            x2={guide.end.x}
            y2={guide.end.y}
            stroke="rgba(168, 85, 247, 0.6)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Distance indicators */}
        {allBackings
          .filter(b => b.id !== draggedBacking.id)
          .map(backing => {
            const distance = Math.sqrt(
              Math.pow(backing.x - draggedBacking.x, 2) +
              Math.pow(backing.y - draggedBacking.y, 2)
            );
            
            if (distance > 60) return null; // Only show for nearby backings
            
            const midpoint = {
              x: (backing.x + backing.width / 2 + draggedBacking.x + draggedBacking.width / 2) / 2,
              y: (backing.y + backing.height / 2 + draggedBacking.y + draggedBacking.height / 2) / 2
            };
            
            return (
              <g key={`distance-${backing.id}`}>
                <line
                  x1={backing.x + backing.width / 2}
                  y1={backing.y + backing.height / 2}
                  x2={draggedBacking.x + draggedBacking.width / 2}
                  y2={draggedBacking.y + draggedBacking.height / 2}
                  stroke="rgba(107, 114, 128, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <circle
                  cx={midpoint.x}
                  cy={midpoint.y}
                  r="12"
                  fill="white"
                  stroke="rgba(107, 114, 128, 0.6)"
                  strokeWidth="1"
                />
                <text
                  x={midpoint.x}
                  y={midpoint.y + 2}
                  fill="rgb(107, 114, 128)"
                  fontSize="8"
                  textAnchor="middle"
                  className="font-medium"
                >
                  {Math.round(distance)}"
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}