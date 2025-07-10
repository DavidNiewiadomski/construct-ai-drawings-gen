import { Point, BackingPlacement } from '@/types';

interface AlignmentSuggestion {
  type: 'left' | 'right' | 'top' | 'bottom' | 'center_horizontal' | 'center_vertical';
  position: Point;
  targetId: string;
  distance: number;
}

interface CollisionResult {
  hasCollision: boolean;
  overlappingBackings: BackingPlacement[];
  overlapArea: number;
}

interface GroupingSuggestion {
  backingIds: string[];
  groupType: 'linear' | 'grid' | 'cluster';
  center: Point;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  material: string;
  count: number;
}

interface SnapResult {
  snapped: boolean;
  position: Point;
  snapType: 'edge' | 'center' | 'corner';
  targetId?: string;
}

export const smartPlacementUtils = {
  /**
   * Snap to nearby backing edges, centers, or corners
   */
  snapToNearby: (
    position: Point, 
    backings: BackingPlacement[], 
    threshold: number = 10
  ): SnapResult => {
    let closestSnap: SnapResult = {
      snapped: false,
      position,
      snapType: 'edge'
    };
    let minDistance = threshold;

    for (const backing of backings) {
      const bounds = getBounds(backing);
      
      // Check snap to edges
      const edgeSnaps = [
        { pos: { x: bounds.left, y: position.y }, type: 'edge' as const, id: backing.id },
        { pos: { x: bounds.right, y: position.y }, type: 'edge' as const, id: backing.id },
        { pos: { x: position.x, y: bounds.top }, type: 'edge' as const, id: backing.id },
        { pos: { x: position.x, y: bounds.bottom }, type: 'edge' as const, id: backing.id },
      ];

      // Check snap to center
      const centerSnap = {
        pos: { x: bounds.centerX, y: bounds.centerY },
        type: 'center' as const,
        id: backing.id
      };

      // Check snap to corners
      const cornerSnaps = [
        { pos: { x: bounds.left, y: bounds.top }, type: 'corner' as const, id: backing.id },
        { pos: { x: bounds.right, y: bounds.top }, type: 'corner' as const, id: backing.id },
        { pos: { x: bounds.left, y: bounds.bottom }, type: 'corner' as const, id: backing.id },
        { pos: { x: bounds.right, y: bounds.bottom }, type: 'corner' as const, id: backing.id },
      ];

      const allSnaps = [...edgeSnaps, centerSnap, ...cornerSnaps];

      for (const snap of allSnaps) {
        const distance = getDistance(position, snap.pos);
        if (distance < minDistance) {
          minDistance = distance;
          closestSnap = {
            snapped: true,
            position: snap.pos,
            snapType: snap.type,
            targetId: snap.id
          };
        }
      }
    }

    return closestSnap;
  },

  /**
   * Suggest alignment positions with existing backings
   */
  suggestAlignment: (
    backing: BackingPlacement, 
    others: BackingPlacement[]
  ): AlignmentSuggestion[] => {
    const suggestions: AlignmentSuggestion[] = [];
    const bounds = getBounds(backing);

    for (const other of others) {
      if (other.id === backing.id) continue;
      
      const otherBounds = getBounds(other);
      
      // Left edge alignment
      suggestions.push({
        type: 'left',
        position: { x: otherBounds.left, y: backing.location.y },
        targetId: other.id,
        distance: Math.abs(bounds.left - otherBounds.left)
      });

      // Right edge alignment
      suggestions.push({
        type: 'right',
        position: { 
          x: otherBounds.right - backing.dimensions.width, 
          y: backing.location.y 
        },
        targetId: other.id,
        distance: Math.abs(bounds.right - otherBounds.right)
      });

      // Top edge alignment
      suggestions.push({
        type: 'top',
        position: { x: backing.location.x, y: otherBounds.top },
        targetId: other.id,
        distance: Math.abs(bounds.top - otherBounds.top)
      });

      // Bottom edge alignment
      suggestions.push({
        type: 'bottom',
        position: { 
          x: backing.location.x, 
          y: otherBounds.bottom - backing.dimensions.height 
        },
        targetId: other.id,
        distance: Math.abs(bounds.bottom - otherBounds.bottom)
      });

      // Center horizontal alignment
      suggestions.push({
        type: 'center_horizontal',
        position: { 
          x: otherBounds.centerX - backing.dimensions.width / 2, 
          y: backing.location.y 
        },
        targetId: other.id,
        distance: Math.abs(bounds.centerX - otherBounds.centerX)
      });

      // Center vertical alignment
      suggestions.push({
        type: 'center_vertical',
        position: { 
          x: backing.location.x, 
          y: otherBounds.centerY - backing.dimensions.height / 2 
        },
        targetId: other.id,
        distance: Math.abs(bounds.centerY - otherBounds.centerY)
      });
    }

    // Sort by distance and return top suggestions
    return suggestions
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  },

  /**
   * Check for overlaps and collisions
   */
  checkCollisions: (
    backing: BackingPlacement, 
    others: BackingPlacement[]
  ): CollisionResult => {
    const overlappingBackings: BackingPlacement[] = [];
    let totalOverlapArea = 0;

    const bounds = getBounds(backing);

    for (const other of others) {
      if (other.id === backing.id) continue;
      
      const otherBounds = getBounds(other);
      
      // Check if rectangles overlap
      if (rectanglesOverlap(bounds, otherBounds)) {
        overlappingBackings.push(other);
        
        // Calculate overlap area
        const overlapArea = getOverlapArea(bounds, otherBounds);
        totalOverlapArea += overlapArea;
      }
    }

    return {
      hasCollision: overlappingBackings.length > 0,
      overlappingBackings,
      overlapArea: totalOverlapArea
    };
  },

  /**
   * Suggest grouping of nearby similar backings
   */
  suggestGrouping: (backings: BackingPlacement[]): GroupingSuggestion[] => {
    const suggestions: GroupingSuggestion[] = [];
    const processed = new Set<string>();

    for (const backing of backings) {
      if (processed.has(backing.id)) continue;

      // Find similar backings nearby
      const similarNearby = backings.filter(other => 
        !processed.has(other.id) &&
        other.backingType === backing.backingType &&
        areSimilarDimensions(backing.dimensions, other.dimensions) &&
        getDistance(backing.location, other.location) < 100 // 100 units proximity
      );

      if (similarNearby.length >= 3) { // Minimum 3 for grouping
        const group = analyzeGroupPattern(similarNearby);
        
        if (group) {
          suggestions.push(group);
          similarNearby.forEach(b => processed.add(b.id));
        }
      }
    }

    return suggestions.sort((a, b) => b.count - a.count);
  },

  /**
   * Find optimal spacing between backings
   */
  getOptimalSpacing: (
    backingType: string, 
    componentType?: string
  ): { horizontal: number; vertical: number } => {
    // Standard spacing guidelines based on backing type
    const spacingMap: Record<string, { horizontal: number; vertical: number }> = {
      '2x4': { horizontal: 16, vertical: 16 },
      '2x6': { horizontal: 16, vertical: 16 },
      '2x8': { horizontal: 24, vertical: 24 },
      '2x10': { horizontal: 24, vertical: 24 },
      '3/4_plywood': { horizontal: 24, vertical: 24 },
      'steel_plate': { horizontal: 12, vertical: 12 },
      'blocking': { horizontal: 8, vertical: 8 }
    };

    return spacingMap[backingType] || { horizontal: 16, vertical: 16 };
  },

  /**
   * Generate distribution points for multiple backings
   */
  generateDistribution: (
    startPoint: Point,
    endPoint: Point,
    count: number,
    backingType: string
  ): Point[] => {
    const points: Point[] = [];
    const spacing = smartPlacementUtils.getOptimalSpacing(backingType);
    
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;
    
    // Determine if distribution should follow actual spacing or be evenly distributed
    const actualDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const optimalSpacing = Math.max(spacing.horizontal, spacing.vertical);
    const optimalCount = Math.floor(actualDistance / optimalSpacing) + 1;
    
    const useCount = Math.min(count, optimalCount);
    
    for (let i = 0; i < useCount; i++) {
      const ratio = useCount === 1 ? 0 : i / (useCount - 1);
      points.push({
        x: startPoint.x + deltaX * ratio,
        y: startPoint.y + deltaY * ratio
      });
    }
    
    return points;
  }
};

