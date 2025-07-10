// Simple demo data generator for construction backing drawings

export class DemoDataGenerator {
  static generateCompleteDemo() {
    return {
      files: this.generateDemoFiles(),
      backings: this.generateBackingPlacements(), 
      statistics: this.generateStatistics(),
      project: this.generateProjectInfo()
    };
  }
  
  static generateDemoFiles() {
    return [
      {
        id: 'demo-file-1',
        name: 'Floor_Plan_Level_1.pdf',
        type: 'contract_drawing',
        size: 2847592,
        uploadedAt: '2024-01-15T09:30:00Z',
        status: 'completed',
        metadata: {
          pages: 1,
          dimensions: { width: 3600, height: 2400 }
        }
      },
      {
        id: 'demo-file-2',
        name: 'Samsung_75_Display_Submittal.pdf',
        type: 'submittal',
        size: 3456789,
        uploadedAt: '2024-01-15T10:15:00Z',
        status: 'completed',
        metadata: {
          pages: 8,
          manufacturer: 'Samsung',
          model: 'QM75R-B',
          weight: '68.3 lbs'
        }
      },
      {
        id: 'demo-file-3',
        name: 'LG_86_Interactive_Display_Submittal.pdf',
        type: 'submittal',
        size: 4123456,
        uploadedAt: '2024-01-15T10:30:00Z',
        status: 'completed',
        metadata: {
          pages: 12,
          manufacturer: 'LG',
          model: '86TR3DJ-B',
          weight: '132.3 lbs'
        }
      }
    ];
  }

  static generateBackingPlacements() {
    return [
      {
        id: 'backing-1',
        x: 450,
        y: 320,
        width: 160,
        height: 120,
        backingType: '3/4" Plywood',
        componentType: '75" Display',
        location: { z: 48 },
        status: 'ai_generated',
        confidence: 0.94
      },
      {
        id: 'backing-2',
        x: 1200,
        y: 520,
        width: 200,
        height: 150,
        backingType: '3/4" Plywood',
        componentType: '86" Interactive Display',
        location: { z: 42 },
        status: 'user_modified',
        confidence: 0.89
      },
      {
        id: 'backing-3',
        x: 180,
        y: 680,
        width: 100,
        height: 120,
        backingType: '2x8 Blocking',
        componentType: 'Electrical Panel',
        location: { z: 60 },
        status: 'ai_generated',
        confidence: 0.96
      }
    ];
  }

  static generateComments() {
    return [
      {
        id: 'comment-1',
        position: { x: 480, y: 360 },
        thread: [
          {
            id: 'msg-1',
            text: 'Verify 75" display mounting height with furniture layout',
            author: 'Sarah Johnson',
            timestamp: '2024-01-15T14:30:00Z'
          }
        ],
        status: 'open',
        createdBy: 'sarah-johnson',
        createdAt: '2024-01-15T14:30:00Z'
      },
      {
        id: 'comment-2', 
        position: { x: 1240, y: 565 },
        thread: [
          {
            id: 'msg-2',
            text: 'Interactive display is heavier - review backing requirements',
            author: 'Tom Wilson',
            timestamp: '2024-01-15T13:45:00Z'
          }
        ],
        status: 'open',
        createdBy: 'tom-wilson',
        createdAt: '2024-01-15T13:45:00Z'
      }
    ];
  }

  static generateProjectInfo() {
    return {
      id: 'demo-project-001',
      name: 'Corporate Headquarters Renovation - Level 1',
      client: 'Acme Corporation',
      description: 'Audio visual and electrical systems installation for conference rooms',
      teamMembers: [
        { name: 'Mike Davis', role: 'Project Manager' },
        { name: 'Sarah Johnson', role: 'AV Designer' },
        { name: 'Tom Wilson', role: 'Electrical Engineer' }
      ],
      createdAt: '2024-01-10T08:00:00Z'
    };
  }

  static generateStatistics() {
    return {
      totalBackings: 15,
      aiDetected: 12,
      userModified: 3,
      approved: 8,
      pending: 7,
      materialSavings: 23.5,
      timeSpeed: '85% faster than manual',
      accuracy: '94% AI accuracy'
    };
  }

  static generateMockProcessingSteps() {
    return [
      { stage: 'uploading', duration: 2000, message: 'Uploading file to server...' },
      { stage: 'parsing', duration: 3000, message: 'Extracting text and geometry...' },
      { stage: 'detecting', duration: 8000, message: 'Analyzing drawing for components...' },
      { stage: 'generating', duration: 5000, message: 'Generating backing placements...' },
      { stage: 'optimizing', duration: 3000, message: 'Optimizing for material efficiency...' },
      { stage: 'complete', duration: 1000, message: 'Processing complete!' }
    ];
  }

  static async simulateFileProcessing(
    fileId: string, 
    onProgress: (stage: string, progress: number, message: string) => void
  ): Promise<void> {
    const steps = this.generateMockProcessingSteps();
    let totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    for (const step of steps) {
      onProgress(step.stage, (elapsed / totalDuration) * 100, step.message);
      await new Promise(resolve => setTimeout(resolve, step.duration));
      elapsed += step.duration;
    }

    onProgress('complete', 100, 'Processing complete!');
  }

  static generateRealisticFileContent(fileType: string) {
    const content = {
      'contract_drawing': {
        layers: ['A-WALL', 'A-DOOR', 'E-LITE', 'E-POWR'],
        scale: '1/4" = 1\'-0"',
        titleBlock: 'Corporate Headquarters Renovation'
      },
      'submittal': {
        sections: ['Product Overview', 'Technical Specs', 'Installation'],
        certifications: ['UL Listed', 'FCC Compliant']
      },
      'specification': {
        format: 'CSI MasterFormat',
        sections: ['General', 'Products', 'Execution']
      }
    };

    return content[fileType as keyof typeof content] || {};
  }
}