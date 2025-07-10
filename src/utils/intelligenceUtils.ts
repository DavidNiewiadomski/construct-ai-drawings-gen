import { BackingPlacement, WallSegment, Point, DoorOpening, Clash } from '@/types';

export interface Dimensions {
  width: number;
  height: number;
}

export interface BoundingBox {
  topLeft: Point;
  width: number;
  height: number;
}

export const intelligenceUtils = {
  // Wall detection utilities
  detectWallsFromImage: (imageData: ImageData): WallSegment[] => {
    // Use edge detection to find walls
    // This would use computer vision in production
    return mockWallDetection();
  },
  
  snapToWall: (backing: BackingPlacement, wall: WallSegment, offset: number): BackingPlacement => {
    // Calculate position along wall with offset
    const wallVector = normalizeVector(subtract(wall.endPoint, wall.startPoint));
    const perpendicular = { x: -wallVector.y, y: wallVector.x };
    const backingPosition = { x: backing.x, y: backing.y };
    const offsetPosition = add(backingPosition, multiply(perpendicular, offset));
    
    const snappedPosition = snapToLine(offsetPosition, wall.startPoint, wall.endPoint);
    
    return {
      ...backing,
      x: snappedPosition.x,
      y: snappedPosition.y,
      location: {
        ...backing.location,
        x: snappedPosition.x,
        y: snappedPosition.y,
      },
      orientation: getWallAngle(wall)
    };
  },
  
  // Conflict detection utilities
  checkOverlap: (b1: BackingPlacement, b2: BackingPlacement): boolean => {
    return !(b1.x + b1.width < b2.x ||
             b2.x + b2.width < b1.x ||
             b1.y + b1.height < b2.y ||
             b2.y + b2.height < b1.y);
  },
  
  checkDoorSwingConflict: (door: DoorOpening, backing: BackingPlacement): boolean => {
    // Check if backing is within door swing arc
    const swingRadius = door.width;
    const backingPosition = { x: backing.x, y: backing.y };
    const distance = getDistance(door.position, backingPosition);
    return distance < swingRadius && isInSwingArc(door, backing);
  },
  
  checkClearanceConflict: (door: DoorOpening, backing: BackingPlacement): boolean => {
    // Check if backing interferes with required door clearance
    const clearanceZone = {
      x: door.position.x - door.clearanceRequired,
      y: door.position.y - door.clearanceRequired,
      width: door.width + (door.clearanceRequired * 2),
      height: door.height + (door.clearanceRequired * 2),
    };
    
    return !(backing.x + backing.width < clearanceZone.x ||
             clearanceZone.x + clearanceZone.width < backing.x ||
             backing.y + backing.height < clearanceZone.y ||
             clearanceZone.y + clearanceZone.height < backing.y);
  },
  
  // Optimization utilities
  findNearbyBackings: (backings: BackingPlacement[], threshold: number): BackingPlacement[][] => {
    const groups: BackingPlacement[][] = [];
    const visited = new Set<string>();
    
    backings.forEach(backing => {
      if (!visited.has(backing.id)) {
        const group = [backing];
        visited.add(backing.id);
        
        backings.forEach(other => {
          if (!visited.has(other.id) && 
              getDistance({ x: backing.x, y: backing.y }, { x: other.x, y: other.y }) < threshold &&
              backing.backingType === other.backingType) {
            group.push(other);
            visited.add(other.id);
          }
        });
        
        if (group.length > 1) {
          groups.push(group);
        }
      }
    });
    
    return groups;
  },
  
  combineBackings: (backings: BackingPlacement[]): BackingPlacement => {
    // Calculate bounding box of all backings
    const bounds = getBoundingBox(backings);
    
    return {
      id: generateId(),
      componentId: backings[0].componentId,
      x: bounds.topLeft.x,
      y: bounds.topLeft.y,
      width: bounds.width,
      height: bounds.height,
      backingType: backings[0].backingType,
      dimensions: {
        width: bounds.width,
        height: bounds.height,
        thickness: Math.max(...backings.map(b => b.dimensions.thickness)),
      },
      location: {
        x: bounds.topLeft.x,
        y: bounds.topLeft.y,
        z: backings[0].location.z,
      },
      orientation: 0,
      status: 'user_modified',
    };
  },
  
  getStandardSize: (backing: BackingPlacement): Dimensions => {
    // Round up to standard lumber sizes
    const standardWidths = [12, 16, 24, 32, 48, 64, 96];
    const standardHeights = [12, 16, 24, 32, 48, 64, 96];
    
    return {
      width: standardWidths.find(w => w >= backing.width) || backing.width,
      height: standardHeights.find(h => h >= backing.height) || backing.height,
    };
  },
  
  calculateMaterialWaste: (backings: BackingPlacement[]): number => {
    let totalWaste = 0;
    
    backings.forEach(backing => {
      const standard = intelligenceUtils.getStandardSize(backing);
      const waste = (standard.width * standard.height) - (backing.width * backing.height);
      totalWaste += waste;
    });
    
    return totalWaste;
  },
  
  suggestOptimizations: (backings: BackingPlacement[]): Array<{
    type: 'combine' | 'resize' | 'relocate' | 'standardize';
    items: string[];
    description: string;
    savings: { material: number; labor: number };
  }> => {
    const suggestions = [];
    
    // Find backings that can be combined
    const nearbyGroups = intelligenceUtils.findNearbyBackings(backings, 12);
    nearbyGroups.forEach(group => {
      if (group.length > 1) {
        const materialSaved = group.reduce((sum, b) => sum + (b.width * b.height), 0) * 0.1;
        suggestions.push({
          type: 'combine' as const,
          items: group.map(b => b.id),
          description: `Combine ${group.length} backings into single piece`,
          savings: { 
            material: materialSaved,
            labor: (group.length - 1) * 15 // 15 minutes per backing saved
          }
        });
      }
    });
    
    // Find non-standard sizes that can be standardized
    backings.forEach(backing => {
      const standardSize = intelligenceUtils.getStandardSize(backing);
      if (standardSize.width !== backing.width || standardSize.height !== backing.height) {
        suggestions.push({
          type: 'standardize' as const,
          items: [backing.id],
          description: `Standardize to ${standardSize.width}"×${standardSize.height}"`,
          savings: { material: 0, labor: 10 }
        });
      }
    });
    
    return suggestions;
  }
};

