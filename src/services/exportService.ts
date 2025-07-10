import { ExportSettings } from '@/components/export/ExportWizard';

interface BackingData {
  id: string;
  backingType: string;
  dimensions: {
    width: number;
    height: number;
    thickness: number;
  };
  location: {
    x: number;
    y: number;
    z: number;
  };
  orientation: number;
  status: 'ai_generated' | 'user_modified' | 'approved';
}

export class ExportService {
  /**
   * Export backings data based on the selected format
   */
  static async exportDrawing(
    settings: ExportSettings,
    backings: BackingData[],
    drawingImageData?: string
  ): Promise<void> {
    try {
      switch (settings.format.id) {
        case 'pdf':
          await this.exportToPDF(settings, backings, drawingImageData);
          break;
        case 'dwg':
          await this.exportToDWG(settings, backings);
          break;
        case 'csv':
          await this.exportToCSV(settings, backings);
          break;
        default:
          throw new Error(`Unsupported export format: ${settings.format.id}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Export to PDF with professional title block
   */
  private static async exportToPDF(
    settings: ExportSettings,
    backings: BackingData[],
    drawingImageData?: string
  ): Promise<void> {
    // Dynamic import to reduce bundle size
    const { jsPDF } = await import('jspdf');
    
    const { pageSize, orientation, titleBlock } = settings;
    const isLandscape = orientation === 'landscape';
    
    // Convert inches to points (1 inch = 72 points)
    const pageWidth = isLandscape ? pageSize.height * 72 : pageSize.width * 72;
    const pageHeight = isLandscape ? pageSize.width * 72 : pageSize.height * 72;
    
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [pageWidth, pageHeight]
    });

    // Title block height (1 inch = 72 points)
    const titleBlockHeight = 72;
    const drawingArea = {
      x: 36, // 0.5 inch margin
      y: 36,
      width: pageWidth - 72,
      height: pageHeight - titleBlockHeight - 72
    };

    // Draw title block
    this.drawTitleBlock(pdf, titleBlock, pageWidth, pageHeight, titleBlockHeight);

    // Draw drawing content
    if (settings.includeBackings && backings.length > 0) {
      this.drawBackings(pdf, backings, drawingArea, settings);
    }

    // Add background drawing if available
    if (drawingImageData) {
      try {
        pdf.addImage(
          drawingImageData,
          'PNG',
          drawingArea.x,
          drawingArea.y,
          drawingArea.width,
          drawingArea.height
        );
      } catch (error) {
        console.warn('Failed to add background drawing:', error);
      }
    }

    // Add grid if requested
    if (settings.includeGrid) {
      this.drawGrid(pdf, drawingArea, 24); // 24 inch grid
    }

    // Generate filename
    const filename = this.generateFilename(settings.format.id, titleBlock?.drawingNumber);
    
    // Download the PDF
    pdf.save(filename);
  }

  /**
   * Draw professional title block
   */
  private static drawTitleBlock(
    pdf: any,
    titleBlock: any,
    pageWidth: number,
    pageHeight: number,
    titleBlockHeight: number
  ): void {
    const startY = pageHeight - titleBlockHeight;
    
    // Title block border
    pdf.setLineWidth(2);
    pdf.rect(36, startY, pageWidth - 72, titleBlockHeight);
    
    // Internal divisions
    pdf.setLineWidth(1);
    
    // Vertical divisions
    const col1Width = (pageWidth - 72) * 0.3;
    const col2Width = (pageWidth - 72) * 0.4;
    const col3Width = (pageWidth - 72) * 0.3;
    
    pdf.line(36 + col1Width, startY, 36 + col1Width, pageHeight - 36);
    pdf.line(36 + col1Width + col2Width, startY, 36 + col1Width + col2Width, pageHeight - 36);
    
    // Horizontal division
    const midY = startY + titleBlockHeight / 2;
    pdf.line(36, midY, pageWidth - 36, midY);
    
    // Text content
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // Company info (top left)
    if (titleBlock?.company) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(titleBlock.company, 42, startY + 15);
    }
    
    // Project info (top left, below company)
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    if (titleBlock?.projectName) {
      pdf.text(`Project: ${titleBlock.projectName}`, 42, startY + 28);
    }
    if (titleBlock?.projectNumber) {
      pdf.text(`No: ${titleBlock.projectNumber}`, 42, startY + 40);
    }
    
    // Drawing title (center)
    if (titleBlock?.drawingTitle) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const centerX = 36 + col1Width + col2Width / 2;
      pdf.text(titleBlock.drawingTitle, centerX, startY + 20, { align: 'center' });
    }
    
    // Scale (center)
    if (titleBlock?.scale) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const centerX = 36 + col1Width + col2Width / 2;
      pdf.text(`Scale: ${titleBlock.scale}`, centerX, startY + 35, { align: 'center' });
    }
    
    // Drawing info (top right)
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const rightX = pageWidth - 42;
    
    if (titleBlock?.drawingNumber) {
      pdf.text(`Drawing No: ${titleBlock.drawingNumber}`, rightX, startY + 15, { align: 'right' });
    }
    if (titleBlock?.revision) {
      pdf.text(`Rev: ${titleBlock.revision}`, rightX, startY + 27, { align: 'right' });
    }
    if (titleBlock?.sheetNumber && titleBlock?.totalSheets) {
      pdf.text(`Sheet ${titleBlock.sheetNumber} of ${titleBlock.totalSheets}`, rightX, startY + 39, { align: 'right' });
    }
    
    // Signature block (bottom row)
    const bottomY = midY + 10;
    if (titleBlock?.drawnBy) {
      pdf.text(`Drawn: ${titleBlock.drawnBy}`, 42, bottomY);
    }
    if (titleBlock?.checkedBy) {
      pdf.text(`Checked: ${titleBlock.checkedBy}`, 42, bottomY + 12);
    }
    if (titleBlock?.date) {
      pdf.text(`Date: ${titleBlock.date}`, rightX, bottomY, { align: 'right' });
    }
  }

  /**
   * Draw backings on the PDF
   */
  private static drawBackings(
    pdf: any,
    backings: BackingData[],
    drawingArea: any,
    settings: ExportSettings
  ): void {
    if (backings.length === 0) return;
    
    // Calculate scale and bounds
    const bounds = this.calculateBackingBounds(backings);
    const scale = this.calculateScale(bounds, drawingArea, settings.scale);
    
    // Center the drawing
    const offsetX = drawingArea.x + (drawingArea.width - bounds.width * scale) / 2;
    const offsetY = drawingArea.y + (drawingArea.height - bounds.height * scale) / 2;
    
    // Draw each backing
    backings.forEach(backing => {
      const x = offsetX + (backing.location.x - bounds.minX) * scale;
      const y = offsetY + (backing.location.y - bounds.minY) * scale;
      const width = backing.dimensions.width * scale;
      const height = backing.dimensions.height * scale;
      
      // Set color based on backing type and status
      const color = this.getBackingColor(backing, settings.colorMode);
      pdf.setFillColor(color.fill);
      pdf.setDrawColor(color.stroke);
      
      // Draw backing rectangle
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, width, height, 'FD');
      
      // Add label if space allows
      if (width > 30 && height > 20) {
        pdf.setFontSize(6);
        pdf.setTextColor(0);
        const labelX = x + width / 2;
        const labelY = y + height / 2;
        pdf.text(backing.backingType, labelX, labelY, { align: 'center' });
      }
    });
  }

  /**
   * Draw grid on the PDF
   */
  private static drawGrid(pdf: any, drawingArea: any, gridSize: number): void {
    pdf.setLineWidth(0.25);
    pdf.setDrawColor(200, 200, 200);
    
    // Vertical lines
    for (let x = drawingArea.x; x < drawingArea.x + drawingArea.width; x += gridSize) {
      pdf.line(x, drawingArea.y, x, drawingArea.y + drawingArea.height);
    }
    
    // Horizontal lines
    for (let y = drawingArea.y; y < drawingArea.y + drawingArea.height; y += gridSize) {
      pdf.line(drawingArea.x, y, drawingArea.x + drawingArea.width, y);
    }
  }

  /**
   * Export to DWG format (placeholder - would need AutoCAD library)
   */
  private static async exportToDWG(
    settings: ExportSettings,
    backings: BackingData[]
  ): Promise<void> {
    // For now, export as DXF text format
    let dxfContent = this.generateDXFContent(backings);
    
    const filename = this.generateFilename('dxf', settings.titleBlock?.drawingNumber);
    this.downloadTextFile(dxfContent, filename);
  }

  /**
   * Export to CSV format
   */
  private static async exportToCSV(
    settings: ExportSettings,
    backings: BackingData[]
  ): Promise<void> {
    const headers = [
      'ID',
      'Type',
      'Width (in)',
      'Height (in)', 
      'Thickness (in)',
      'X Location',
      'Y Location',
      'Height AFF (in)',
      'Orientation (deg)',
      'Status'
    ];
    
    const csvRows = [
      headers.join(','),
      ...backings.map(backing => [
        backing.id,
        backing.backingType,
        backing.dimensions.width,
        backing.dimensions.height,
        backing.dimensions.thickness,
        backing.location.x.toFixed(2),
        backing.location.y.toFixed(2),
        backing.location.z.toFixed(2),
        backing.orientation || 0,
        backing.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const filename = this.generateFilename('csv', settings.titleBlock?.drawingNumber);
    this.downloadTextFile(csvContent, filename);
  }

  /**
   * Helper methods
   */
  private static calculateBackingBounds(backings: BackingData[]) {
    if (backings.length === 0) return { minX: 0, minY: 0, width: 0, height: 0 };
    
    const bounds = backings.reduce((acc, backing) => ({
      minX: Math.min(acc.minX, backing.location.x),
      maxX: Math.max(acc.maxX, backing.location.x + backing.dimensions.width),
      minY: Math.min(acc.minY, backing.location.y),
      maxY: Math.max(acc.maxY, backing.location.y + backing.dimensions.height)
    }), {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity
    });
    
    return {
      ...bounds,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY
    };
  }

  private static calculateScale(bounds: any, drawingArea: any, scaleSettings: any): number {
    if (scaleSettings.id === 'fit') {
      const scaleX = drawingArea.width / bounds.width;
      const scaleY = drawingArea.height / bounds.height;
      return Math.min(scaleX, scaleY) * 0.9; // 90% to leave margin
    }
    
    return scaleSettings.ratio || 1;
  }

  private static getBackingColor(backing: BackingData, colorMode: string) {
    const colors = {
      '2x4': { fill: [138, 92, 246], stroke: [109, 40, 217] },
      '2x6': { fill: [59, 130, 246], stroke: [29, 78, 216] },
      '2x8': { fill: [16, 185, 129], stroke: [5, 150, 105] },
      '2x10': { fill: [245, 158, 11], stroke: [217, 119, 6] },
      '3/4_plywood': { fill: [239, 68, 68], stroke: [220, 38, 38] },
      'steel_plate': { fill: [107, 114, 128], stroke: [75, 85, 99] },
      'blocking': { fill: [249, 115, 22], stroke: [234, 88, 12] }
    };
    
    const defaultColor = { fill: [156, 163, 175], stroke: [107, 114, 128] };
    const backingColor = colors[backing.backingType as keyof typeof colors] || defaultColor;
    
    if (colorMode === 'blackwhite') {
      return { fill: [255, 255, 255], stroke: [0, 0, 0] };
    } else if (colorMode === 'grayscale') {
      const gray = (backingColor.fill[0] + backingColor.fill[1] + backingColor.fill[2]) / 3;
      return { fill: [gray, gray, gray], stroke: [0, 0, 0] };
    }
    
    return backingColor;
  }

  private static generateDXFContent(backings: BackingData[]): string {
    // Simplified DXF generation
    let dxf = `0\nSECTION\n2\nENTITIES\n`;
    
    backings.forEach(backing => {
      dxf += `0\nRECT\n`;
      dxf += `10\n${backing.location.x}\n`;
      dxf += `20\n${backing.location.y}\n`;
      dxf += `11\n${backing.location.x + backing.dimensions.width}\n`;
      dxf += `21\n${backing.location.y + backing.dimensions.height}\n`;
    });
    
    dxf += `0\nENDSEC\n0\nEOF\n`;
    return dxf;
  }

  private static generateFilename(format: string, drawingNumber?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseName = drawingNumber ? `${drawingNumber}_backing_layout` : 'backing_layout';
    return `${baseName}_${timestamp}.${format}`;
  }

  private static downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}