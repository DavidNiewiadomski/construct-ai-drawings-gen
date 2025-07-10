import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportConfig {
  orientation: 'portrait' | 'landscape';
  pageSize: {
    width: number;
    height: number;
  };
  scale: number;
  includeOriginal: boolean;
  includeDimensions: boolean;
  includeSchedule: boolean;
  drawingImage?: string;
  titleBlock: {
    logoUrl?: string;
    fields: Array<{
      id: string;
      label: string;
      value: string;
      x: number;
      y: number;
    }>;
  };
  backings: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    heightAFF: number;
    status: 'ai_generated' | 'user_modified' | 'approved';
  }>;
  dimensions?: Array<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    value: number;
    label: string;
  }>;
  materialSchedule?: Array<{
    type: string;
    count: number;
    totalLength?: number;
    totalArea?: number;
  }>;
  professionalElements?: {
    northArrow?: {
      enabled: boolean;
      position: { x: number; y: number };
      rotation: number;
      scale: number;
    };
    scaleBar?: {
      enabled: boolean;
      position: { x: number; y: number };
      scale: number;
      units: 'imperial' | 'metric';
    };
    legend?: {
      enabled: boolean;
      position: { x: number; y: number };
      backingTypes: Array<{
        type: string;
        color: string;
        description: string;
        count?: number;
      }>;
    };
    generalNotes?: {
      enabled: boolean;
      position: { x: number; y: number };
      notes: string[];
      title?: string;
    };
    revisionTable?: {
      enabled: boolean;
      position: { x: number; y: number };
      revisions: Array<{
        number: string;
        date: string;
        description: string;
        by: string;
      }>;
    };
  };
}

