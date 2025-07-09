import { useState, useCallback, useRef } from 'react';
import { Upload, File, X, FileText, Image, Box, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types';
import { FileService } from '@/services/fileService';

const fileService = new FileService();

const FILE_TYPE_OPTIONS = [
  { value: 'contract_drawing', label: 'Contract Drawing' },
  { value: 'shop_drawing', label: 'Shop Drawing' },
  { value: 'submittal', label: 'Submittal' },
  { value: 'specification', label: 'Specification' },
  { value: 'bim_model', label: 'BIM Model' },
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.ifc', '.rvt'];

interface FileUploadPanelProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onStartTutorial?: () => void;
}

export function FileUploadPanel({ files, onFilesChange, onStartTutorial }: FileUploadPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.toLowerCase().split('.').pop();
    return ACCEPTED_EXTENSIONS.includes(extension);
  };

  const handleFileSelect = useCallback(async (selectedFiles: File[]) => {
    setUploading(true);
    
    try {
      for (const file of selectedFiles) {
        if (!validateFile(file)) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not a supported file type. Please upload PDF, DWG, DXF, IFC, or RVT files.`,
            variant: 'destructive',
          });
          continue;
        }

        const uploadedFile = await fileService.uploadFile(file, 'contract_drawing');
        fileService.saveFile(uploadedFile);
        onFilesChange(await fileService.getFiles());

        toast({
          title: 'File uploaded',
          description: `${file.name} has been uploaded successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload one or more files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [onFilesChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFileSelect(selectedFiles);
    e.target.value = '';
  }, [handleFileSelect]);

  const handleTypeChange = async (fileId: string, newType: string) => {
    fileService.updateFile(fileId, { fileType: newType as any });
    onFilesChange(await fileService.getFiles());
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
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
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-2">
            {dragOver ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            or click to select files
          </p>
          <p className="text-xs text-muted-foreground">
            Supports: PDF, DWG, DXF, IFC, RVT
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.dwg,.dxf,.ifc,.rvt"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {files.map((file) => (
          <div key={file.id} className="file-item">
            <div className="flex items-center space-x-3 flex-1">
              {getFileIcon(file.filename)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.fileSize)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select
                value={file.fileType}
                onValueChange={(value) => handleTypeChange(file.id, value)}
              >
                <SelectTrigger className="w-32 h-8">
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
              
              <span className={`file-type-badge ${getTypeBadgeClass(file.fileType)}`}>
                {file.fileType.replace('_', ' ')}
              </span>
              
              <span className={`status-indicator ${getStatusClass(file.status)}`}>
                {file.status === 'processing' && (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                )}
                {file.status}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteFile(file.id)}
                className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet</p>
          </div>
        )}
      </div>

      {/* Process Button */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleProcessFiles}
          disabled={files.length === 0 || processing || uploading}
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