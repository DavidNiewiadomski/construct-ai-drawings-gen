import type { BackingStandard } from '@/components/settings/BackingStandardsLibrary';

export interface ImportResult {
  success: boolean;
  standards: BackingStandard[];
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'csv' | 'json';
  includeImages: boolean;
  includeMetadata: boolean;
}

export class StandardsImportExport {
  /**
   * Export standards to CSV format
   */
  static async exportToCSV(standards: BackingStandard[]): Promise<string> {
    const headers = [
      'ID',
      'Category', 
      'Component Type',
      'Component Icon',
      'Weight Min (lbs)',
      'Weight Max (lbs)',
      'Size Min (in)',
      'Size Max (in)',
      'Custom Conditions',
      'Backing Material',
      'Backing Thickness',
      'Backing Width (in)',
      'Backing Height (in)',
      'Backing Orientation',
      'Height AFF (in)',
      'Height Reference',
      'Fasteners',
      'Fastener Spacing (in)',
      'Notes',
      'Tags',
      'Source',
      'Last Updated'
    ];
    
    const rows = standards.map(s => [
      s.id,
      s.category,
      s.componentType,
      s.componentIcon,
      s.conditions.weightMin || '',
      s.conditions.weightMax || '',
      s.conditions.sizeMin || '',
      s.conditions.sizeMax || '',
      s.conditions.custom || '',
      s.backing.material,
      s.backing.thickness,
      s.backing.width,
      s.backing.height,
      s.backing.orientation,
      s.mounting.heightAFF,
      s.mounting.heightReference,
      s.mounting.fasteners,
      s.mounting.spacing,
      s.notes,
      s.tags.join('; '),
      s.source,
      s.lastUpdated.toISOString()
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => this.escapeCsvCell(String(cell))))
      .join('\\n');
  }

