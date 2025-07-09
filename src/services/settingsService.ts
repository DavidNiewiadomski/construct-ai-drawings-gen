import { BackingStandard, AppSettings, AISettings, TitleBlockConfig } from '@/types';

class SettingsService {
  private readonly STORAGE_KEYS = {
    standards: 'backing-standards',
    settings: 'app-settings',
    aiSettings: 'ai-settings',
    templates: 'title-block-templates',
  };

  // Standards Management
  async getStandards(): Promise<BackingStandard[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.standards);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default standards if none exist
      const defaults = this.getDefaultStandards();
      await this.saveStandards(defaults);
      return defaults;
    } catch (error) {
      console.error('Failed to get standards:', error);
      return this.getDefaultStandards();
    }
  }

  async saveStandard(standard: BackingStandard): Promise<void> {
    try {
      const standards = await this.getStandards();
      const existingIndex = standards.findIndex(s => s.id === standard.id);
      
      if (existingIndex >= 0) {
        standards[existingIndex] = standard;
      } else {
        standards.push(standard);
      }
      
      await this.saveStandards(standards);
    } catch (error) {
      console.error('Failed to save standard:', error);
      throw error;
    }
  }

  async deleteStandard(id: string): Promise<void> {
    try {
      const standards = await this.getStandards();
      const filtered = standards.filter(s => s.id !== id);
      await this.saveStandards(filtered);
    } catch (error) {
      console.error('Failed to delete standard:', error);
      throw error;
    }
  }

  async importStandards(file: File): Promise<BackingStandard[]> {
    try {
      const text = await file.text();
      let importedStandards: BackingStandard[];

      if (file.type === 'application/json') {
        importedStandards = JSON.parse(text);
      } else if (file.type === 'text/csv') {
        importedStandards = this.parseCSVStandards(text);
      } else {
        throw new Error('Unsupported file format');
      }

      // Validate and merge with existing standards
      const currentStandards = await this.getStandards();
      const mergedStandards = [...currentStandards, ...importedStandards];
      await this.saveStandards(mergedStandards);
      
      return importedStandards;
    } catch (error) {
      console.error('Failed to import standards:', error);
      throw error;
    }
  }

  async exportStandards(): Promise<Blob> {
    try {
      const standards = await this.getStandards();
      const data = JSON.stringify(standards, null, 2);
      return new Blob([data], { type: 'application/json' });
    } catch (error) {
      console.error('Failed to export standards:', error);
      throw error;
    }
  }

  async exportStandardsCSV(): Promise<Blob> {
    try {
      const standards = await this.getStandards();
      const csv = this.convertToCSV(standards);
      return new Blob([csv], { type: 'text/csv' });
    } catch (error) {
      console.error('Failed to export standards as CSV:', error);
      throw error;
    }
  }

  // App Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.settings);
      if (stored) {
        return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
      }
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Failed to get settings:', error);
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.STORAGE_KEYS.settings, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  // AI Settings
  async getAISettings(): Promise<AISettings> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.aiSettings);
      if (stored) {
        return { ...this.getDefaultAISettings(), ...JSON.parse(stored) };
      }
      return this.getDefaultAISettings();
    } catch (error) {
      console.error('Failed to get AI settings:', error);
      return this.getDefaultAISettings();
    }
  }

  async updateAISettings(settings: Partial<AISettings>): Promise<void> {
    try {
      const currentSettings = await this.getAISettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.STORAGE_KEYS.aiSettings, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to update AI settings:', error);
      throw error;
    }
  }

  // Templates
  async getTemplates(): Promise<TitleBlockConfig[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.templates);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getDefaultTemplates();
    } catch (error) {
      console.error('Failed to get templates:', error);
      return this.getDefaultTemplates();
    }
  }

  async saveTemplate(template: TitleBlockConfig): Promise<void> {
    try {
      const templates = await this.getTemplates();
      const existingIndex = templates.findIndex(t => t.template === template.template);
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.templates, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error;
    }
  }

  async deleteTemplate(templateName: string): Promise<void> {
    try {
      const templates = await this.getTemplates();
      const filtered = templates.filter(t => t.template !== templateName);
      localStorage.setItem(this.STORAGE_KEYS.templates, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  // Private helper methods
  private async saveStandards(standards: BackingStandard[]): Promise<void> {
    localStorage.setItem(this.STORAGE_KEYS.standards, JSON.stringify(standards));
  }

  private getDefaultStandards(): BackingStandard[] {
    return [
      {
        id: '1',
        componentType: 'tv',
        conditions: { weightMin: 20, weightMax: 100 },
        backing: {
          material: '2x8',
          thickness: '1.5"',
          width: 32,
          height: 16,
          fasteners: '3" wood screws',
          spacing: 16,
        },
        heightAFF: 60,
        notes: 'Standard TV mounting height for viewing comfort',
        images: [],
        category: 'Electronics',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System',
      },
      {
        id: '2',
        componentType: 'grab_bar',
        conditions: { weightMin: 0, weightMax: 20 },
        backing: {
          material: '2x6',
          thickness: '1.5"',
          width: 42,
          height: 6,
          fasteners: '2.5" wood screws',
          spacing: 16,
        },
        heightAFF: 34,
        notes: 'ADA compliant grab bar mounting height',
        images: [],
        category: 'Accessibility',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System',
      },
      {
        id: '3',
        componentType: 'equipment',
        conditions: { weightMin: 50, weightMax: 200 },
        backing: {
          material: '3/4_plywood',
          thickness: '0.75"',
          width: 24,
          height: 24,
          fasteners: '2.5" wood screws',
          spacing: 12,
        },
        heightAFF: 48,
        notes: 'Heavy equipment requires plywood distribution',
        images: [],
        category: 'Mechanical',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System',
      },
    ];
  }

  private getDefaultSettings(): AppSettings {
    return {
      defaultStandards: 'commercial',
      units: 'imperial',
      gridSize: 12,
      snapTolerance: 2,
      autoSave: true,
      theme: 'light',
    };
  }

  private getDefaultAISettings(): AISettings {
    return {
      confidenceThresholds: {
        tv: 0.8,
        grab_bar: 0.85,
        sink: 0.75,
        equipment: 0.7,
        cabinet: 0.8,
        other: 0.6,
      },
      enabledComponentTypes: ['tv', 'grab_bar', 'sink', 'equipment', 'cabinet'],
      autoProcess: true,
      batchSize: 10,
      qualityVsSpeed: 0.7,
      ocrLanguage: 'en',
      enhancementFilters: true,
    };
  }

  private getDefaultTemplates(): TitleBlockConfig[] {
    return [
      {
        template: 'Commercial Standard',
        fields: {
          projectName: '',
          drawingTitle: 'Backing Plan',
          drawingNumber: '',
          date: new Date().toLocaleDateString(),
          drawnBy: '',
          checkedBy: '',
          scale: '1/4" = 1\'',
          revision: 'A',
        },
        position: 'bottom',
      },
      {
        template: 'Residential Standard',
        fields: {
          projectName: '',
          drawingTitle: 'Backing Plan',
          drawingNumber: '',
          date: new Date().toLocaleDateString(),
          drawnBy: '',
          scale: '1/4" = 1\'',
        },
        position: 'right',
      },
    ];
  }

  private parseCSVStandards(csvText: string): BackingStandard[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const standards: BackingStandard[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length) {
        const standard: BackingStandard = {
          id: Date.now().toString() + i,
          componentType: values[0] || '',
          conditions: {
            weightMin: parseFloat(values[1]) || undefined,
            weightMax: parseFloat(values[2]) || undefined,
          },
          backing: {
            material: values[3] || '',
            thickness: values[4] || '',
            width: parseFloat(values[5]) || 0,
            height: parseFloat(values[6]) || 0,
            fasteners: values[7] || '',
            spacing: parseFloat(values[8]) || 0,
          },
          heightAFF: parseFloat(values[9]) || 0,
          notes: values[10] || '',
          images: [],
          category: values[11] || 'General',
          updatedAt: new Date().toISOString(),
          updatedBy: 'Import',
        };
        standards.push(standard);
      }
    }

    return standards;
  }

  private convertToCSV(standards: BackingStandard[]): string {
    const headers = [
      'Component Type', 'Weight Min', 'Weight Max', 'Backing Material',
      'Thickness', 'Width', 'Height', 'Fasteners', 'Spacing',
      'Height AFF', 'Notes', 'Category'
    ];

    const rows = standards.map(s => [
      s.componentType,
      s.conditions.weightMin || '',
      s.conditions.weightMax || '',
      s.backing.material,
      s.backing.thickness,
      s.backing.width,
      s.backing.height,
      s.backing.fasteners,
      s.backing.spacing,
      s.heightAFF,
      s.notes,
      s.category,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const settingsService = new SettingsService();