// Helper functions

function getBounds(backing: BackingPlacement) {
  const { location, dimensions } = backing;
  return {
    left: location.x,
    right: location.x + dimensions.width,
    top: location.y,
    bottom: location.y + dimensions.height,
    centerX: location.x + dimensions.width / 2,
    centerY: location.y + dimensions.height / 2,
    width: dimensions.width,
    height: dimensions.height
  };
}

function getDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function rectanglesOverlap(rect1: any, rect2: any): boolean {
  return !(rect1.right <= rect2.left || 
           rect2.right <= rect1.left || 
           rect1.bottom <= rect2.top || 
           rect2.bottom <= rect1.top);
}

function getOverlapArea(rect1: any, rect2: any): number {
  const overlapLeft = Math.max(rect1.left, rect2.left);
  const overlapRight = Math.min(rect1.right, rect2.right);
  const overlapTop = Math.max(rect1.top, rect2.top);
  const overlapBottom = Math.min(rect1.bottom, rect2.bottom);
  
  if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
    return (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
  }
  return 0;
}

function areSimilarDimensions(dim1: any, dim2: any, tolerance: number = 2): boolean {
  return Math.abs(dim1.width - dim2.width) <= tolerance &&
         Math.abs(dim1.height - dim2.height) <= tolerance &&
         Math.abs(dim1.thickness - dim2.thickness) <= tolerance;
}

