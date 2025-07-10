import { useState, useMemo, useCallback } from 'react';
import { BackingPlacement, Point } from '@/types';
import { smartPlacementUtils } from '@/utils/smartPlacement';

interface UseVisualHelpersProps {
  allBackings: BackingPlacement[];
  selectedBackings: BackingPlacement[];
  isDragging: boolean;
  draggedBacking?: BackingPlacement;
  dragPosition?: Point;
  snapThreshold?: number;
  showDistanceThreshold?: number;
}

interface SnapPoint {
  point: Point;
  type: 'edge' | 'center' | 'corner';
  targetId?: string;
}

interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: Point;
  end: Point;
}

interface DistanceMeasurement {
  from: Point;
  to: Point;
  distance: number;
  label: string;
}

interface Collision {
  backingId: string;
  bounds: { x: number; y: number; width: number; height: number };
}

export function useVisualHelpers({
  allBackings,
  selectedBackings,
  isDragging,
  draggedBacking,
  dragPosition,
  snapThreshold = 10,
  showDistanceThreshold = 50
}: UseVisualHelpersProps) {
  
  // Calculate snap points when dragging
  const snapPoints = useMemo((): SnapPoint[] => {
    if (!isDragging || !dragPosition || !draggedBacking) return [];
    
    const otherBackings = allBackings.filter(b => b.id !== draggedBacking.id);
    const snapResult = smartPlacementUtils.snapToNearby(
      dragPosition, 
      otherBackings, 
      snapThreshold
    );
    
    if (snapResult.snapped) {
      return [{
        point: snapResult.position,
        type: snapResult.snapType,
        targetId: snapResult.targetId
      }];
    }
    
    return [];
  }, [isDragging, dragPosition, draggedBacking, allBackings, snapThreshold]);

  // Calculate alignment guides when dragging
  const alignmentGuides = useMemo((): AlignmentGuide[] => {
    if (!isDragging || !dragPosition || !draggedBacking) return [];
    
    const guides: AlignmentGuide[] = [];
    const otherBackings = allBackings.filter(b => b.id !== draggedBacking.id);
    
    // Get alignment suggestions
    const alignmentSuggestions = smartPlacementUtils.suggestAlignment(
      { ...draggedBacking, location: { ...draggedBacking.location, x: dragPosition.x, y: dragPosition.y } },
      otherBackings
    );
    
    // Convert top 3 suggestions to guide lines
    alignmentSuggestions.slice(0, 3).forEach(suggestion => {
      const isVertical = suggestion.type === 'left' || suggestion.type === 'right' || suggestion.type === 'center_horizontal';
      const otherBacking = otherBackings.find(b => b.id === suggestion.targetId);
      
      if (otherBacking) {
        if (isVertical) {
          guides.push({
            type: 'vertical',
            position: suggestion.position.x,
            start: { 
              x: suggestion.position.x, 
              y: Math.min(dragPosition.y, otherBacking.location.y) - 20 
            },
            end: { 
              x: suggestion.position.x, 
              y: Math.max(dragPosition.y + draggedBacking.dimensions.height, 
                         otherBacking.location.y + otherBacking.dimensions.height) + 20 
            }
          });
        } else {
          guides.push({
            type: 'horizontal',
            position: suggestion.position.y,
            start: { 
              x: Math.min(dragPosition.x, otherBacking.location.x) - 20, 
              y: suggestion.position.y 
            },
            end: { 
              x: Math.max(dragPosition.x + draggedBacking.dimensions.width, 
                         otherBacking.location.x + otherBacking.dimensions.width) + 20, 
              y: suggestion.position.y 
            }
          });
        }
      }
    });
    
    return guides;
  }, [isDragging, dragPosition, draggedBacking, allBackings]);

  // Calculate distance measurements to nearby objects
  const distanceMeasurements = useMemo((): DistanceMeasurement[] => {
    if (!isDragging || !dragPosition || !draggedBacking) return [];
    
    const measurements: DistanceMeasurement[] = [];
    const otherBackings = allBackings.filter(b => b.id !== draggedBacking.id);
    
    // Find nearby backings within threshold
    const nearbyBackings = otherBackings.filter(backing => {
      const centerDistance = Math.sqrt(
        Math.pow(backing.location.x + backing.dimensions.width / 2 - dragPosition.x - draggedBacking.dimensions.width / 2, 2) +
        Math.pow(backing.location.y + backing.dimensions.height / 2 - dragPosition.y - draggedBacking.dimensions.height / 2, 2)
      );
      return centerDistance <= showDistanceThreshold;
    });
    
    // Calculate distance to nearest edges
    nearbyBackings.forEach(backing => {
      const draggedBounds = {
        left: dragPosition.x,
        right: dragPosition.x + draggedBacking.dimensions.width,
        top: dragPosition.y,
        bottom: dragPosition.y + draggedBacking.dimensions.height,
        centerX: dragPosition.x + draggedBacking.dimensions.width / 2,
        centerY: dragPosition.y + draggedBacking.dimensions.height / 2
      };
      
      const targetBounds = {
        left: backing.location.x,
        right: backing.location.x + backing.dimensions.width,
        top: backing.location.y,
        bottom: backing.location.y + backing.dimensions.height,
        centerX: backing.location.x + backing.dimensions.width / 2,
        centerY: backing.location.y + backing.dimensions.height / 2
      };
      
      // Horizontal distances
      if (draggedBounds.right < targetBounds.left) {
        // Dragged is to the left
        const distance = targetBounds.left - draggedBounds.right;
        measurements.push({
          from: { x: draggedBounds.right, y: draggedBounds.centerY },
          to: { x: targetBounds.left, y: draggedBounds.centerY },
          distance,
          label: `${(distance / 12).toFixed(1)}'`
        });
      } else if (targetBounds.right < draggedBounds.left) {
        // Dragged is to the right
        const distance = draggedBounds.left - targetBounds.right;
        measurements.push({
          from: { x: targetBounds.right, y: draggedBounds.centerY },
          to: { x: draggedBounds.left, y: draggedBounds.centerY },
          distance,
          label: `${(distance / 12).toFixed(1)}'`
        });
      }
      
      // Vertical distances
      if (draggedBounds.bottom < targetBounds.top) {
        // Dragged is above
        const distance = targetBounds.top - draggedBounds.bottom;
        measurements.push({
          from: { x: draggedBounds.centerX, y: draggedBounds.bottom },
          to: { x: draggedBounds.centerX, y: targetBounds.top },
          distance,
          label: `${(distance / 12).toFixed(1)}'`
        });
      } else if (targetBounds.bottom < draggedBounds.top) {
        // Dragged is below
        const distance = draggedBounds.top - targetBounds.bottom;
        measurements.push({
          from: { x: draggedBounds.centerX, y: targetBounds.bottom },
          to: { x: draggedBounds.centerX, y: draggedBounds.top },
          distance,
          label: `${(distance / 12).toFixed(1)}'`
        });
      }
    });
    
    // Limit to closest measurements
    return measurements
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
      
  }, [isDragging, dragPosition, draggedBacking, allBackings, showDistanceThreshold]);

  // Calculate collisions
  const collisions = useMemo((): Collision[] => {
    if (!isDragging || !dragPosition || !draggedBacking) return [];
    
    const draggedAtNewPosition: BackingPlacement = {
      ...draggedBacking,
      location: { ...draggedBacking.location, x: dragPosition.x, y: dragPosition.y }
    };
    
    const collisionResult = smartPlacementUtils.checkCollisions(
      draggedAtNewPosition,
      allBackings.filter(b => b.id !== draggedBacking.id)
    );
    
    return collisionResult.overlappingBackings.map(backing => ({
      backingId: backing.id,
      bounds: {
        x: backing.location.x,
        y: backing.location.y,
        width: backing.dimensions.width,
        height: backing.dimensions.height
      }
    }));
  }, [isDragging, dragPosition, draggedBacking, allBackings]);

  return {
    snapPoints,
    alignmentGuides,
    distanceMeasurements,
    collisions
  };
}