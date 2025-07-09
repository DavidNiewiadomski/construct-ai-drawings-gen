import { create } from 'zustand';
import { FileProcessingService } from '@/services/fileProcessingService';

export interface FileCard {
  id: string;
  name: string;
  size: number;
  file: File;
  type: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model';
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  uploadProgress: number;
  thumbnail?: string;
  pages?: number;
  error?: string;
  isGeneratingThumbnail?: boolean;
}

interface UploadState {
  files: FileCard[];
  isUploading: boolean;
  totalProgress: number;
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  updateFileType: (id: string, type: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model') => void;
  updateFileStatus: (id: string, status: 'uploading' | 'processing' | 'ready' | 'failed', error?: string) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileThumbnail: (id: string, thumbnail: string, pages?: number) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  clearAll: () => void;
  processReadyFiles: () => Promise<void>;
  isProcessing: boolean;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],
  isUploading: false,
  totalProgress: 0,
  isProcessing: false,

  addFiles: async (files: File[]) => {
    set({ isUploading: true });
    
    const newFiles: FileCard[] = [];
    
    for (const file of files) {
      const fileCard: FileCard = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        file,
        type: 'contract_drawing',
        status: 'uploading',
        uploadProgress: 0,
        isGeneratingThumbnail: true,
      };
      
      newFiles.push(fileCard);
    }
    
    // Add files to state immediately for UI responsiveness
    set(state => ({ 
      files: [...state.files, ...newFiles]
    }));
    
    // Process each file
    for (const fileCard of newFiles) {
      try {
        // Validate file
        const validation = await FileProcessingService.validateFile(fileCard.file);
        
        if (!validation.isValid) {
          get().updateFileStatus(fileCard.id, 'failed', validation.error);
          continue;
        }
        
        // Update progress during validation
        get().updateFileProgress(fileCard.id, 25);
        
        // Process file for metadata and thumbnail
        const processed = await FileProcessingService.processFile(fileCard.file);
        
        if (!processed.isValid) {
          get().updateFileStatus(fileCard.id, 'failed', processed.error);
          continue;
        }
        
        // Update progress after processing
        get().updateFileProgress(fileCard.id, 75);
        
        // Update thumbnail and metadata
        set(state => ({
          files: state.files.map(f => 
            f.id === fileCard.id 
              ? { 
                  ...f, 
                  isGeneratingThumbnail: false,
                  thumbnail: processed.thumbnail,
                  pages: processed.metadata?.pageCount,
                  uploadProgress: 100,
                  status: 'ready' as const
                }
              : f
          )
        }));
        
      } catch (error) {
        console.error('Error processing file:', error);
        get().updateFileStatus(fileCard.id, 'failed', 'Failed to process file');
      }
    }
    
    // Calculate total progress
    const state = get();
    const totalProgress = state.files.reduce((sum, file) => sum + file.uploadProgress, 0) / state.files.length;
    
    set({ 
      isUploading: false,
      totalProgress: totalProgress || 0
    });
  },

  removeFile: (id: string) => {
    set(state => ({
      files: state.files.filter(f => f.id !== id)
    }));
  },

  updateFileType: (id: string, type: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model') => {
    set(state => ({
      files: state.files.map(f => 
        f.id === id ? { ...f, type } : f
      )
    }));
  },

  updateFileStatus: (id: string, status: 'uploading' | 'processing' | 'ready' | 'failed', error?: string) => {
    set(state => ({
      files: state.files.map(f => 
        f.id === id ? { ...f, status, error } : f
      )
    }));
  },

  updateFileProgress: (id: string, progress: number) => {
    set(state => ({
      files: state.files.map(f => 
        f.id === id ? { ...f, uploadProgress: progress } : f
      )
    }));
  },

  updateFileThumbnail: (id: string, thumbnail: string, pages?: number) => {
    set(state => ({
      files: state.files.map(f => 
        f.id === id ? { ...f, thumbnail, pages, isGeneratingThumbnail: false } : f
      )
    }));
  },

  reorderFiles: (fromIndex: number, toIndex: number) => {
    set(state => {
      const newFiles = [...state.files];
      const [removed] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, removed);
      return { files: newFiles };
    });
  },

  clearAll: () => {
    set({ 
      files: [],
      totalProgress: 0,
      isUploading: false,
      isProcessing: false
    });
  },

  processReadyFiles: async () => {
    const state = get();
    const readyFiles = state.files.filter(f => f.status === 'ready');
    
    if (readyFiles.length === 0) return;
    
    set({ isProcessing: true });
    
    try {
      // Update all ready files to processing
      for (const file of readyFiles) {
        get().updateFileStatus(file.id, 'processing');
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark all as completed
      for (const file of readyFiles) {
        get().updateFileStatus(file.id, 'ready');
      }
      
    } catch (error) {
      console.error('Error processing files:', error);
      // Reset failed files back to ready
      for (const file of readyFiles) {
        get().updateFileStatus(file.id, 'failed', 'Processing failed');
      }
    } finally {
      set({ isProcessing: false });
    }
  },
}));