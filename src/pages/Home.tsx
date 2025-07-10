import { useState, useEffect } from 'react';
import { FileUploadPanel } from '@/components/upload/FileUploadPanel';
import { DrawingViewer } from '@/components/viewer/DrawingViewer';
import { MobileViewer } from '@/components/mobile/MobileViewer';
import { HelpSystem } from '@/components/common/HelpSystem';
import { KeyboardShortcuts, useKeyboardShortcuts } from '@/components/common/KeyboardShortcuts';
import { ErrorBoundary } from '@/utils/errorHandling';
import { UploadedFile, BackingPlacement } from '@/types';
import { FileService } from '@/services/fileService';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { HelpCircle, Keyboard } from 'lucide-react';

const fileService = new FileService();

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [backings, setBackings] = useState<BackingPlacement[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [startTutorial, setStartTutorial] = useState(false);
  
  const isMobile = useIsMobile();
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

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
      
      // Load demo backing placements if available
      const demoData = localStorage.getItem('demo-project');
      if (demoData) {
        const demo = JSON.parse(demoData);
        if (demo.backings && Array.isArray(demo.backings)) {
          setBackings(demo.backings);
        }
      }
    };
    loadFiles();
    
    // Listen for demo data changes
    const handleStorageChange = () => {
      loadFiles();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('demoLoaded', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('demoLoaded', handleStorageChange);
    };
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

  const handleStartTutorial = () => {
    setShowHelp(true);
    setStartTutorial(true);
  };

  return (
    <ErrorBoundary>
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
              
              <div className="flex items-center space-x-3">
                {/* Help & Tutorial buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShortcuts(true)}
                  className="hidden sm:flex"
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Shortcuts
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHelp(true)}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>

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
          </div>
        </header>

        {/* Main Content */}
        {isMobile ? (
          // Mobile Layout
          <MobileViewer
            drawingUrl={selectedFile?.fileUrl}
            backings={backings}
            onBackingsChange={setBackings}
          />
        ) : (
          // Desktop Layout
          <div className="flex h-[calc(100vh-80px)]">
            {/* Left Panel - File Upload (30% width) */}
            <div className="w-[30%] min-w-[400px]">
              <FileUploadPanel 
                files={files} 
                onFilesChange={setFiles}
                onStartTutorial={handleStartTutorial}
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
        )}

        {/* Help System */}
        <HelpSystem
          isOpen={showHelp}
          onClose={() => {
            setShowHelp(false);
            setStartTutorial(false);
          }}
          startTutorial={startTutorial}
        />

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </div>
    </ErrorBoundary>
  );
}