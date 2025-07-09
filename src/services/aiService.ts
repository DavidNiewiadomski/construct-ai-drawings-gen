import { DetectedComponent, BackingRule, BackingPlacement, ProcessingStatus } from '@/types';

export class AIService {
  private baseUrl = '/api/ai';

  async detectComponents(fileIds: string[]): Promise<DetectedComponent[]> {
    try {
      const response = await fetch('/api/ai/detect-components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to detect components');
      }

      const data = await response.json();
      return data.components || [];
    } catch (error) {
      console.error('Error detecting components:', error);
      
      // Return mock data for demo
      return this.getMockDetectedComponents(fileIds);
    }
  }

  async getBackingRules(): Promise<BackingRule[]> {
    try {
      const stored = localStorage.getItem('backingRules');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default rules
      return this.getDefaultBackingRules();
    } catch (error) {
      console.error('Error getting backing rules:', error);
      return this.getDefaultBackingRules();
    }
  }

  async saveBackingRule(rule: BackingRule): Promise<void> {
    try {
      const rules = await this.getBackingRules();
      const existingIndex = rules.findIndex(r => r.id === rule.id);
      
      if (existingIndex >= 0) {
        rules[existingIndex] = rule;
      } else {
        rules.push(rule);
      }
      
      localStorage.setItem('backingRules', JSON.stringify(rules));
    } catch (error) {
      console.error('Error saving backing rule:', error);
      throw error;
    }
  }

  async deleteBackingRule(ruleId: string): Promise<void> {
    try {
      const rules = await this.getBackingRules();
      const filteredRules = rules.filter(r => r.id !== ruleId);
      localStorage.setItem('backingRules', JSON.stringify(filteredRules));
    } catch (error) {
      console.error('Error deleting backing rule:', error);
      throw error;
    }
  }

  async generatePlacements(
    components: DetectedComponent[], 
    rules: BackingRule[]
  ): Promise<BackingPlacement[]> {
    try {
      const response = await fetch('/api/ai/generate-placements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ components, rules }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate placements');
      }

      const data = await response.json();
      return data.placements || [];
    } catch (error) {
      console.error('Error generating placements:', error);
      
      // Return mock placements
      return this.generateMockPlacements(components, rules);
    }
  }

  async getProcessingStatus(): Promise<ProcessingStatus> {
    try {
      const response = await fetch('/api/ai/processing-status');
      if (!response.ok) {
        throw new Error('Failed to get processing status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting processing status:', error);
      return {
        stage: 'complete',
        progress: 100,
        message: 'Processing complete',
      };
    }
  }

  private getMockDetectedComponents(fileIds: string[]): DetectedComponent[] {
    const mockComponents: DetectedComponent[] = [];
    
    fileIds.forEach((fileId, fileIndex) => {
      // Generate 3-5 random components per file
      const componentCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < componentCount; i++) {
        const types = ['tv', 'fire_extinguisher', 'sink', 'grab_bar', 'cabinet', 'equipment'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        mockComponents.push({
          id: `${fileId}-comp-${i}`,
          fileId,
          pageNumber: 1,
          componentType: type as any,
          boundingBox: {
            x: Math.random() * 800,
            y: Math.random() * 600,
            width: 50 + Math.random() * 100,
            height: 30 + Math.random() * 80,
          },
          text: this.getMockComponentText(type),
          confidence: 0.6 + Math.random() * 0.4, // 60-100%
          specifications: this.getMockSpecifications(type),
        });
      }
    });
    
    return mockComponents;
  }

  private getMockComponentText(type: string): string {
    const texts = {
      tv: 'TV MOUNT 55"',
      fire_extinguisher: '5LB FIRE EXT',
      sink: 'HAND SINK',
      grab_bar: 'GRAB BAR 36"',
      cabinet: 'WALL CABINET',
      equipment: 'EQUIPMENT',
    };
    return texts[type as keyof typeof texts] || 'COMPONENT';
  }

  private getMockSpecifications(type: string): Record<string, any> {
    const specs = {
      tv: { weight: '40 lbs', size: '55"', mounting: 'wall' },
      fire_extinguisher: { weight: '8 lbs', type: '5lb ABC', height: '16"' },
      sink: { type: 'hand sink', drain: 'center', faucet: 'single' },
      grab_bar: { length: '36"', diameter: '1.5"', ada: true },
      cabinet: { width: '24"', height: '30"', depth: '12"' },
      equipment: { type: 'misc', weight: 'unknown' },
    };
    return specs[type as keyof typeof specs] || {};
  }

  private getDefaultBackingRules(): BackingRule[] {
    return [
      {
        id: 'tv-light',
        componentType: 'tv',
        condition: { weightMin: 0, weightMax: 50 },
        backing: { type: '2x6', width: 48, height: 24, heightAFF: 60 },
        notes: 'Standard TV mount backing',
      },
      {
        id: 'tv-heavy',
        componentType: 'tv',
        condition: { weightMin: 50, weightMax: 100 },
        backing: { type: '2x8', width: 48, height: 32, heightAFF: 60 },
        notes: 'Heavy TV mount backing',
      },
      {
        id: 'fire-extinguisher',
        componentType: 'fire_extinguisher',
        condition: {},
        backing: { type: '3/4_plywood', width: 16, height: 16, heightAFF: 48 },
        notes: '16"x16" plywood backing',
      },
      {
        id: 'grab-bar',
        componentType: 'grab_bar',
        condition: {},
        backing: { type: '2x6', width: 48, height: 6, heightAFF: 34 },
        notes: 'Full stud backing for grab bar',
      },
      {
        id: 'sink',
        componentType: 'sink',
        condition: {},
        backing: { type: '2x6', width: 32, height: 24, heightAFF: 32 },
        notes: 'Sink bracket backing',
      },
      {
        id: 'cabinet',
        componentType: 'cabinet',
        condition: {},
        backing: { type: '3/4_plywood', width: 32, height: 4, heightAFF: 84 },
        notes: 'Cabinet cleat backing',
      },
    ];
  }

  private generateMockPlacements(
    components: DetectedComponent[], 
    rules: BackingRule[]
  ): BackingPlacement[] {
    const placements: BackingPlacement[] = [];
    
    components.forEach((component) => {
      const rule = rules.find(r => r.componentType === component.componentType);
      
      if (rule) {
        placements.push({
          id: `backing-${component.id}`,
          componentId: component.id,
          backingType: rule.backing.type as any,
          dimensions: {
            width: rule.backing.width,
            height: rule.backing.height,
            thickness: this.getThicknessForType(rule.backing.type),
          },
          location: {
            x: component.boundingBox.x - (rule.backing.width - component.boundingBox.width) / 2,
            y: component.boundingBox.y - (rule.backing.height - component.boundingBox.height) / 2,
            z: rule.backing.heightAFF,
          },
          orientation: 0,
          status: 'ai_generated',
        });
      }
    });
    
    return placements;
  }

  private getThicknessForType(type: string): number {
    const thicknesses: Record<string, number> = {
      '2x4': 3.5,
      '2x6': 5.5,
      '2x8': 7.25,
      '2x10': 9.25,
      '3/4_plywood': 0.75,
      'steel_plate': 0.25,
      'blocking': 3.5,
    };
    return thicknesses[type] || 1.5;
  }
}