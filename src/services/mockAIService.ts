import { AIDetectedComponent, AIBackingRule, AIBackingPlacement } from '@/types';

export class MockAIService {
  /**
   * Simulate AI processing of uploaded files
   */
  static async simulateProcessing(
    files: string[],
    onProgress: (stage: string, progress: number, message?: string) => void
  ): Promise<AIDetectedComponent[]> {
    const stages = [
      { name: 'Preparing Files', duration: 2000, messages: ['Loading files...', 'Validating formats...', 'Optimizing for processing...'] },
      { name: 'Extracting Text (OCR)', duration: 3000, messages: ['Scanning drawings...', 'Processing annotations...', 'Extracting labels...'] },
      { name: 'Detecting Components', duration: 4000, messages: ['Analyzing layouts...', 'Identifying components...', 'Classifying types...'] },
      { name: 'Analyzing Specifications', duration: 3000, messages: ['Cross-referencing specs...', 'Calculating requirements...', 'Validating data...'] },
      { name: 'Finalizing Results', duration: 2000, messages: ['Generating results...', 'Optimizing placements...', 'Preparing output...'] }
    ];

    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    let elapsed = 0;

    for (const stage of stages) {
      const startTime = Date.now();
      
      while (Date.now() - startTime < stage.duration) {
        const stageProgress = (Date.now() - startTime) / stage.duration;
        const overallProgress = ((elapsed + (Date.now() - startTime)) / totalDuration) * 100;
        
        const randomMessage = stage.messages[Math.floor(Math.random() * stage.messages.length)];
        onProgress(stage.name, Math.min(overallProgress, 100), randomMessage);
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      elapsed += stage.duration;
    }

    // Generate mock detected components
    return this.generateMockComponents(files.length);
  }

  /**
   * Generate mock backing placements based on components and rules
   */
  static async generatePlacements(
    components: AIDetectedComponent[],
    rules: AIBackingRule[],
    onProgress?: (progress: number, message?: string) => void
  ): Promise<AIBackingPlacement[]> {
    const confirmedComponents = components.filter(c => c.confirmed && c.needsBacking);
    const placements: AIBackingPlacement[] = [];
    
    for (let i = 0; i < confirmedComponents.length; i++) {
      const component = confirmedComponents[i];
      
      // Find applicable rule
      const applicableRule = rules.find(rule => 
        rule.componentTypes.includes(component.type)
      ) || rules[0]; // Fallback to first rule
      
      if (applicableRule) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const placement: AIBackingPlacement = {
          id: `placement-${component.id}-${Date.now()}`,
          componentId: component.id,
          ruleId: applicableRule.id,
          position: {
            x: component.position.x - applicableRule.margin,
            y: component.position.y - applicableRule.margin
          },
          size: {
            width: applicableRule.minSize.width + Math.random() * (applicableRule.maxSize.width - applicableRule.minSize.width),
            height: applicableRule.minSize.height + Math.random() * (applicableRule.maxSize.height - applicableRule.minSize.height)
          },
          material: applicableRule.material,
          thickness: applicableRule.thickness,
          notes: `Auto-generated backing for ${component.type}`,
          drawingId: component.drawingId || 'drawing-1'
        };
        
        placements.push(placement);
        
        // Report progress
        if (onProgress) {
          const progress = ((i + 1) / confirmedComponents.length) * 100;
          onProgress(progress, `Generated backing for ${component.type}`);
        }
      }
    }
    
    return placements;
  }

