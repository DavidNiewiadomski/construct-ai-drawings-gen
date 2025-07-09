import { WallSegment, Clash, Pattern, BackingZone, Dimension, Point, BackingPlacement, DetectedComponent, BackingRule } from '@/types';

class IntelligenceService {
  private readonly API_BASE = '/api/intelligence';

  // Wall Detection
  async detectWalls(imageData: ImageData): Promise<WallSegment[]> {
    try {
      // In a real implementation, this would send image data to AI service
      return this.getMockWalls();
    } catch (error) {
      console.error('Wall detection failed:', error);
      return this.getMockWalls();
    }
  }

  // Clash Detection
  async detectClashes(backings: BackingPlacement[], walls: WallSegment[]): Promise<Clash[]> {
    try {
      const clashes: Clash[] = [];
      
      // Check for backing overlaps
      for (let i = 0; i < backings.length; i++) {
        for (let j = i + 1; j < backings.length; j++) {
          if (this.checkBackingOverlap(backings[i], backings[j])) {
            clashes.push({
              id: `clash-${i}-${j}`,
              type: 'backing_overlap',
              severity: 'error',
              items: [backings[i].id, backings[j].id],
              resolution: 'Resize or relocate one of the backings',
            });
          }
        }
      }

      return clashes;
    } catch (error) {
      console.error('Clash detection failed:', error);
      return [];
    }
  }

  // Pattern Recognition
  async findPatterns(components: DetectedComponent[]): Promise<Pattern[]> {
    try {
      return this.getMockPatterns();
    } catch (error) {
      console.error('Pattern recognition failed:', error);
      return this.getMockPatterns();
    }
  }

  // Backing Optimization
  async optimizeBackings(backings: BackingPlacement[]): Promise<BackingZone[]> {
    try {
      const zones: BackingZone[] = [];
      const grouped = this.groupNearbyBackings(backings);
      
      grouped.forEach((group, index) => {
        if (group.length > 1) {
          zones.push({
            id: `zone-${index}`,
            components: group.map(b => b.componentId),
            combinedBacking: this.combineBacking(group),
            savings: {
              material: group.length * 0.2, // 20% material savings per backing
              laborHours: group.length * 0.5, // 30 minutes saved per backing
            },
          });
        }
      });

      return zones;
    } catch (error) {
      console.error('Backing optimization failed:', error);
      return [];
    }
  }

  // Dimension Generation
  async generateDimensions(backings: BackingPlacement[], walls: WallSegment[]): Promise<Dimension[]> {
    try {
      const dimensions: Dimension[] = [];
      
      // Generate dimensions to nearest walls
      backings.forEach((backing, index) => {
        const nearestWall = this.findNearestWall(backing, walls);
        if (nearestWall) {
          dimensions.push({
            id: `dim-${index}`,
            start: { x: backing.location.x, y: backing.location.y },
            end: this.getClosestPointOnWall(backing.location, nearestWall),
            value: this.calculateDistance(backing.location, nearestWall),
            label: `${this.calculateDistance(backing.location, nearestWall)}"`,
            type: 'linear',
          });
        }
      });

      return dimensions;
    } catch (error) {
      console.error('Dimension generation failed:', error);
      return [];
    }
  }

  // Private helper methods
  private getMockWalls(): WallSegment[] {
    return [
      {
        id: 'wall-1',
        start: { x: 0, y: 0 },
        end: { x: 240, y: 0 },
        thickness: 6,
        type: 'exterior',
      },
      {
        id: 'wall-2',
        start: { x: 240, y: 0 },
        end: { x: 240, y: 120 },
        thickness: 6,
        type: 'exterior',
      },
      {
        id: 'wall-3',
        start: { x: 240, y: 120 },
        end: { x: 0, y: 120 },
        thickness: 6,
        type: 'exterior',
      },
      {
        id: 'wall-4',
        start: { x: 0, y: 120 },
        end: { x: 0, y: 0 },
        thickness: 6,
        type: 'exterior',
      },
    ];
  }

