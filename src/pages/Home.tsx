import { useState, useEffect } from 'react';
import { FileUploadPanel } from '@/components/upload/FileUploadPanel';
import { DrawingViewer } from '@/components/viewer/DrawingViewer';
import { UploadedFile, BackingPlacement } from '@/types';
import { FileService } from '@/services/fileService';

const fileService = new FileService();

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [backings, setBackings] = useState<BackingPlacement[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  useEffect(() => {
    // Load existing files on component mount
    const loadFiles = async () => {
      const existingFiles = await fileService.getFiles();
      setFiles(existingFiles);
      
      // Auto-select first ready file
      const readyFile = existingFiles.find(f => f.status === 'ready');
      if (readyFile) {
        setSelectedFile(readyFile);
      }
    };
    loadFiles();
  }, []);

  // Auto-select first ready file when files change
  useEffect(() => {
    if (!selectedFile) {
      const readyFile = files.find(f => f.status === 'ready');
      if (readyFile) {
        setSelectedFile(readyFile);
      }
    }
  }, [files, selectedFile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                AI Backing Drawing Generator
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload construction drawings and generate AI-powered backing placement recommendations
              </p>
            </div>
            
            {selectedFile && (
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {selectedFile.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile.fileType.replace('_', ' ')} • {selectedFile.status}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - File Upload (30% width) */}
        <div className="w-[30%] min-w-[400px]">
          <FileUploadPanel 
            files={files} 
            onFilesChange={setFiles}
          />
        </div>

        {/* Right Panel - Drawing Viewer (70% width) */}
        <div className="flex-1">
          <DrawingViewer
            drawingUrl={selectedFile?.fileUrl}
            backings={backings}
            onBackingsChange={setBackings}
          />
        </div>
      </div>
    </div>
  );
}