  /**
   * Generate mock detected components
   */
  private static generateMockComponents(fileCount: number): AIDetectedComponent[] {
    const componentTypes = [
      'tv_mount', 'fire_extinguisher', 'sink', 'light_fixture', 
      'hvac_vent', 'exhaust_fan', 'thermostat', 'smoke_detector',
      'projector', 'cabinet', 'outlet', 'water_heater'
    ];
    
    const locations = [
      'Conference Room A', 'Office 101', 'Lobby', 'Kitchen', 'Storage Room',
      'Corridor', 'Break Room', 'Meeting Room B', 'Reception', 'Utility Room'
    ];
    
    const components: AIDetectedComponent[] = [];
    const componentsPerFile = Math.floor(Math.random() * 8) + 5; // 5-12 components per file
    
    for (let fileIndex = 0; fileIndex < fileCount; fileIndex++) {
      for (let i = 0; i < componentsPerFile; i++) {
        const componentType = componentTypes[Math.floor(Math.random() * componentTypes.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const confidence = 0.6 + Math.random() * 0.4; // 60-100% confidence
        
        const position = {
          x: Math.random() * 1000,
          y: Math.random() * 800
        };
        
        const component: AIDetectedComponent = {
          id: `comp-${fileIndex}-${i}-${Date.now()}`,
          type: componentType,
          confidence,
          position,
          bounds: {
            x: position.x - 10,
            y: position.y - 10,
            width: 20 + Math.random() * 40,
            height: 20 + Math.random() * 40
          },
          drawingId: `file-${fileIndex + 1}`,
          confirmed: confidence > 0.8, // Auto-confirm high confidence
          needsBacking: this.componentNeedsBacking(componentType),
          text: this.generateComponentText(componentType),
          location,
          pageNumber: Math.floor(Math.random() * 3) + 1,
          boundingBox: {
            x: position.x - 10,
            y: position.y - 10,
            width: 20 + Math.random() * 40,
            height: 20 + Math.random() * 40
          },
          properties: this.generateComponentProperties(componentType)
        };
        
        components.push(component);
      }
    }
    
    return components;
  }

  /**
   * Determine if a component type needs backing
   */
  private static componentNeedsBacking(type: string): boolean {
    const backingRequired = [
      'tv_mount', 'fire_extinguisher', 'cabinet', 'projector', 
      'water_heater', 'exhaust_fan', 'light_fixture'
    ];
    return backingRequired.includes(type);
  }

  /**
   * Generate realistic component text labels
   */
  private static generateComponentText(type: string): string {
    const textMap: Record<string, string[]> = {
      tv_mount: ['55" TV', '65" TV', '75" TV', 'DISPLAY', 'MONITOR'],
      fire_extinguisher: ['FE', 'FIRE EXT', '5LB ABC', '10LB ABC'],
      sink: ['SINK', 'KITCHEN SINK', 'UTILITY SINK', 'HAND SINK'],
      light_fixture: ['LED PANEL', 'RECESSED', 'PENDANT', 'TRACK LIGHT'],
      hvac_vent: ['SUPPLY', 'RETURN', '24x12', '20x8'],
      exhaust_fan: ['EF', 'EXHAUST', '110CFM', '80CFM'],
      thermostat: ['TSTAT', 'THERMOSTAT', 'T'],
      smoke_detector: ['SD', 'SMOKE DET', 'DETECTOR'],
      projector: ['PROJ', 'PROJECTOR', '3500 LUM'],
      cabinet: ['WALL CAB', 'CABINET', 'STORAGE'],
      outlet: ['OUTLET', 'RECEP', 'GFCI'],
      water_heater: ['WH', 'WATER HEATER', '50 GAL']
    };
    
    const options = textMap[type] || [type.toUpperCase()];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate component-specific properties
   */
  private static generateComponentProperties(type: string): Record<string, any> {
    const propertyMap: Record<string, () => Record<string, any>> = {
      tv_mount: () => ({
        size: ['32"', '43"', '55"', '65"', '75"'][Math.floor(Math.random() * 5)],
        weight: `${15 + Math.floor(Math.random() * 50)} lbs`,
        mounting: 'Wall'
      }),
      fire_extinguisher: () => ({
        type: ['5lb ABC', '10lb ABC', '20lb ABC'][Math.floor(Math.random() * 3)],
        height: ['15"', '18"', '24"'][Math.floor(Math.random() * 3)],
        mounting: 'Wall'
      }),
      sink: () => ({
        material: ['Stainless Steel', 'Porcelain', 'Composite'][Math.floor(Math.random() * 3)],
        bowls: ['Single', 'Double'][Math.floor(Math.random() * 2)],
        size: ['24x18', '30x20', '33x22'][Math.floor(Math.random() * 3)]
      }),
      light_fixture: () => ({
        type: ['LED Panel', 'Recessed', 'Pendant'][Math.floor(Math.random() * 3)],
        wattage: [20, 30, 40, 50][Math.floor(Math.random() * 4)] + 'W',
        mounting: 'Ceiling'
      }),
      outlet: () => ({
        type: ['Standard', 'GFCI', 'USB'][Math.floor(Math.random() * 3)],
        voltage: ['120V', '240V'][Math.floor(Math.random() * 2)],
        amperage: [15, 20, 30][Math.floor(Math.random() * 3)] + 'A'
      })
    };
    
    const generator = propertyMap[type];
    return generator ? generator() : {};
  }

  /**
   * Simulate analyzing specifications from uploaded documents
   */
  static async analyzeSpecifications(
    fileContent: string,
    onProgress?: (progress: number, message?: string) => void
  ): Promise<{ requirements: string[]; backingRules: AIBackingRule[] }> {
    const stages = [
      'Parsing document structure...',
      'Extracting specification text...',
      'Identifying component requirements...',
      'Generating backing rules...',
      'Validating requirements...'
    ];
    
    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (onProgress) {
        onProgress(((i + 1) / stages.length) * 100, stages[i]);
      }
    }
    
    return {
      requirements: [
        'TV mounts require 2x6 backing for units under 50lbs',
        'Fire extinguishers need 3/4" plywood backing 16"x16"',
        'Heavy equipment requires 2x8 backing minimum',
        'All wall-mounted components need proper backing'
      ],
      backingRules: []
    };
  }

  /**
   * Validate component detection accuracy
   */
  static async validateDetection(
    component: AIDetectedComponent,
    userFeedback: 'correct' | 'incorrect' | 'partial'
  ): Promise<{ updatedConfidence: number; suggestions: string[] }> {
    // Simulate validation processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let updatedConfidence = component.confidence;
    const suggestions: string[] = [];
    
    switch (userFeedback) {
      case 'correct':
        updatedConfidence = Math.min(1.0, component.confidence + 0.1);
        suggestions.push('Detection accuracy improved for similar components');
        break;
      case 'incorrect':
        updatedConfidence = Math.max(0.1, component.confidence - 0.2);
        suggestions.push('Review similar detections for potential errors');
        break;
      case 'partial':
        updatedConfidence = component.confidence * 0.9;
        suggestions.push('Consider manual review of boundary detection');
        break;
    }
    
    return { updatedConfidence, suggestions };
  }
}