  private getMockPatterns(): Pattern[] {
    return [
      {
        id: 'bathroom-standard',
        name: 'Standard Bathroom Layout',
        roomType: 'bathroom',
        components: [
          {
            type: 'grab_bar',
            relativePosition: { x: 60, y: 36 },
            backing: {
              id: 'rule-1',
              componentType: 'grab_bar',
              condition: { weightMax: 20 },
              backing: { type: '2x6', width: 42, height: 6, heightAFF: 34 },
              notes: 'ADA compliant grab bar',
            },
          },
        ],
      },
    ];
  }

  private checkBackingOverlap(backing1: BackingPlacement, backing2: BackingPlacement): boolean {
    const b1 = backing1.location;
    const b2 = backing2.location;
    const d1 = backing1.dimensions;
    const d2 = backing2.dimensions;

    return !(
      b1.x + d1.width < b2.x ||
      b2.x + d2.width < b1.x ||
      b1.y + d1.height < b2.y ||
      b2.y + d2.height < b1.y
    );
  }

  private groupNearbyBackings(backings: BackingPlacement[]): BackingPlacement[][] {
    const threshold = 24; // 24 inches
    const groups: BackingPlacement[][] = [];
    const processed = new Set<string>();

    backings.forEach(backing => {
      if (processed.has(backing.id)) return;

      const group = [backing];
      processed.add(backing.id);

      backings.forEach(other => {
        if (processed.has(other.id)) return;
        
        const distance = Math.sqrt(
          Math.pow(backing.location.x - other.location.x, 2) +
          Math.pow(backing.location.y - other.location.y, 2)
        );

        if (distance <= threshold) {
          group.push(other);
          processed.add(other.id);
        }
      });

      groups.push(group);
    });

    return groups;
  }

  private combineBacking(backings: BackingPlacement[]): BackingPlacement {
    const minX = Math.min(...backings.map(b => b.location.x));
    const minY = Math.min(...backings.map(b => b.location.y));
    const maxX = Math.max(...backings.map(b => b.location.x + b.dimensions.width));
    const maxY = Math.max(...backings.map(b => b.location.y + b.dimensions.height));

    return {
      id: `combined-${Date.now()}`,
      componentId: 'combined',
      backingType: backings[0].backingType,
      dimensions: {
        width: maxX - minX,
        height: maxY - minY,
        thickness: Math.max(...backings.map(b => b.dimensions.thickness)),
      },
      location: { x: minX, y: minY, z: backings[0].location.z },
      orientation: 0,
      status: 'ai_generated',
    };
  }

  private findNearestWall(backing: BackingPlacement, walls: WallSegment[]): WallSegment | null {
    if (walls.length === 0) return null;

    let nearest = walls[0];
    let minDistance = this.calculateDistance(backing.location, walls[0]);

    walls.forEach(wall => {
      const distance = this.calculateDistance(backing.location, wall);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = wall;
      }
    });

    return nearest;
  }

  private calculateDistance(point: Point, wall: WallSegment): number {
    // Simplified distance calculation to wall
    const A = point.x - wall.start.x;
    const B = point.y - wall.start.y;
    const C = wall.end.x - wall.start.x;
    const D = wall.end.y - wall.start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let xx, yy;

    if (param < 0) {
      xx = wall.start.x;
      yy = wall.start.y;
    } else if (param > 1) {
      xx = wall.end.x;
      yy = wall.end.y;
    } else {
      xx = wall.start.x + param * C;
      yy = wall.start.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getClosestPointOnWall(point: Point, wall: WallSegment): Point {
    // Simplified closest point calculation
    return {
      x: (wall.start.x + wall.end.x) / 2,
      y: (wall.start.y + wall.end.y) / 2,
    };
  }
}

export const intelligenceService = new IntelligenceService();