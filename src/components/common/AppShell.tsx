import { useState, useEffect, ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { HelpSystem } from './HelpSystem';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.addEventListener('updatefound', () => {
          setUpdateAvailable(true);
        });
      }).catch(error => {
        console.log('Service Worker registration failed:', error);
      });
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const isInputFocused = () => {
      const activeElement = document.activeElement;
      return activeElement?.tagName === 'INPUT' || 
             activeElement?.tagName === 'TEXTAREA' || 
             activeElement?.contentEditable === 'true';
    };

    const handleKeyboard = (e: KeyboardEvent) => {
      // Show shortcuts with ?
      if (e.key === '?' && !isInputFocused()) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Show help with F1
      if (e.key === 'F1') {
        e.preventDefault();
        setShowHelp(true);
      }
      // Save with Ctrl+S
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        toast.success('Project saved automatically');
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [toast]);

  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Update notification banner */}
      {updateAvailable && (
        <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              🎉 New version available!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleUpdate}
            >
              Update Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUpdateAvailable(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Main app content */}
      {children}
      
      {/* Global modals */}
      {showShortcuts && (
        <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
      )}
      
      {showHelp && (
        <HelpSystem onClose={() => setShowHelp(false)} />
      )}
      
      {/* Toast notifications */}
      <Toaster 
        position="bottom-right" 
        theme="system"
        richColors
        closeButton
      />
    </div>
  );
}