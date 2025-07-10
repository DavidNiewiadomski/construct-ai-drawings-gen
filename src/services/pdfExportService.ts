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
}