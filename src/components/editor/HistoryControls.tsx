import React, { useState } from 'react';
import { 
  RotateCcw, 
  RotateCw, 
  History, 
  ChevronDown,
  Clock,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  undoAction?: string | null;
  redoAction?: string | null;
  undoDescription?: string | null;
  redoDescription?: string | null;
  historySize: number;
  currentAction?: string;
  currentDescription?: string;
  onUndo: () => void;
  onRedo: () => void;
  onJumpToHistory?: (index: number) => void;
  className?: string;
  showHistoryPanel?: boolean;
  historyEntries?: Array<{
    action?: string;
    description?: string;
    timestamp: number;
  }>;
}

export function HistoryControls({
  canUndo,
  canRedo,
  undoAction,
  redoAction,
  undoDescription,
  redoDescription,
  historySize,
  currentAction,
  currentDescription,
  onUndo,
  onRedo,
  onJumpToHistory,
  className,
  showHistoryPanel = true,
  historyEntries = []
}: HistoryControlsProps) {
  const [showHistoryPopover, setShowHistoryPopover] = useState(false);

  const formatActionName = (action?: string | null) => {
    if (!action) return '';
    
    const actionMap: Record<string, string> = {
      'add': 'Add Backing',
      'delete': 'Delete Backing',
      'move': 'Move Backing',
      'duplicate': 'Duplicate Backing',
      'paste': 'Paste Backing',
      'align': 'Align Backings',
      'distribute': 'Distribute Backings',
      'resize': 'Resize Backing',
      'rotate': 'Rotate Backing',
      'type-change': 'Change Type',
      'initial': 'Initial State'
    };
    
    return actionMap[action] || action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Undo Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className={cn(
          "flex items-center gap-1.5 transition-all",
          canUndo && "hover:bg-blue-50 hover:border-blue-200"
        )}
        title={undoAction ? `Undo: ${formatActionName(undoAction)}` : 'Undo (Ctrl+Z)'}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Undo</span>
        {canUndo && undoAction && (
          <Badge variant="secondary" className="text-xs px-1 py-0 ml-1">
            {formatActionName(undoAction)}
          </Badge>
        )}
      </Button>

      {/* Redo Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className={cn(
          "flex items-center gap-1.5 transition-all",
          canRedo && "hover:bg-green-50 hover:border-green-200"
        )}
        title={redoAction ? `Redo: ${formatActionName(redoAction)}` : 'Redo (Ctrl+Y)'}
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Redo</span>
        {canRedo && redoAction && (
          <Badge variant="secondary" className="text-xs px-1 py-0 ml-1">
            {formatActionName(redoAction)}
          </Badge>
        )}
      </Button>

      {/* History Panel Toggle */}
      {showHistoryPanel && (
        <Popover open={showHistoryPopover} onOpenChange={setShowHistoryPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              title="History Panel"
            >
              <History className="w-3.5 h-3.5" />
              <Badge variant="outline" className="text-xs">
                {historySize}
              </Badge>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 border-b">
              <h4 className="font-medium flex items-center gap-2">
                <History className="w-4 h-4" />
                History Timeline
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {historySize} action{historySize !== 1 ? 's' : ''} recorded
              </p>
            </div>
            
            <div className="max-h-64 overflow-auto">
              {historyEntries.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No history available</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {/* Current State */}
                  <div 
                    className="flex items-center gap-3 p-2 rounded bg-primary/10 border border-primary/20"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {formatActionName(currentAction) || 'Current State'}
                      </div>
                      {currentDescription && (
                        <div className="text-xs text-muted-foreground truncate">
                          {currentDescription}
                        </div>
                      )}
                    </div>
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  </div>
                  
                  {/* History Entries */}
                  {historyEntries.slice().reverse().map((entry, index) => {
                    const historyIndex = historyEntries.length - 1 - index;
                    
                    return (
                      <div
                        key={historyIndex}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                          "hover:bg-muted/50"
                        )}
                        onClick={() => {
                          onJumpToHistory?.(historyIndex);
                          setShowHistoryPopover(false);
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            {formatActionName(entry.action)}
                          </div>
                          {entry.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {entry.description}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {historySize > 0 && (
              <>
                <Separator />
                <div className="p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  Click any item to jump to that state
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// Toast notifications for history actions
export function showHistoryToast(
  action: 'undo' | 'redo',
  actionName?: string,
  toast?: any
) {
  if (!toast) return;

  const isUndo = action === 'undo';
  const title = isUndo ? 'Undone' : 'Redone';
  const description = actionName 
    ? `${isUndo ? 'Undid' : 'Redid'}: ${actionName}`
    : `Action ${isUndo ? 'undone' : 'redone'}`;

  toast({
    title,
    description,
    duration: 2000,
  });
}