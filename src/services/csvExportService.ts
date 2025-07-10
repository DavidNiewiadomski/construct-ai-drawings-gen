import type { BackingPlacement } from '@/types';

interface GroupedBacking {
  type: string;
  size: string;
  heightAFF: number;
  quantity: number;
  locations: string[];
  notes?: string;
  totalLength?: number;
  totalArea?: number;
}

export class CSVExportService {
  /**
   * Generate CSV content from backing placements
   */
  static generateCSV(backings: BackingPlacement[]): string {
    const headers = [
      'Type', 
      'Size', 
      'Height AFF (in)', 
      'Quantity', 
      'Total Length (in)', 
      'Total Area (sq in)',
      'Locations', 
      'Status',
      'Notes'
    ];
    
    // Group backings by type and size
    const grouped = this.groupBackings(backings);
    
    const rows = grouped.map(group => [
      group.type,
      group.size,
      group.heightAFF.toString(),
      group.quantity.toString(),
      group.totalLength?.toFixed(2) || '0',
      group.totalArea?.toFixed(2) || '0',
      group.locations.join('; '),
      this.getStatusSummary(group),
      group.notes || ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => this.escapeCsvField(cell)).join(','))
      .join('\n');
  }

  /**
   * Generate detailed CSV with individual backing entries
   */
  static generateDetailedCSV(backings: BackingPlacement[]): string {
    const headers = [
      'ID',
      'Component ID',
      'Type',
      'Width (in)',
      'Height (in)', 
      'Thickness (in)',
      'X Position',
      'Y Position',
      'Height AFF (in)',
      'Orientation (deg)',
      'Status',
      'Area (sq in)'
    ];

    const rows = backings.map(backing => [
      backing.id,
      backing.componentId,
      backing.backingType,
      backing.dimensions.width.toString(),
      backing.dimensions.height.toString(),
      backing.dimensions.thickness.toString(),
      backing.location.x.toFixed(2),
      backing.location.y.toFixed(2),
      backing.location.z.toString(),
      backing.orientation.toString(),
      backing.status,
      (backing.dimensions.width * backing.dimensions.height).toFixed(2)
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => this.escapeCsvField(cell)).join(','))
      .join('\n');
  }

  /**
   * Generate material takeoff CSV
   */
  static generateMaterialTakeoff(backings: BackingPlacement[]): string {
    const headers = [
      'Material Type',
      'Nominal Size',
      'Actual Dimensions',
      'Linear Feet',
      'Board Feet',
      'Pieces',
      'Waste Factor (10%)',
      'Total Linear Feet',
      'Total Board Feet',
      'Estimated Cost'
    ];

    const materialData = this.calculateMaterialTakeoff(backings);
    
    const rows = materialData.map(material => [
      material.type,
      material.nominalSize,
      material.actualDimensions,
      material.linearFeet.toFixed(2),
      material.boardFeet.toFixed(2),
      material.pieces.toString(),
      material.wasteFactor.toFixed(2),
      material.totalLinearFeet.toFixed(2),
      material.totalBoardFeet.toFixed(2),
      `$${material.estimatedCost.toFixed(2)}`
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => this.escapeCsvField(cell)).join(','))
      .join('\n');
  }

  /**
   * Download CSV file
   */
  static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Group backings by type and calculate totals
   */
  private static groupBackings(backings: BackingPlacement[]): GroupedBacking[] {
    const groups = new Map<string, GroupedBacking>();

    backings.forEach(backing => {
      const key = `${backing.backingType}-${backing.dimensions.width}x${backing.dimensions.height}x${backing.dimensions.thickness}-${backing.location.z}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          type: backing.backingType,
          size: `${backing.dimensions.width}" × ${backing.dimensions.height}" × ${backing.dimensions.thickness}"`,
          heightAFF: backing.location.z,
          quantity: 0,
          locations: [],
          totalLength: 0,
          totalArea: 0
        });
      }

