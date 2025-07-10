import React, { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Cloud, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  lastSaved?: Date;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  error?: string | null;
  isOnline?: boolean;
  className?: string;
}

export function AutoSaveIndicator({
  lastSaved,
  isSaving = false,
  hasUnsavedChanges = false,
  error = null,
  isOnline = true,
  className
}: AutoSaveIndicatorProps) {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Show save confirmation briefly when save completes
  useEffect(() => {
    if (!isSaving && !hasUnsavedChanges && !error && lastSaved) {
      setShowSaveConfirmation(true);
      const timer = setTimeout(() => setShowSaveConfirmation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, hasUnsavedChanges, error, lastSaved]);

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline',
        variant: 'secondary' as const,
        description: 'Changes will be saved when online'
      };
    }

    if (error) {
      return {
        icon: AlertCircle,
        text: 'Save Error',
        variant: 'destructive' as const,
        description: error
      };
    }

    if (isSaving) {
      return {
        icon: Save,
        text: 'Saving...',
        variant: 'secondary' as const,
        description: 'Saving changes'
      };
    }

    if (showSaveConfirmation) {
      return {
        icon: Check,
        text: 'Saved',
        variant: 'default' as const,
        description: 'All changes saved'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: Save,
        text: 'Unsaved',
        variant: 'outline' as const,
        description: 'You have unsaved changes'
      };
    }

    if (lastSaved) {
      const timeDiff = Date.now() - lastSaved.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      const seconds = Math.floor((timeDiff % 60000) / 1000);
      
      let timeText = '';
      if (minutes > 0) {
        timeText = `${minutes}m ago`;
      } else if (seconds > 0) {
        timeText = `${seconds}s ago`;
      } else {
        timeText = 'just now';
      }

      return {
        icon: Cloud,
        text: `Saved ${timeText}`,
        variant: 'secondary' as const,
        description: `Last saved ${lastSaved.toLocaleTimeString()}`
      };
    }

    return {
      icon: Save,
      text: 'Not saved',
      variant: 'outline' as const,
      description: 'No saves yet'
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div 
      className={cn("flex items-center gap-2", className)}
      title={status.description}
    >
      <Badge 
        variant={status.variant}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 text-xs font-medium transition-all",
          isSaving && "animate-pulse",
          showSaveConfirmation && "animate-scale-in",
          error && "animate-shake"
        )}
      >
        <Icon 
          className={cn(
            "w-3 h-3",
            isSaving && "animate-spin",
            showSaveConfirmation && "text-green-600",
            status.variant === 'destructive' && "text-red-600"
          )} 
        />
        <span>{status.text}</span>
      </Badge>

      {/* Connection status indicator */}
      {!isOnline && (
        <Badge variant="outline" className="text-xs">
          <WifiOff className="w-3 h-3" />
        </Badge>
      )}
    </div>
  );
}

// Hook for managing auto-save state
export function useAutoSave() {
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const save = async (saveFunction: () => Promise<void>) => {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await saveFunction();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const markAsChanged = () => {
    setHasUnsavedChanges(true);
    setError(null);
  };

  return {
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    error,
    isOnline,
    save,
    markAsChanged,
    setError
  };
}