function analyzeGroupPattern(backings: BackingPlacement[]): GroupingSuggestion | null {
  if (backings.length < 3) return null;

  const positions = backings.map(b => b.location);
  const bounds = {
    minX: Math.min(...positions.map(p => p.x)),
    maxX: Math.max(...positions.map(p => p.x)),
    minY: Math.min(...positions.map(p => p.y)),
    maxY: Math.max(...positions.map(p => p.y))
  };

  // Analyze pattern type
  let groupType: 'linear' | 'grid' | 'cluster' = 'cluster';
  
  // Check for linear pattern (collinear points)
  if (isLinearPattern(positions)) {
    groupType = 'linear';
  } else if (isGridPattern(positions)) {
    groupType = 'grid';
  }

  return {
    backingIds: backings.map(b => b.id),
    groupType,
    center: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2
    },
    bounds,
    material: backings[0].backingType,
    count: backings.length
  };
}

function isLinearPattern(positions: Point[], tolerance: number = 5): boolean {
  if (positions.length < 3) return false;
  
  // Check if points are roughly collinear
  const first = positions[0];
  const last = positions[positions.length - 1];
  
  for (let i = 1; i < positions.length - 1; i++) {
    const point = positions[i];
    const distance = pointToLineDistance(point, first, last);
    if (distance > tolerance) return false;
  }
  
  return true;
}

function isGridPattern(positions: Point[], tolerance: number = 5): boolean {
  if (positions.length < 4) return false;
  
  // Check for regular spacing in both X and Y directions
  const sortedByX = [...positions].sort((a, b) => a.x - b.x);
  const sortedByY = [...positions].sort((a, b) => a.y - b.y);
  
  // Check X spacing consistency
  const xSpacings = [];
  for (let i = 1; i < sortedByX.length; i++) {
    const spacing = sortedByX[i].x - sortedByX[i - 1].x;
    if (spacing > tolerance) xSpacings.push(spacing);
  }
  
  // Check Y spacing consistency
  const ySpacings = [];
  for (let i = 1; i < sortedByY.length; i++) {
    const spacing = sortedByY[i].y - sortedByY[i - 1].y;
    if (spacing > tolerance) ySpacings.push(spacing);
  }
  
  // Grid pattern should have consistent spacing
  const xConsistent = xSpacings.length > 0 && 
    xSpacings.every(s => Math.abs(s - xSpacings[0]) <= tolerance);
  const yConsistent = ySpacings.length > 0 && 
    ySpacings.every(s => Math.abs(s - ySpacings[0]) <= tolerance);
  
  return xConsistent && yConsistent;
}

function pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return getDistance(point, lineStart);
  
  const param = dot / lenSq;
  
  let xx, yy;
  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}