      const group = groups.get(key)!;
      group.quantity++;
      group.locations.push(`(${backing.location.x.toFixed(1)}, ${backing.location.y.toFixed(1)})`);
      group.totalLength = (group.totalLength || 0) + backing.dimensions.width;
      group.totalArea = (group.totalArea || 0) + (backing.dimensions.width * backing.dimensions.height);
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.heightAFF - b.heightAFF;
    });
  }

  /**
   * Calculate material takeoff with waste factors and costs
   */
  private static calculateMaterialTakeoff(backings: BackingPlacement[]) {
    const materialGroups = new Map();
    
    // Material properties and costs (per linear foot)
    const materialProperties = {
      '2x4': { nominalSize: '2x4', actualSize: '1.5" × 3.5"', costPerLF: 0.85 },
      '2x6': { nominalSize: '2x6', actualSize: '1.5" × 5.5"', costPerLF: 1.25 },
      '2x8': { nominalSize: '2x8', actualSize: '1.5" × 7.25"', costPerLF: 1.65 },
      '2x10': { nominalSize: '2x10', actualSize: '1.5" × 9.25"', costPerLF: 2.15 },
      '3/4_plywood': { nominalSize: '3/4" PLY', actualSize: '0.75" × 48" × 96"', costPerLF: 2.50 },
      'steel_plate': { nominalSize: 'STEEL', actualSize: 'Various', costPerLF: 12.00 },
      'blocking': { nominalSize: 'BLOCKING', actualSize: 'Various', costPerLF: 1.00 }
    };

    backings.forEach(backing => {
      const key = backing.backingType;
      
      if (!materialGroups.has(key)) {
        const props = materialProperties[key as keyof typeof materialProperties] || materialProperties['2x4'];
        materialGroups.set(key, {
          type: backing.backingType,
          nominalSize: props.nominalSize,
          actualDimensions: props.actualSize,
          linearFeet: 0,
          boardFeet: 0,
          pieces: 0,
          costPerLF: props.costPerLF
        });
      }

      const group = materialGroups.get(key);
      group.pieces++;
      group.linearFeet += backing.dimensions.width / 12; // Convert inches to feet
      
      // Calculate board feet (only for lumber)
      if (['2x4', '2x6', '2x8', '2x10'].includes(backing.backingType)) {
        const thickness = backing.dimensions.thickness / 12;
        const width = backing.dimensions.height / 12;
        const length = backing.dimensions.width / 12;
        group.boardFeet += thickness * width * length;
      }
    });

    return Array.from(materialGroups.values()).map(material => ({
      ...material,
      wasteFactor: material.linearFeet * 0.1, // 10% waste
      totalLinearFeet: material.linearFeet * 1.1,
      totalBoardFeet: material.boardFeet * 1.1,
      estimatedCost: material.linearFeet * 1.1 * material.costPerLF
    }));
  }

  /**
   * Get status summary for grouped backings
   */
  private static getStatusSummary(group: GroupedBacking): string {
    // This would need to be enhanced to track individual backing statuses
    // For now, return a placeholder
    return 'Generated';
  }

  /**
   * Escape CSV fields that contain commas, quotes, or newlines
   */
  private static escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Generate backing summary report
   */
  static generateSummaryReport(backings: BackingPlacement[]): string {
    const summary = {
      totalBackings: backings.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalArea: 0,
      averageHeight: 0
    };

    backings.forEach(backing => {
      // Count by type
      summary.byType[backing.backingType] = (summary.byType[backing.backingType] || 0) + 1;
      
      // Count by status
      summary.byStatus[backing.status] = (summary.byStatus[backing.status] || 0) + 1;
      
      // Calculate totals
      summary.totalArea += backing.dimensions.width * backing.dimensions.height;
      summary.averageHeight += backing.location.z;
    });

    summary.averageHeight = summary.averageHeight / backings.length || 0;

    const lines = [
      'BACKING SUMMARY REPORT',
      '======================',
      '',
      `Total Backings: ${summary.totalBackings}`,
      `Total Area: ${summary.totalArea.toFixed(2)} sq in`,
      `Average Height AFF: ${summary.averageHeight.toFixed(2)} in`,
      '',
      'BY TYPE:',
      ...Object.entries(summary.byType).map(([type, count]) => `  ${type}: ${count}`),
      '',
      'BY STATUS:',
      ...Object.entries(summary.byStatus).map(([status, count]) => `  ${status}: ${count}`),
      '',
      `Generated: ${new Date().toLocaleString()}`
    ];

    return lines.join('\n');
  }
}