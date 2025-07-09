import { useState, useEffect } from 'react';
import { FileUploadPanel } from '@/components/upload/FileUploadPanel';
import { UploadedFile } from '@/types';
import { FileService } from '@/services/fileService';

const fileService = new FileService();

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    // Load existing files on component mount
    const loadFiles = async () => {
      const existingFiles = await fileService.getFiles();
      setFiles(existingFiles);
    };
    loadFiles();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            AI Backing Drawing Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload construction drawings and generate AI-powered backing placement recommendations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - File Upload (30% width) */}
        <div className="w-[30%] min-w-[400px]">
          <FileUploadPanel files={files} onFilesChange={setFiles} />
        </div>

        {/* Right Panel - Drawing Viewer (70% width) */}
        <div className="flex-1 bg-muted/30">
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Drawing Viewer
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload and process your construction drawings to view them here. 
                The AI will detect components and suggest backing placements.
              </p>
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Start by uploading your first drawing file
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-primary">
                    {files.length} file(s) uploaded
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Process your files to begin component detection
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}