import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { fileTypeFromBuffer } from 'file-type';
import { Upload, File, X, FileText, Image, Box, Settings, Loader2, AlertCircle, Clock, Trash2, Play } from 'lucide-react';
import { FileProcessingService } from '@/services/fileProcessingService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types';
import { FileService } from '@/services/fileService';
import { FilePreview } from './FilePreview';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return { 
        valid: false, 
        error: `File too large. Maximum size is 100MB. Current size: ${formatFileSize(file.size)}` 
      };
    }

    // Use the FileProcessingService for validation
    try {
      const validation = await FileProcessingService.validateFile(file);
      if (!validation.isValid) {
        return {
          valid: false,
          error: validation.error || 'File validation failed'
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Network error: Unable to validate file. Please check your connection and try again.'
      };
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
    maxSize: 100 * 1024 * 1024, // 100MB
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

  // Calculate batch summary
  const totalFiles = fileQueue.length;
  const totalSize = fileQueue.reduce((sum, file) => sum + file.size, 0);
  const estimatedTime = Math.max(1, Math.ceil(totalFiles * 2.5)); // 2.5 minutes per file estimate
  const readyFiles = fileQueue.filter(f => f.status === 'ready').length;
  const canProcess = readyFiles > 0 && !processing && !uploading;

  const handleProcessFiles = async () => {
    const filesToProcess = fileQueue.filter(f => f.status === 'ready');
    
    if (filesToProcess.length === 0) {
      toast({
        title: 'No files to process',
        description: 'Please wait for files to finish uploading before processing.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      for (const file of filesToProcess) {
        setFileQueue(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'processing' as const } : f
        ));
      }

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Processing complete',
        description: `Successfully processed ${filesToProcess.length} files.`,
      });

      // Mark files as completed and move to main list
      const processedFiles: UploadedFile[] = filesToProcess.map(file => ({
        id: file.id,
        filename: file.name,
        fileSize: file.size,
        fileType: file.type,
        status: 'ready' as const,
        fileUrl: URL.createObjectURL(file),
        uploadDate: new Date().toISOString(),
        metadata: { pageCount: file.pages }
      }));

      onFilesChange([...files, ...processedFiles]);
      
      // Remove processed files from queue
      setFileQueue(prev => prev.filter(f => !filesToProcess.some(pf => pf.id === f.id)));

    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'Network error: Failed to process files. Please check your connection and try again.',
        variant: 'destructive',
      });
      
      // Reset file status on error
      setFileQueue(prev => prev.map(f => 
        f.status === 'processing' ? { ...f, status: 'ready' as const } : f
      ));
    } finally {
      setProcessing(false);
    }
  };

  const handleClearAll = () => {
    setFileQueue([]);
    toast({
      title: 'Queue cleared',
      description: 'All files have been removed from the upload queue.',
    });
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
            Supports: PDF, DWG, DXF, IFC, RVT (max 100MB each)
          </p>
        </div>
      </div>

      {/* Batch Upload Summary */}
      {totalFiles > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Batch Upload Summary</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive h-7 px-2"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{totalFiles}</div>
                <div className="text-muted-foreground text-xs">Total Files</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{formatFileSize(totalSize)}</div>
                <div className="text-muted-foreground text-xs">Total Size</div>
              </div>
              <div className="text-center">
                <div className="font-semibold flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{estimatedTime}m
                </div>
                <div className="text-muted-foreground text-xs">Est. Time</div>
              </div>
            </div>

            {readyFiles !== totalFiles && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {readyFiles} of {totalFiles} files ready for processing. 
                  {totalFiles - readyFiles} still uploading.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleProcessFiles}
                disabled={!canProcess}
                className="flex-1 bg-primary hover:bg-primary/90"
                size="sm"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Process {readyFiles > 0 ? `${readyFiles} ` : ''}Files
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* File Queue */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Files in queue */}
          {fileQueue.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Upload Queue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fileQueue.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    type={file.type}
                    status={file.status}
                    uploadProgress={file.uploadProgress}
                    error={file.error}
                    pages={file.pages}
                    onTypeChange={(newType) => handleTypeChange(file.id, newType)}
                    onDelete={() => handleDeleteFile(file.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Uploaded files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Processed Files ({files.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {files.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={{
                      name: file.filename,
                      url: file.fileUrl || '',
                      type: file.filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
                      size: file.fileSize
                    }}
                    type={file.fileType}
                    status={file.status === 'uploaded' ? 'ready' : file.status as any}
                    pages={file.metadata?.pageCount as number}
                    onTypeChange={(newType) => handleTypeChange(file.id, newType)}
                    onDelete={() => handleDeleteFile(file.id)}
                  />
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
    </div>
  );
}