  /**
   * Import standards from CSV file
   */
  static async importFromCSV(file: File): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      standards: [],
      errors: [],
      warnings: []
    };

    try {
      const text = await file.text();
      const lines = text.split('\\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        result.errors.push('File must contain at least a header row and one data row');
        return result;
      }

      const headers = this.parseCsvRow(lines[0]);
      const dataRows = lines.slice(1);

      // Validate headers
      const requiredFields = ['Category', 'Component Type', 'Backing Material', 'Height AFF (in)', 'Fasteners'];
      const missingFields = requiredFields.filter(field => 
        !headers.some(header => header.toLowerCase().includes(field.toLowerCase()))
      );

      if (missingFields.length > 0) {
        result.errors.push(`Missing required columns: ${missingFields.join(', ')}`);
        return result;
      }

      // Process each row
      for (let i = 0; i < dataRows.length; i++) {
        const rowNumber = i + 2; // +2 because we start from 1 and skip header
        const values = this.parseCsvRow(dataRows[i]);
        
        if (values.length !== headers.length) {
          result.warnings.push(`Row ${rowNumber}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
          continue;
        }

        try {
          const standard = this.createStandardFromCsvRow(headers, values);
          result.standards.push(standard);
        } catch (error) {
          result.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.standards.length > 0;
      if (result.success) {
        result.warnings.push(`Successfully imported ${result.standards.length} standards`);
      }

    } catch (error) {
      result.errors.push(`File parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Export standards to JSON format
   */
  static async exportToJSON(standards: BackingStandard[], options?: ExportOptions): Promise<string> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalStandards: standards.length,
        exportOptions: options
      },
      standards: options?.includeMetadata === false 
        ? standards.map(({ lastUpdated, source, ...rest }) => rest)
        : standards
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import standards from JSON file
   */
  static async importFromJSON(file: File): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      standards: [],
      errors: [],
      warnings: []
    };

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Handle different JSON formats
      let standardsArray: any[];
      
      if (Array.isArray(data)) {
        // Direct array of standards
        standardsArray = data;
      } else if (data.standards && Array.isArray(data.standards)) {
        // Wrapped format with metadata
        standardsArray = data.standards;
        if (data.metadata) {
          result.warnings.push(`Importing from export created on ${new Date(data.metadata.exportDate).toLocaleDateString()}`);
        }
      } else {
        result.errors.push('Invalid JSON format. Expected array of standards or object with standards array.');
        return result;
      }

      // Validate and convert each standard
      for (let i = 0; i < standardsArray.length; i++) {
        try {
          const standard = this.validateAndNormalizeStandard(standardsArray[i], i);
          result.standards.push(standard);
        } catch (error) {
          result.errors.push(`Standard ${i + 1}: ${error instanceof Error ? error.message : 'Validation failed'}`);
        }
      }

      result.success = result.standards.length > 0;
      if (result.success) {
        result.warnings.push(`Successfully imported ${result.standards.length} standards`);
      }

    } catch (error) {
      if (error instanceof SyntaxError) {
        result.errors.push('Invalid JSON file format');
      } else {
        result.errors.push(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  }

  /**
   * Export standards to file and trigger download
   */
  static async downloadStandards(standards: BackingStandard[], format: 'csv' | 'json', filename?: string): Promise<void> {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
      content = await this.exportToCSV(standards);
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = await this.exportToJSON(standards);
      mimeType = 'application/json';
      extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename || `backing-standards-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get import statistics
   */
  static getImportStats(result: ImportResult): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  } {
    const successful = result.standards.length;
    const failed = result.errors.length;
    const total = successful + failed;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0
    };
  }

  /**
   * Validate file format and size
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    const allowedExtensions = ['.csv', '.json', '.txt'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      return { valid: false, error: 'File must be CSV or JSON format' };
    }

    return { valid: true };
  }

  // Private helper methods

  private static escapeCsvCell(value: string): string {
    if (value.includes(',') || value.includes('\"') || value.includes('\\n')) {
      return `\"${value.replace(/\"/g, '\"\"')}\"`;
    }
    return value;
  }

  private static parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < row.length) {
      const char = row[i];
      
      if (char === '\"') {
        if (inQuotes && row[i + 1] === '\"') {
          current += '\"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private static createStandardFromCsvRow(headers: string[], values: string[]): BackingStandard {
    const getValue = (fieldName: string): string => {
      const index = headers.findIndex(h => h.toLowerCase().includes(fieldName.toLowerCase()));
      return index >= 0 ? values[index] : '';
    };

    const getNumericValue = (fieldName: string): number | undefined => {
      const value = getValue(fieldName);
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    // Validate required fields
    const category = getValue('category');
    const componentType = getValue('component type');
    const backingMaterial = getValue('backing material');
    const heightAFF = getNumericValue('height aff');
    const fasteners = getValue('fasteners');

    if (!category || !componentType || !backingMaterial || heightAFF === undefined || !fasteners) {
      throw new Error('Missing required fields: category, component type, backing material, height AFF, or fasteners');
    }

    // Validate category
    const validCategories = ['Plumbing', 'Electrical', 'HVAC', 'Fire Safety', 'Accessibility', 'AV', 'Custom'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}. Must be one of: ${validCategories.join(', ')}`);
    }

    return {
      id: getValue('id') || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: category as BackingStandard['category'],
      componentType,
      componentIcon: getValue('component icon') || '🔧',
      conditions: {
        weightMin: getNumericValue('weight min'),
        weightMax: getNumericValue('weight max'),
        sizeMin: getNumericValue('size min'),
        sizeMax: getNumericValue('size max'),
        custom: getValue('custom conditions') || undefined
      },
      backing: {
        material: backingMaterial,
        thickness: getValue('backing thickness') || '1.5\"',
        width: getNumericValue('backing width') || 16,
        height: getNumericValue('backing height') || 16,
        orientation: (getValue('backing orientation') as 'horizontal' | 'vertical') || 'horizontal'
      },
      mounting: {
        heightAFF,
        heightReference: (getValue('height reference') as 'center' | 'top' | 'bottom') || 'center',
        fasteners,
        spacing: getNumericValue('fastener spacing') || 16
      },
      notes: getValue('notes') || '',
      images: [],
      tags: getValue('tags') ? getValue('tags').split(';').map(t => t.trim()).filter(Boolean) : [],
      lastUpdated: new Date(),
      source: 'imported' as const
    };
  }

  private static validateAndNormalizeStandard(data: any, index: number): BackingStandard {
    const required = ['category', 'componentType', 'backing', 'mounting'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate category
    const validCategories = ['Plumbing', 'Electrical', 'HVAC', 'Fire Safety', 'Accessibility', 'AV', 'Custom'];
    if (!validCategories.includes(data.category)) {
      throw new Error(`Invalid category: ${data.category}`);
    }

    return {
      id: data.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: data.category,
      componentType: data.componentType,
      componentIcon: data.componentIcon || '🔧',
      conditions: {
        weightMin: data.conditions?.weightMin,
        weightMax: data.conditions?.weightMax,
        sizeMin: data.conditions?.sizeMin,
        sizeMax: data.conditions?.sizeMax,
        custom: data.conditions?.custom
      },
      backing: {
        material: data.backing.material,
        thickness: data.backing.thickness || '1.5\"',
        width: data.backing.width || 16,
        height: data.backing.height || 16,
        orientation: data.backing.orientation || 'horizontal'
      },
      mounting: {
        heightAFF: data.mounting.heightAFF,
        heightReference: data.mounting.heightReference || 'center',
        fasteners: data.mounting.fasteners,
        spacing: data.mounting.spacing || 16
      },
      notes: data.notes || '',
      images: data.images || [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
      source: data.source || 'imported'
    };
  }
}