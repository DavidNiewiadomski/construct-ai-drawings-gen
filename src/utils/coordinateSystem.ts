import { Point } from './viewerUtils';

export interface CoordinateSystem {
  // PDF document coordinates (in PDF units)
  pdfToScreen: (pdfPoint: Point) => Point;
  screenToPdf: (screenPoint: Point) => Point;
  
  // Scaling factor for dimensions
  getScaleFactor: () => number;
  
  // Update coordinate system when PDF or viewport changes
  updatePdfBounds: (pdfBounds: { width: number; height: number; x: number; y: number }) => void;
  updateViewport: (viewport: { zoom: number; pan: Point; stageSize: { width: number; height: number } }) => void;
}

export interface PdfBounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface Viewport {
  zoom: number;
  pan: Point;
  stageSize: { width: number; height: number };
}

export class DrawingCoordinateSystem implements CoordinateSystem {
  private pdfBounds: PdfBounds = { width: 0, height: 0, x: 0, y: 0 };
  private viewport: Viewport = { 
    zoom: 1, 
    pan: { x: 0, y: 0 }, 
    stageSize: { width: 800, height: 600 } 
  };
  
  // Standard inches per PDF unit (assuming 72 DPI for PDF)
  private readonly PDF_UNITS_PER_INCH = 72;
  
  updatePdfBounds(pdfBounds: PdfBounds): void {
    this.pdfBounds = { ...pdfBounds };
  }
  
  updateViewport(viewport: Viewport): void {
    this.viewport = { 
      ...viewport,
      pan: { ...viewport.pan },
      stageSize: { ...viewport.stageSize }
    };
  }
  
  /**
   * Convert PDF coordinates to screen coordinates
   * Takes into account PDF bounds, zoom level, and pan offset
   */
  pdfToScreen(pdfPoint: Point): Point {
    if (this.pdfBounds.width === 0 || this.pdfBounds.height === 0) {
      return { x: pdfPoint.x, y: pdfPoint.y };
    }
    
    // Normalize PDF coordinates to 0-1 range
    const normalizedX = (pdfPoint.x - this.pdfBounds.x) / this.pdfBounds.width;
    const normalizedY = (pdfPoint.y - this.pdfBounds.y) / this.pdfBounds.height;
    
    // Scale to PDF display size and apply transformations
    const displayWidth = this.pdfBounds.width;
    const displayHeight = this.pdfBounds.height;
    
    const scaledX = normalizedX * displayWidth;
    const scaledY = normalizedY * displayHeight;
    
    // Apply zoom and pan transformations
    return {
      x: scaledX * this.viewport.zoom + this.viewport.pan.x,
      y: scaledY * this.viewport.zoom + this.viewport.pan.y
    };
  }
  
  /**
   * Convert screen coordinates to PDF coordinates
   * Reverses the transformations applied in pdfToScreen
   */
  screenToPdf(screenPoint: Point): Point {
    if (this.pdfBounds.width === 0 || this.pdfBounds.height === 0) {
      return { x: screenPoint.x, y: screenPoint.y };
    }
    
    // Reverse zoom and pan transformations
    const scaledX = (screenPoint.x - this.viewport.pan.x) / this.viewport.zoom;
    const scaledY = (screenPoint.y - this.viewport.pan.y) / this.viewport.zoom;
    
    // Normalize to 0-1 range
    const displayWidth = this.pdfBounds.width;
    const displayHeight = this.pdfBounds.height;
    
    const normalizedX = scaledX / displayWidth;
    const normalizedY = scaledY / displayHeight;
    
    // Convert back to PDF coordinates
    return {
      x: normalizedX * this.pdfBounds.width + this.pdfBounds.x,
      y: normalizedY * this.pdfBounds.height + this.pdfBounds.y
    };
  }
  
  /**
   * Get the current scale factor for sizing elements appropriately
   * This helps maintain consistent visual sizing at different zoom levels
   */
  getScaleFactor(): number {
    return this.viewport.zoom;
  }
  
  /**
   * Convert inches to PDF units for backing dimensions
   */
  inchesToPdfUnits(inches: number): number {
    return inches * this.PDF_UNITS_PER_INCH;
  }
  
  /**
   * Convert PDF units to inches for display
   */
  pdfUnitsToInches(pdfUnits: number): number {
    return pdfUnits / this.PDF_UNITS_PER_INCH;
  }
  
  /**
   * Snap a point to grid in PDF coordinates
   */
  snapToPdfGrid(pdfPoint: Point, gridSizeInches: number): Point {
    const gridSizePdf = this.inchesToPdfUnits(gridSizeInches);
    
    return {
      x: Math.round(pdfPoint.x / gridSizePdf) * gridSizePdf,
      y: Math.round(pdfPoint.y / gridSizePdf) * gridSizePdf
    };
  }
  
  /**
   * Get grid lines for rendering in screen coordinates
   */
  getGridLines(gridSizeInches: number): { vertical: number[]; horizontal: number[] } {
    const gridSizePdf = this.inchesToPdfUnits(gridSizeInches);
    const vertical: number[] = [];
    const horizontal: number[] = [];
    
    // Calculate visible area in PDF coordinates
    const topLeft = this.screenToPdf({ x: 0, y: 0 });
    const bottomRight = this.screenToPdf({ x: this.viewport.stageSize.width, y: this.viewport.stageSize.height });
    
    // Generate vertical lines
    const startX = Math.floor(topLeft.x / gridSizePdf) * gridSizePdf;
    const endX = Math.ceil(bottomRight.x / gridSizePdf) * gridSizePdf;
    
    for (let x = startX; x <= endX; x += gridSizePdf) {
      const screenX = this.pdfToScreen({ x, y: 0 }).x;
      if (screenX >= -gridSizePdf && screenX <= this.viewport.stageSize.width + gridSizePdf) {
        vertical.push(screenX);
      }
    }
    
    // Generate horizontal lines
    const startY = Math.floor(topLeft.y / gridSizePdf) * gridSizePdf;
    const endY = Math.ceil(bottomRight.y / gridSizePdf) * gridSizePdf;
    
    for (let y = startY; y <= endY; y += gridSizePdf) {
      const screenY = this.pdfToScreen({ x: 0, y }).y;
      if (screenY >= -gridSizePdf && screenY <= this.viewport.stageSize.height + gridSizePdf) {
        horizontal.push(screenY);
      }
    }
    
    return { vertical, horizontal };
  }
  
  /**
   * Calculate appropriate line thickness for current zoom level
   */
  getLineThickness(baseThickness: number = 1): number {
    return baseThickness / this.viewport.zoom;
  }
  
  /**
   * Calculate appropriate font size for current zoom level
   */
  getFontSize(baseFontSize: number = 12): number {
    return Math.max(8, baseFontSize / this.viewport.zoom);
  }
}

// Global coordinate system instance
export const coordinateSystem = new DrawingCoordinateSystem();