// Helper functions
function normalizeVector(vector: Point): Point {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return magnitude === 0 ? { x: 0, y: 0 } : { x: vector.x / magnitude, y: vector.y / magnitude };
}

function subtract(p1: Point, p2: Point): Point {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function add(p1: Point, p2: Point): Point {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function multiply(point: Point, scalar: number): Point {
  return { x: point.x * scalar, y: point.y * scalar };
}

function snapToLine(point: Point, lineStart: Point, lineEnd: Point): Point {
  const lineVector = subtract(lineEnd, lineStart);
  const pointVector = subtract(point, lineStart);
  
  const lineLength = Math.sqrt(lineVector.x * lineVector.x + lineVector.y * lineVector.y);
  if (lineLength === 0) return lineStart;
  
  const normalizedLine = { x: lineVector.x / lineLength, y: lineVector.y / lineLength };
  const projection = pointVector.x * normalizedLine.x + pointVector.y * normalizedLine.y;
  
  const clampedProjection = Math.max(0, Math.min(lineLength, projection));
  
  return {
    x: lineStart.x + normalizedLine.x * clampedProjection,
    y: lineStart.y + normalizedLine.y * clampedProjection
  };
}

function getWallAngle(wall: WallSegment): number {
  const dx = wall.endPoint.x - wall.startPoint.x;
  const dy = wall.endPoint.y - wall.startPoint.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function isInSwingArc(door: DoorOpening, backing: BackingPlacement): boolean {
  // Simplified swing arc check - in production this would be more sophisticated
  const doorAngle = Math.atan2(door.position.y, door.position.x);
  const backingAngle = Math.atan2(backing.y - door.position.y, backing.x - door.position.x);
  const angleDiff = Math.abs(doorAngle - backingAngle);
  
  // Check if backing is within 90-degree swing arc
  return angleDiff <= Math.PI / 2;
}

function getBoundingBox(backings: BackingPlacement[]): BoundingBox {
  if (backings.length === 0) {
    return { topLeft: { x: 0, y: 0 }, width: 0, height: 0 };
  }
  
  const minX = Math.min(...backings.map(b => b.x));
  const minY = Math.min(...backings.map(b => b.y));
  const maxX = Math.max(...backings.map(b => b.x + b.width));
  const maxY = Math.max(...backings.map(b => b.y + b.height));
  
  return {
    topLeft: { x: minX, y: minY },
    width: maxX - minX,
    height: maxY - minY
  };
}

function generateId(): string {
  return crypto.randomUUID();
}

function mockWallDetection(): WallSegment[] {
  // Mock wall detection for development
  return [
    {
      id: 'wall-1',
      start: { x: 0, y: 0 },
      end: { x: 240, y: 0 },
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 240, y: 0 },
      thickness: 6,
      length: 240,
      type: 'exterior',
    },
    {
      id: 'wall-2',
      start: { x: 240, y: 0 },
      end: { x: 240, y: 120 },
      startPoint: { x: 240, y: 0 },
      endPoint: { x: 240, y: 120 },
      thickness: 6,
      length: 120,
      type: 'exterior',
    },
    {
      id: 'wall-3',
      start: { x: 240, y: 120 },
      end: { x: 0, y: 120 },
      startPoint: { x: 240, y: 120 },
      endPoint: { x: 0, y: 120 },
      thickness: 6,
      length: 240,
      type: 'exterior',
    },
    {
      id: 'wall-4',
      start: { x: 0, y: 120 },
      end: { x: 0, y: 0 },
      startPoint: { x: 0, y: 120 },
      endPoint: { x: 0, y: 0 },
      thickness: 6,
      length: 120,
      type: 'exterior',
    },
  ];
}