export class PDFExportService {
  /**
   * Generate professional PDF with title block and backing annotations
   */
  static async generatePDF(config: ExportConfig): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'in',
      format: [config.pageSize.width, config.pageSize.height]
    });

    // Set document properties
    pdf.setProperties({
      title: 'Backing Layout Drawing',
      subject: 'Professional Construction Drawing',
      author: 'Backing Layout System',
      creator: 'PDF Export Service'
    });

    // Add border with tick marks
    this.drawBorder(pdf, config);
    
    // Add title block
    this.drawTitleBlock(pdf, config);
    
    // Add drawing content
    await this.drawContent(pdf, config);
    
    // Add backing annotations
    this.drawBackings(pdf, config);
    
    // Add dimensions if enabled
    if (config.includeDimensions && config.dimensions) {
      this.drawDimensions(pdf, config);
    }
    
    // Add material schedule if enabled
    if (config.includeSchedule && config.materialSchedule) {
      this.drawMaterialSchedule(pdf, config);
    }

    // Add scale indicator
    this.drawScaleIndicator(pdf, config);
    
    // Add professional drawing elements
    if (config.professionalElements) {
      this.drawProfessionalElements(pdf, config);
    }
    
    return new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
  }

  /**
   * Draw professional border with corner marks and tick marks
   */
  private static drawBorder(pdf: jsPDF, config: ExportConfig): void {
    const margin = 0.5;
    const pageWidth = config.pageSize.width;
    const pageHeight = config.pageSize.height;
    
    // Main border
    pdf.setLineWidth(0.02);
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    
    // Corner marks for trimming
    const markLength = 0.25;
    const cornerOffset = 0.25;
    
    // Top-left corner
    pdf.line(cornerOffset, margin - markLength, cornerOffset, margin + markLength);
    pdf.line(margin - markLength, cornerOffset, margin + markLength, cornerOffset);
    
    // Top-right corner
    pdf.line(pageWidth - cornerOffset, margin - markLength, pageWidth - cornerOffset, margin + markLength);
    pdf.line(pageWidth - margin - markLength, cornerOffset, pageWidth - margin + markLength, cornerOffset);
    
    // Bottom-left corner
    pdf.line(cornerOffset, pageHeight - margin - markLength, cornerOffset, pageHeight - margin + markLength);
    pdf.line(margin - markLength, pageHeight - cornerOffset, margin + markLength, pageHeight - cornerOffset);
    
    // Bottom-right corner
    pdf.line(pageWidth - cornerOffset, pageHeight - margin - markLength, pageWidth - cornerOffset, pageHeight - margin + markLength);
    pdf.line(pageWidth - margin - markLength, pageHeight - cornerOffset, pageWidth - margin + markLength, pageHeight - cornerOffset);
  }

  /**
   * Draw professional title block with field layout
   */
  private static drawTitleBlock(pdf: jsPDF, config: ExportConfig): void {
    const tbHeight = 3; // inches
    const tbY = config.pageSize.height - tbHeight - 0.5;
    const tbWidth = config.pageSize.width - 1;
    
    // Title block border
    pdf.setLineWidth(0.02);
    pdf.rect(0.5, tbY, tbWidth, tbHeight);
    
    // Internal grid lines
    pdf.setLineWidth(0.01);
    
    // Horizontal divisions
    pdf.line(0.5, tbY + 1, config.pageSize.width - 0.5, tbY + 1);
    pdf.line(0.5, tbY + 2, config.pageSize.width - 0.5, tbY + 2);
    
    // Vertical divisions
    pdf.line(0.5 + tbWidth * 0.3, tbY, 0.5 + tbWidth * 0.3, tbY + tbHeight);
    pdf.line(0.5 + tbWidth * 0.7, tbY, 0.5 + tbWidth * 0.7, tbY + tbHeight);
    
    // Add field labels and values
    config.titleBlock.fields.forEach(field => {
      const x = 0.5 + (field.x / 100) * tbWidth;
      const y = tbY + (field.y / 100) * tbHeight;
      
      // Field label
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(field.label + ':', x + 0.1, y + 0.15);
      
      // Field value
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(field.value, x + 0.1, y + 0.35);
    });
    
    // Add company logo if provided
    if (config.titleBlock.logoUrl) {
      try {
        pdf.addImage(
          config.titleBlock.logoUrl, 
          'PNG', 
          config.pageSize.width - 2.5, 
          tbY + 0.25, 
          2, 
          1.5
        );
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
      }
    }
    
    // Add revision triangle
    pdf.setFillColor(200, 200, 200);
    const revX = config.pageSize.width - 0.8;
    const revY = tbY + 0.2;
    pdf.triangle(revX, revY, revX + 0.3, revY, revX + 0.15, revY + 0.3, 'F');
  }

  /**
   * Add the original drawing as background
   */
  private static async drawContent(pdf: jsPDF, config: ExportConfig): Promise<void> {
    if (!config.includeOriginal || !config.drawingImage) return;
    
    const drawingArea = {
      x: 0.75,
      y: 0.75,
      width: config.pageSize.width - 1.5,
      height: config.pageSize.height - 4.5 // Account for title block
    };
    
    try {
      pdf.addImage(
        config.drawingImage,
        'PNG',
        drawingArea.x,
        drawingArea.y,
        drawingArea.width,
        drawingArea.height
      );
    } catch (error) {
      console.warn('Failed to add background drawing:', error);
      
      // Add placeholder text
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(12);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        'Original drawing not available',
        config.pageSize.width / 2,
        config.pageSize.height / 2,
        { align: 'center' }
      );
    }
  }

  /**
   * Draw backing rectangles with professional annotations
   */
  private static drawBackings(pdf: jsPDF, config: ExportConfig): void {
    const colors = {
      '2x4': [138, 92, 246],
      '2x6': [59, 130, 246], 
      '2x8': [16, 185, 129],
      '2x10': [245, 158, 11],
      '3/4_plywood': [239, 68, 68],
      'steel_plate': [107, 114, 128],
      'blocking': [249, 115, 22]
    };

    config.backings.forEach((backing, index) => {
      const x = 0.75 + backing.x * config.scale;
      const y = 0.75 + backing.y * config.scale;
      const width = backing.width * config.scale;
      const height = backing.height * config.scale;
      
      // Get color based on backing type
      const color = colors[backing.type as keyof typeof colors] || [128, 128, 128];
      
      // Set fill color based on status
      let alpha = 0.3;
      if (backing.status === 'approved') alpha = 0.5;
      if (backing.status === 'user_modified') alpha = 0.4;
      
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.setDrawColor(color[0] * 0.7, color[1] * 0.7, color[2] * 0.7);
      pdf.setLineWidth(0.01);
      
      // Draw backing rectangle
      pdf.rect(x, y, width, height, 'FD');
      
      // Add backing label if space allows
      if (width > 0.5 && height > 0.3) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        
        const labelX = x + width / 2;
        const labelY = y + height / 2;
        
        // Backing type
        pdf.text(backing.type, labelX, labelY - 0.05, { align: 'center' });
        
        // Height above finished floor
        pdf.setFontSize(6);
        pdf.text(`@ ${backing.heightAFF}"`, labelX, labelY + 0.1, { align: 'center' });
      }
      
      // Add backing number
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`B${index + 1}`, x + 0.05, y + 0.15);
    });
  }

  /**
   * Draw dimension lines and annotations
   */
  private static drawDimensions(pdf: jsPDF, config: ExportConfig): void {
    if (!config.dimensions) return;
    
    pdf.setDrawColor(255, 0, 0); // Red for dimensions
    pdf.setLineWidth(0.005);
    
    config.dimensions.forEach(dim => {
      const startX = 0.75 + dim.start.x * config.scale;
      const startY = 0.75 + dim.start.y * config.scale;
      const endX = 0.75 + dim.end.x * config.scale;
      const endY = 0.75 + dim.end.y * config.scale;
      
      // Dimension line
      pdf.line(startX, startY, endX, endY);
      
      // Extension lines
      const perpLength = 0.1;
      const angle = Math.atan2(endY - startY, endX - startX);
      const perpAngle = angle + Math.PI / 2;
      
      // Start extension
      pdf.line(
        startX - Math.cos(perpAngle) * perpLength,
        startY - Math.sin(perpAngle) * perpLength,
        startX + Math.cos(perpAngle) * perpLength,
        startY + Math.sin(perpAngle) * perpLength
      );
      
      // End extension
      pdf.line(
        endX - Math.cos(perpAngle) * perpLength,
        endY - Math.sin(perpAngle) * perpLength,
        endX + Math.cos(perpAngle) * perpLength,
        endY + Math.sin(perpAngle) * perpLength
      );
      
      // Dimension text
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(255, 0, 0);
      pdf.text(dim.label, midX, midY - 0.05, { align: 'center' });
    });
  }

  /**
   * Draw material schedule table
   */
  private static drawMaterialSchedule(pdf: jsPDF, config: ExportConfig): void {
    if (!config.materialSchedule || config.materialSchedule.length === 0) return;
    
    const startY = 1.0;
    const tableWidth = 4;
    
    // Table header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('MATERIAL SCHEDULE', 1, startY);
    
    // Table data
    const tableData = config.materialSchedule.map(item => [
      item.type,
      item.count.toString(),
      item.totalLength ? `${item.totalLength.toFixed(1)} LF` : '',
      item.totalArea ? `${item.totalArea.toFixed(1)} SF` : ''
    ]);
    
    // Use autoTable for professional table formatting
    (pdf as any).autoTable({
      head: [['Material Type', 'Qty', 'Length', 'Area']],
      body: tableData,
      startY: startY + 0.2,
      margin: { left: 1 },
      styles: {
        fontSize: 8,
        cellPadding: 0.05
      },
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 1.5 },
        1: { cellWidth: 0.5, halign: 'center' },
        2: { cellWidth: 1, halign: 'right' },
        3: { cellWidth: 1, halign: 'right' }
      }
    });
  }

  /**
   * Add scale indicator
   */
  private static drawScaleIndicator(pdf: jsPDF, config: ExportConfig): void {
    const scaleX = 1;
    const scaleY = config.pageSize.height - 4;
    
    // Scale bar
    pdf.setLineWidth(0.02);
    pdf.setDrawColor(0, 0, 0);
    pdf.line(scaleX, scaleY, scaleX + 1, scaleY);
    
    // Scale marks
    for (let i = 0; i <= 4; i++) {
      const x = scaleX + (i * 0.25);
      pdf.line(x, scaleY - 0.05, x, scaleY + 0.05);
    }
    
    // Scale text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('0', scaleX - 0.05, scaleY + 0.15);
    pdf.text('1\'', scaleX + 1, scaleY + 0.15);
    pdf.text(`Scale: 1/4" = 1'-0"`, scaleX, scaleY + 0.3);
  }

  /**
   * Draw professional drawing elements (north arrow, legend, notes, etc.)
   */
  private static drawProfessionalElements(pdf: jsPDF, config: ExportConfig): void {
    if (!config.professionalElements) return;

    const elements = config.professionalElements;

    // Draw North Arrow
    if (elements.northArrow?.enabled) {
      this.drawNorthArrow(pdf, elements.northArrow);
    }

    // Draw Enhanced Scale Bar (separate from basic scale indicator)
    if (elements.scaleBar?.enabled) {
      this.drawEnhancedScaleBar(pdf, elements.scaleBar);
    }

    // Draw Backing Legend
    if (elements.legend?.enabled) {
      this.drawBackingLegend(pdf, elements.legend);
    }

    // Draw General Notes
    if (elements.generalNotes?.enabled) {
      this.drawGeneralNotes(pdf, elements.generalNotes);
    }

    // Draw Revision Table
    if (elements.revisionTable?.enabled) {
      this.drawRevisionTable(pdf, elements.revisionTable);
    }
  }

  /**
   * Draw north arrow
   */
  private static drawNorthArrow(pdf: jsPDF, northArrow: NonNullable<ExportConfig['professionalElements']>['northArrow']): void {
    if (!northArrow) return;

    const { position, rotation, scale } = northArrow;
    const size = 0.6 * scale; // inches
    
    pdf.saveGraphicsState();
    
    // Translate and rotate
    pdf.setGState(new (pdf as any).GState({ transform: [1, 0, 0, 1, position.x, position.y] }));
    
    // Outer circle
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.02);
    pdf.circle(position.x, position.y, size / 2);
    
    // North arrow (pointing up, then rotated)
    const arrowSize = size * 0.6;
    const centerX = position.x;
    const centerY = position.y;
    
    // Calculate rotated arrow points
    const cos = Math.cos((rotation * Math.PI) / 180);
    const sin = Math.sin((rotation * Math.PI) / 180);
    
    // Arrow tip (north)
    const tipX = centerX + arrowSize * 0.4 * sin;
    const tipY = centerY - arrowSize * 0.4 * cos;
    
    // Arrow base points
    const baseLeftX = centerX - arrowSize * 0.15 * cos - arrowSize * 0.15 * sin;
    const baseLeftY = centerY - arrowSize * 0.15 * sin + arrowSize * 0.15 * cos;
    const baseRightX = centerX + arrowSize * 0.15 * cos - arrowSize * 0.15 * sin;
    const baseRightY = centerY + arrowSize * 0.15 * sin + arrowSize * 0.15 * cos;
    
    // Draw arrow
    pdf.setFillColor(0, 0, 0);
    pdf.triangle(tipX, tipY, baseLeftX, baseLeftY, baseRightX, baseRightY, 'F');
    
    // Add "N" label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text('N', tipX, tipY - 0.05, { align: 'center' });
    
    pdf.restoreGraphicsState();
  }

  /**
   * Draw enhanced scale bar
   */
  private static drawEnhancedScaleBar(pdf: jsPDF, scaleBar: NonNullable<ExportConfig['professionalElements']>['scaleBar']): void {
    if (!scaleBar) return;

    const { position, scale, units } = scaleBar;
    const barLength = 2; // inches
    const segments = 4;
    const segmentLength = barLength / segments;
    
    // Background box
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.01);
    pdf.rect(position.x - 0.1, position.y - 0.3, barLength + 0.2, 0.6, 'FD');
    
    // Scale bar
    pdf.setLineWidth(0.02);
    pdf.line(position.x, position.y, position.x + barLength, position.y);
    
    // Segments with alternating fill
    for (let i = 0; i < segments; i++) {
      const x = position.x + i * segmentLength;
      const width = segmentLength;
      
      if (i % 2 === 1) {
        pdf.setFillColor(0, 0, 0);
        pdf.rect(x, position.y - 0.05, width, 0.1, 'F');
      }
      
      // Tick marks
      pdf.line(x, position.y - 0.1, x, position.y + 0.1);
      
      // Labels
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.text(
        units === 'imperial' ? `${i * 5}'` : `${i * 2}m`,
        x, 
        position.y + 0.2,
        { align: 'center' }
      );
    }
    
    // Final tick and label
    pdf.line(position.x + barLength, position.y - 0.1, position.x + barLength, position.y + 0.1);
    pdf.text(
      units === 'imperial' ? "20'" : "8m",
      position.x + barLength, 
      position.y + 0.2,
      { align: 'center' }
    );
    
    // Scale text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('GRAPHIC SCALE', position.x + barLength / 2, position.y - 0.2, { align: 'center' });
  }

  /**
   * Draw backing legend
   */
  private static drawBackingLegend(pdf: jsPDF, legend: NonNullable<ExportConfig['professionalElements']>['legend']): void {
    if (!legend) return;

    const { position, backingTypes } = legend;
    const itemHeight = 0.2;
    const totalHeight = backingTypes.length * itemHeight + 0.4;
    const width = 3;
    
    // Background box
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.02);
    pdf.rect(position.x, position.y, width, totalHeight, 'FD');
    
    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('BACKING LEGEND', position.x + 0.1, position.y + 0.15);
    
    // Legend items
    backingTypes.forEach((backing, index) => {
      const y = position.y + 0.3 + index * itemHeight;
      
      // Color square
      const colorRgb = this.hexToRgb(backing.color);
      pdf.setFillColor(colorRgb.r, colorRgb.g, colorRgb.b);
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(position.x + 0.1, y - 0.05, 0.15, 0.1, 'FD');
      
      // Text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(backing.type, position.x + 0.3, y);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(backing.description, position.x + 1.2, y);
      
      if (backing.count) {
        pdf.text(`(${backing.count})`, position.x + width - 0.3, y);
      }
    });
  }

  /**
   * Draw general notes
   */
  private static drawGeneralNotes(pdf: jsPDF, notes: NonNullable<ExportConfig['professionalElements']>['generalNotes']): void {
    if (!notes) return;

    const { position, notes: notesList, title } = notes;
    const lineHeight = 0.15;
    const totalHeight = notesList.length * lineHeight + 0.4;
    const width = 4;
    
    // Background box
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.02);
    pdf.rect(position.x, position.y, width, totalHeight, 'FD');
    
    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(title || 'GENERAL NOTES', position.x + 0.1, position.y + 0.15);
    
    // Notes
    notesList.forEach((note, index) => {
      const y = position.y + 0.3 + index * lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(`${index + 1}.`, position.x + 0.1, y);
      pdf.text(note, position.x + 0.25, y);
    });
  }

  /**
   * Draw revision table
   */
  private static drawRevisionTable(pdf: jsPDF, revisionTable: NonNullable<ExportConfig['professionalElements']>['revisionTable']): void {
    if (!revisionTable) return;

    const { position, revisions } = revisionTable;
    const rowHeight = 0.2;
    const headerHeight = 0.25;
    const totalRows = Math.max(revisions.length, 5); // Minimum 5 rows
    const totalHeight = headerHeight + totalRows * rowHeight;
    const colWidths = [0.4, 0.8, 2.0, 0.6]; // Rev, Date, Description, By
    const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
    
    // Table border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.02);
    pdf.rect(position.x, position.y, totalWidth, totalHeight);
    
    // Header
    pdf.setFillColor(200, 200, 200);
    pdf.rect(position.x, position.y, totalWidth, headerHeight, 'F');
    
    // Header text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    
    const headers = ['REV', 'DATE', 'DESCRIPTION', 'BY'];
    let x = position.x;
    headers.forEach((header, index) => {
      pdf.text(header, x + colWidths[index] / 2, position.y + headerHeight / 2, { align: 'center' });
      x += colWidths[index];
    });
    
    // Column lines
    x = position.x;
    for (let i = 0; i < colWidths.length; i++) {
      x += colWidths[i];
      if (i < colWidths.length - 1) {
        pdf.line(x, position.y, x, position.y + totalHeight);
      }
    }
    
    // Row lines
    for (let i = 1; i <= totalRows; i++) {
      const y = position.y + headerHeight + i * rowHeight;
      pdf.line(position.x, y, position.x + totalWidth, y);
    }
    
    // Revision data
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    
    revisions.forEach((revision, index) => {
      const y = position.y + headerHeight + (index + 0.5) * rowHeight + 0.05;
      let cellX = position.x;
      
      // Rev number
      pdf.text(revision.number, cellX + colWidths[0] / 2, y, { align: 'center' });
      cellX += colWidths[0];
      
      // Date
      pdf.text(revision.date, cellX + colWidths[1] / 2, y, { align: 'center' });
      cellX += colWidths[1];
      
      // Description
      pdf.text(revision.description, cellX + 0.05, y);
      cellX += colWidths[2];
      
      // By
      pdf.text(revision.by, cellX + colWidths[3] / 2, y, { align: 'center' });
    });
  }

  /**
   * Helper function to convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 128 };
  }
}