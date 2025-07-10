import { UploadedFile } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export class FileService {
  async uploadFile(file: File, type: string): Promise<UploadedFile> {
    try {
      // Generate unique filename
      const timestamp = new Date().toISOString();
      const filename = `${timestamp}-${file.name}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('drawings')
        .upload(filename, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('drawings')
        .getPublicUrl(filename);

      // Create UploadedFile object
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        filename: file.name,
        fileType: type as any,
        fileUrl: publicUrl,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        status: 'uploaded',
        metadata: {
          pageCount: undefined,
          dimensions: undefined,
          scale: undefined,
        }
      };

      return uploadedFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      // Get file info from storage
      const files = this.getStoredFiles();
      const fileToDelete = files.find(f => f.id === fileId);
      
      if (fileToDelete) {
        // Extract filename from URL
        const urlParts = fileToDelete.fileUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        // Delete from Supabase storage
        const { error } = await supabase.storage
          .from('drawings')
          .remove([filename]);

        if (error) {
          throw error;
        }

        // Remove from local storage
        const updatedFiles = files.filter(f => f.id !== fileId);
        localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFiles(): Promise<UploadedFile[]> {
    try {
      return this.getStoredFiles();
    } catch (error) {
      console.error('Error getting files:', error);
      return [];
    }
  }

  async processFiles(fileIds: string[]): Promise<void> {
    try {
      const files = this.getStoredFiles();
      const updatedFiles = files.map(file => {
        if (fileIds.includes(file.id)) {
          return { ...file, status: 'processing' as const };
        }
        return file;
      });

      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));

      // Simulate processing time
      setTimeout(() => {
        const finalFiles = updatedFiles.map(file => {
          if (fileIds.includes(file.id)) {
            return { 
              ...file, 
              status: 'ready' as const,
              metadata: {
                ...file.metadata,
                pageCount: Math.floor(Math.random() * 10) + 1,
                dimensions: { width: 2200, height: 1700 },
                scale: '1/4" = 1\'-0"'
              }
            };
          }
          return file;
        });

        localStorage.setItem('uploadedFiles', JSON.stringify(finalFiles));
        
        // Trigger a custom event to notify components
        window.dispatchEvent(new CustomEvent('filesProcessed'));
      }, 3000);

    } catch (error) {
      console.error('Error processing files:', error);
      throw error;
    }
  }

  private getStoredFiles(): UploadedFile[] {
    // First check for demo data
    const demoData = localStorage.getItem('demo-project');
    if (demoData) {
      const demo = JSON.parse(demoData);
      if (demo.files && Array.isArray(demo.files)) {
        // Convert demo files to UploadedFile format
        return demo.files.map((file: any) => ({
          id: file.id,
          filename: file.name,
          fileType: file.type,
          fileUrl: file.type === 'contract_drawing' 
            ? 'https://pdfobject.com/pdf/sample.pdf' // Use a sample PDF for demo
            : '/placeholder.svg',
          fileSize: file.size,
          uploadDate: file.uploadedAt,
          status: 'ready' as const,
          metadata: {
            pageCount: file.metadata?.pages || 1,
            dimensions: file.metadata?.dimensions || { width: 800, height: 600 },
            scale: '1/4" = 1\'-0"'
          }
        }));
      }
    }
    
    // Fallback to regular stored files
    const stored = localStorage.getItem('uploadedFiles');
    return stored ? JSON.parse(stored) : [];
  }

  saveFile(file: UploadedFile): void {
    const files = this.getStoredFiles();
    const updatedFiles = [...files, file];
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
  }

  updateFile(fileId: string, updates: Partial<UploadedFile>): void {
    const files = this.getStoredFiles();
    const updatedFiles = files.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    );
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
  }
}