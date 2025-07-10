import { pdfjs } from 'react-pdf';
import { fileTypeFromBuffer } from 'file-type';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js`;

export class FileProcessingService {
  static async generatePDFThumbnail(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      const scale = 0.5; // Adjust for thumbnail size
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      
      // Convert to base64
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      throw new Error('Failed to generate PDF thumbnail');
    }
  }
  
  static async extractPDFMetadata(file: File): Promise<{
    pageCount: number;
    dimensions: { width: number; height: number };
    created: Date;
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      // Get page count
      const pageCount = pdf.numPages;
      
      // Get dimensions from first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const dimensions = {
        width: viewport.width,
        height: viewport.height,
      };
      
      // Get metadata
      const metadata = await pdf.getMetadata();
      const created = (metadata.info as any)?.CreationDate 
        ? new Date((metadata.info as any).CreationDate)
        : new Date(file.lastModified);
      
      return {
        pageCount,
        dimensions,
        created,
      };
    } catch (error) {
      console.error('Error extracting PDF metadata:', error);
      throw new Error('Failed to extract PDF metadata');
    }
  }
  
  static async validateFile(file: File): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      // Check file size (limit to 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: 'File size exceeds 100MB limit',
        };
      }
      
      // Check if file is empty
      if (file.size === 0) {
        return {
          isValid: false,
          error: 'File is empty',
        };
      }
      
      // Read first chunk to detect file type
      const chunk = file.slice(0, 4100);
      const arrayBuffer = await chunk.arrayBuffer();
      const fileType = await fileTypeFromBuffer(arrayBuffer);
      
      // Define allowed file types
      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/tiff',
        'application/dwg', // DWG files
        'application/dxf', // DXF files
      ];
      
      // Check MIME type
      const mimeType = fileType?.mime || file.type;
      
      // Special handling for CAD files (they might not be detected by file-type)
      const fileName = file.name.toLowerCase();
      const isCADFile = fileName.endsWith('.dwg') || fileName.endsWith('.dxf') || fileName.endsWith('.ifc') || fileName.endsWith('.rvt');
      
      if (!allowedTypes.includes(mimeType) && !isCADFile) {
        return {
          isValid: false,
          error: `Unsupported file type: ${mimeType || 'unknown'}. Supported types: PDF, PNG, JPEG, TIFF, DWG, DXF, IFC, RVT`,
        };
      }
      
      // Additional validation for PDF files
      if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          await pdfjs.getDocument({ data: arrayBuffer }).promise;
        } catch (error) {
          return {
            isValid: false,
            error: 'Invalid or corrupted PDF file',
          };
        }
      }
      
      return {
        isValid: true,
      };
    } catch (error) {
      console.error('Error validating file:', error);
      return {
        isValid: false,
        error: 'Failed to validate file',
      };
    }
  }
  
  static async processFile(file: File): Promise<{
    isValid: boolean;
    thumbnail?: string;
    metadata?: {
      pageCount: number;
      dimensions: { width: number; height: number };
      created: Date;
    };
    error?: string;
  }> {
    // First validate the file
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      return validation;
    }
    
    const fileName = file.name.toLowerCase();
    
    try {
      // Generate thumbnail and extract metadata for PDFs
      if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        const [thumbnail, metadata] = await Promise.all([
          this.generatePDFThumbnail(file),
          this.extractPDFMetadata(file),
        ]);
        
        return {
          isValid: true,
          thumbnail,
          metadata,
        };
      }
      
      // For image files, create a simple thumbnail
      if (file.type.startsWith('image/')) {
        const thumbnail = await this.generateImageThumbnail(file);
        return {
          isValid: true,
          thumbnail,
        };
      }
      
      // For other file types, no thumbnail but file is valid
      return {
        isValid: true,
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        isValid: false,
        error: 'Failed to process file',
      };
    }
  }
  
  private static async generateImageThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onload = () => {
        // Calculate thumbnail dimensions (max 200px)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}