import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { fileTypeFromBuffer } from 'file-type';
import { Upload, File, X, FileText, Image, Box, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types';
import { FileService } from '@/services/fileService';
import { FilePreview } from './FilePreview';

const fileService = new FileService();

const FILE_TYPE_OPTIONS = [
  { value: 'contract_drawing', label: 'Contract Drawing' },
  { value: 'shop_drawing', label: 'Shop Drawing' },
  { value: 'submittal', label: 'Submittal' },
  { value: 'specification', label: 'Specification' },
  { value: 'bim_model', label: 'BIM Model' },
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.ifc', '.rvt'];
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/octet-stream', // For DWG/DXF files
  'application/x-dwg',
  'image/vnd.dwg',
  'application/acad'
];

interface FileWithMetadata extends File {
  id: string;
  type: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model';
  uploadProgress: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  pages?: number;
  thumbnail?: string;
  error?: string;
}

interface FileUploadPanelProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onStartTutorial?: () => void;
}

export function FileUploadPanel({ files, onFilesChange, onStartTutorial }: FileUploadPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileQueue, setFileQueue] = useState<FileWithMetadata[]>([]);
  const { toast } = useToast();

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'dwg':
      case 'dxf':
        return <Image className="h-5 w-5 text-blue-400" />;
      case 'ifc':
      case 'rvt':
        return <Box className="h-5 w-5 text-purple-400" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeBadgeClass = (type: string): string => {
    switch (type) {
      case 'contract_drawing': return 'type-contract';
      case 'shop_drawing': return 'type-shop';
      case 'submittal': return 'type-submittal';
      case 'specification': return 'type-specification';
      case 'bim_model': return 'type-bim';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'uploaded': return 'status-uploaded';
      case 'processing': return 'status-processing';
      case 'ready': return 'status-ready';
      case 'failed': return 'status-failed';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // Check file extension
    const extension = '.' + file.name.toLowerCase().split('.').pop();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return { 
        valid: false, 
        error: `Unsupported file type. Please upload PDF, DWG, DXF, IFC, or RVT files.` 
      };
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return { 
        valid: false, 
        error: `File too large. Maximum size is 50MB.` 
      };
    }

    // Validate file content for PDFs
    if (extension === '.pdf') {
      try {
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer.slice(0, 1024)); // Check first 1KB
        const detectedType = await fileTypeFromBuffer(uint8Array);
        
        if (detectedType?.mime !== 'application/pdf') {
          return { 
            valid: false, 
            error: `Invalid PDF file. The file appears to be corrupted or not a valid PDF.` 
          };
        }
      } catch (error) {
        return { 
          valid: false, 
          error: `Unable to validate file content.` 
        };
      }
    }

    return { valid: true };
  };

  const processFileQueue = useCallback(async (filesToProcess: FileWithMetadata[]) => {
    for (const fileWithMeta of filesToProcess) {
      try {
        // Update progress to show uploading
        setFileQueue(prev => prev.map(f => 
          f.id === fileWithMeta.id 
            ? { ...f, status: 'uploading' as const, uploadProgress: 10 }
            : f
        ));

        // Simulate upload progress
        for (let progress = 20; progress <= 90; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setFileQueue(prev => prev.map(f => 
            f.id === fileWithMeta.id 
              ? { ...f, uploadProgress: progress }
              : f
          ));
        }

        // Upload to service
        const uploadedFile = await fileService.uploadFile(fileWithMeta, 'contract_drawing');
        fileService.saveFile(uploadedFile);
        
        // Mark as ready
        setFileQueue(prev => prev.map(f => 
          f.id === fileWithMeta.id 
            ? { ...f, status: 'ready' as const, uploadProgress: 100 }
            : f
        ));

        // Update main files list
        onFilesChange(await fileService.getFiles());

        toast({
          title: 'File uploaded',
          description: `${fileWithMeta.name} has been uploaded successfully.`,
        });

      } catch (error) {
        setFileQueue(prev => prev.map(f => 
          f.id === fileWithMeta.id 
            ? { ...f, status: 'failed' as const, error: 'Upload failed' }
            : f
        ));

        toast({
          title: 'Upload failed',
          description: `Failed to upload ${fileWithMeta.name}. Please try again.`,
          variant: 'destructive',
        });
      }
    }
  }, [onFilesChange, toast]);

  const handleFileSelect = useCallback(async (selectedFiles: File[]) => {
    setUploading(true);
    const validFiles: FileWithMetadata[] = [];
    
    for (const file of selectedFiles) {
      const validation = await validateFile(file);
      
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: `${file.name}: ${validation.error}`,
          variant: 'destructive',
        });
        continue;
      }

      const fileWithMeta: FileWithMetadata = {
        ...file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'contract_drawing',
        uploadProgress: 0,
        status: 'uploading'
      };

      validFiles.push(fileWithMeta);
    }

    if (validFiles.length > 0) {
      setFileQueue(prev => [...prev, ...validFiles]);
      await processFileQueue(validFiles);
    }
    
    setUploading(false);
  }, [processFileQueue, toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileSelect(acceptedFiles);
  }, [handleFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/octet-stream': ['.dwg', '.dxf', '.ifc', '.rvt'],
      'application/x-dwg': ['.dwg'],
      'image/vnd.dwg': ['.dwg']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleTypeChange = async (fileId: string, newType: string) => {
    // Update in file queue if exists
    setFileQueue(prev => prev.map(f => 
      f.id === fileId ? { ...f, type: newType as any } : f
    ));
    
    // Update in main files list
    fileService.updateFile(fileId, { fileType: newType as any });
    onFilesChange(await fileService.getFiles());
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      // Remove from queue if exists
      setFileQueue(prev => prev.filter(f => f.id !== fileId));
      
      // Remove from main files
      await fileService.deleteFile(fileId);
      onFilesChange(await fileService.getFiles());
      
      toast({
        title: 'File deleted',
        description: 'File has been removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleProcessFiles = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files to process',
        description: 'Please upload some files first.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const fileIds = files.map(f => f.id);
      await fileService.processFiles(fileIds);
      
      toast({
        title: 'Processing started',
        description: 'Files are being processed for component detection.',
      });

      // Listen for processing completion
      const handleProcessingComplete = async () => {
        onFilesChange(await fileService.getFiles());
        setProcessing(false);
        toast({
          title: 'Processing complete',
          description: 'Files have been processed successfully.',
        });
        window.removeEventListener('filesProcessed', handleProcessingComplete);
      };

      window.addEventListener('filesProcessed', handleProcessingComplete);
    } catch (error) {
      setProcessing(false);
      toast({
        title: 'Processing failed',
        description: 'Failed to process files. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">File Upload</h2>
        <p className="text-sm text-muted-foreground">
          Upload your drawing files for AI analysis
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-4">
        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'drag-over' : ''} ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            or click to select files
          </p>
          <p className="text-xs text-muted-foreground">
            Supports: PDF, DWG, DXF, IFC, RVT (max 50MB each)
          </p>
        </div>
      </div>

      {/* File Queue */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Files in queue */}
          {fileQueue.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Upload Queue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fileQueue.map((file) => (
                  <div key={file.id} className="relative">
                    <FilePreview
                      file={file}
                      type={file.type}
                      status={file.status}
                      uploadProgress={file.uploadProgress}
                      error={file.error}
                    />
                    <div className="absolute top-2 right-2">
                      <Select
                        value={file.type}
                        onValueChange={(value) => handleTypeChange(file.id, value)}
                        disabled={file.status === 'uploading'}
                      >
                        <SelectTrigger className="w-20 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="absolute top-2 left-2 h-6 w-6 p-0 bg-background/80 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Uploaded files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Uploaded Files ({files.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {files.map((file) => (
                  <div key={file.id} className="relative">
                     <FilePreview
                       file={{
                         name: file.filename,
                         url: file.fileUrl || '',
                         type: file.filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
                         size: file.fileSize
                       }}
                       type={file.fileType}
                       status={file.status === 'uploaded' ? 'ready' : file.status as any}
                       pages={file.metadata?.pageCount as number}
                    />
                    <div className="absolute top-2 right-2">
                      <Select
                        value={file.fileType}
                        onValueChange={(value) => handleTypeChange(file.id, value)}
                      >
                        <SelectTrigger className="w-20 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="absolute top-2 left-2 h-6 w-6 p-0 bg-background/80 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {files.length === 0 && fileQueue.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files uploaded yet</p>
              <p className="text-xs mt-2">Drag and drop files or click to browse</p>
            </div>
          )}
        </div>
      </div>

      {/* Process Button */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleProcessFiles}
          disabled={(files.length === 0 && fileQueue.filter(f => f.status === 'ready').length === 0) || processing || uploading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Files...
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Process Files
            </>
          )}
        </Button>
      </div>
    </div>
  );
}