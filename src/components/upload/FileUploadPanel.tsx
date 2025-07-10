import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Upload, Loader2, AlertCircle, Clock, Trash2, Play, FileText, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types';
import { useUploadStore } from '@/stores/uploadStore';
import { DraggableFileCard } from './DraggableFileCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FilePreview } from './FilePreview';
import { DemoMode } from '@/components/demo/DemoMode';

interface FileUploadPanelProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onStartTutorial?: () => void;
}

export function FileUploadPanel({ files, onFilesChange, onStartTutorial }: FileUploadPanelProps) {
  const { toast } = useToast();
  const {
    files: uploadFiles,
    isUploading,
    isProcessing,
    totalProgress,
    addFiles,
    removeFile,
    updateFileType,
    reorderFiles,
    clearAll,
    processReadyFiles,
  } = useUploadStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      await addFiles(acceptedFiles);
      toast({
        title: 'Files added',
        description: `${acceptedFiles.length} file(s) added to upload queue.`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to add files. Please try again.',
        variant: 'destructive',
      });
    }
  }, [addFiles, toast]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = uploadFiles.findIndex(file => file.id === active.id);
      const newIndex = uploadFiles.findIndex(file => file.id === over?.id);
      reorderFiles(oldIndex, newIndex);
    }
  };

  const handleDeleteFile = (id: string) => {
    removeFile(id);
    toast({
      title: 'File removed',
      description: 'File has been removed from the upload queue.',
    });
  };

  const handleProcessFiles = async () => {
    const readyFiles = uploadFiles.filter(f => f.status === 'ready');
    
    if (readyFiles.length === 0) {
      toast({
        title: 'No files to process',
        description: 'Please wait for files to finish uploading before processing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await processReadyFiles();
      toast({
        title: 'Processing complete',
        description: `Successfully processed ${readyFiles.length} files.`,
      });
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'Failed to process files. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClearAll = () => {
    clearAll();
    toast({
      title: 'Queue cleared',
      description: 'All files have been removed from the upload queue.',
    });
  };

  // Calculate batch summary
  const totalFiles = uploadFiles.length;
  const totalSize = uploadFiles.reduce((sum, file) => sum + file.size, 0);
  const estimatedTime = Math.max(1, Math.ceil(totalFiles * 2.5)); // 2.5 minutes per file estimate
  const readyFiles = uploadFiles.filter(f => f.status === 'ready').length;
  const canProcess = readyFiles > 0 && !isProcessing && !isUploading;

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
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-300 ease-in-out
            ${isDragActive 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className={`transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
            <Upload className={`h-10 w-10 mx-auto mb-4 transition-colors duration-300 ${
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            }`} />
            
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
      </div>

      {/* Batch Upload Summary */}
      {totalFiles > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-muted/50 rounded-lg p-3 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Batch Upload Summary</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive h-7 px-2 hover-scale"
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
              <Alert className="animate-fade-in">
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
                className="flex-1 bg-primary hover:bg-primary/90 hover-scale"
                size="sm"
              >
                {isProcessing ? (
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
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Upload Queue</h3>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={uploadFiles.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uploadFiles.map((file) => (
                      <DraggableFileCard
                        key={file.id}
                        file={file}
                        onTypeChange={updateFileType}
                        onDelete={handleDeleteFile}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
          
          {/* Processed files */}
          {files.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-sm font-medium text-muted-foreground">
                Processed Files ({files.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {files.map((file) => (
                  <div key={file.id} className="hover-scale">
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
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Empty state with Demo Mode */}
          {files.length === 0 && uploadFiles.length === 0 && (
            <div className="space-y-6 animate-fade-in">
              {/* Demo Mode Component */}
              <DemoMode />
              
              {/* Or Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              {/* Upload Help */}
              <div className="text-center py-6 text-muted-foreground">
                <div className="relative mb-6">
                  <FolderOpen className="h-16 w-16 mx-auto opacity-30" />
                  <FileText className="h-8 w-8 absolute top-2 right-4 opacity-20" />
                </div>
                <h3 className="text-lg font-medium mb-2">Upload your own files</h3>
                <p className="text-sm mb-4">
                  Get started by dragging and dropping your construction drawings
                </p>
                <div className="space-y-2 text-xs">
                  <p>✓ PDF drawings with detailed plans</p>
                  <p>✓ CAD files (DWG, DXF, IFC, RVT)</p>
                  <p>✓ Up to 100MB per file</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}