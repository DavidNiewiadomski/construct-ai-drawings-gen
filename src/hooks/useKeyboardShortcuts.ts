import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onEscape?: () => void;
  // Tool shortcuts
  onSelectTool?: () => void;
  onPanTool?: () => void;
  onMeasureTool?: () => void;
  onAddTool?: () => void;
  // View shortcuts
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onZoomReset?: () => void;
  // Grid shortcuts
  onToggleGrid?: () => void;
  // Alignment shortcuts
  onAlignLeft?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignBottom?: () => void;
  onAlignCenterHorizontal?: () => void;
  onAlignCenterVertical?: () => void;
  // Quick access
  onOpenProjectManager?: () => void;
  onNewProject?: () => void;
  // Disabled when typing in inputs
  enabled?: boolean;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const {
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onDuplicate,
    onSave,
    onDelete,
    onSelectAll,
    onEscape,
    onSelectTool,
    onPanTool,
    onMeasureTool,
    onAddTool,
    onZoomIn,
    onZoomOut,
    onZoomFit,
    onZoomReset,
    onToggleGrid,
    onAlignLeft,
    onAlignRight,
    onAlignTop,
    onAlignBottom,
    onAlignCenterHorizontal,
    onAlignCenterVertical,
    onOpenProjectManager,
    onNewProject,
    enabled = true
  } = config;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (!enabled || isTypingInInput(e.target)) {
      return;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    // Handle different key combinations
    if (isCtrlOrCmd && !isShift && !isAlt) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          onUndo?.();
          break;
        case 'y':
          e.preventDefault();
          onRedo?.();
          break;
        case 'c':
          e.preventDefault();
          onCopy?.();
          break;
        case 'v':
          e.preventDefault();
          onPaste?.();
          break;
        case 'd':
          e.preventDefault();
          onDuplicate?.();
          break;
        case 's':
          e.preventDefault();
          onSave?.();
          break;
        case 'a':
          e.preventDefault();
          onSelectAll?.();
          break;
        case 'o':
          e.preventDefault();
          onOpenProjectManager?.();
          break;
        case 'n':
          e.preventDefault();
          onNewProject?.();
          break;
        case '=':
        case '+':
          e.preventDefault();
          onZoomIn?.();
          break;
        case '-':
          e.preventDefault();
          onZoomOut?.();
          break;
        case '0':
          e.preventDefault();
          onZoomReset?.();
          break;
        case '9':
          e.preventDefault();
          onZoomFit?.();
          break;
        case 'g':
          e.preventDefault();
          onToggleGrid?.();
          break;
      }
    } 
    // Ctrl+Shift combinations
    else if (isCtrlOrCmd && isShift && !isAlt) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          onRedo?.();
          break;
        // Alignment shortcuts
        case 'l':
          e.preventDefault();
          onAlignLeft?.();
          break;
        case 'r':
          e.preventDefault();
          onAlignRight?.();
          break;
        case 't':
          e.preventDefault();
          onAlignTop?.();
          break;
        case 'b':
          e.preventDefault();
          onAlignBottom?.();
          break;
        case 'h':
          e.preventDefault();
          onAlignCenterHorizontal?.();
          break;
        case 'v':
          e.preventDefault();
          onAlignCenterVertical?.();
          break;
      }
    }
    // Single key shortcuts (no modifiers)
    else if (!isCtrlOrCmd && !isShift && !isAlt) {
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onDelete?.();
          break;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
        // Tool shortcuts
        case 'v':
        case 'V':
          e.preventDefault();
          onSelectTool?.();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          onPanTool?.();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          onMeasureTool?.();
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          onAddTool?.();
          break;
      }
    }
  }, [
    enabled,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onDuplicate,
    onSave,
    onDelete,
    onSelectAll,
    onEscape,
    onSelectTool,
    onPanTool,
    onMeasureTool,
    onAddTool,
    onZoomIn,
    onZoomOut,
    onZoomFit,
    onZoomReset,
    onToggleGrid,
    onAlignLeft,
    onAlignRight,
    onAlignTop,
    onAlignBottom,
    onAlignCenterHorizontal,
    onAlignCenterVertical,
    onOpenProjectManager,
    onNewProject
  ]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  // Return the shortcut info for display purposes
  return {
    shortcuts: [
      { key: 'Ctrl+Z', description: 'Undo' },
      { key: 'Ctrl+Y', description: 'Redo' },
      { key: 'Ctrl+C', description: 'Copy' },
      { key: 'Ctrl+V', description: 'Paste' },
      { key: 'Ctrl+D', description: 'Duplicate' },
      { key: 'Ctrl+S', description: 'Save' },
      { key: 'Ctrl+A', description: 'Select All' },
      { key: 'Ctrl+O', description: 'Open Project' },
      { key: 'Ctrl+N', description: 'New Project' },
      { key: 'Delete', description: 'Delete Selected' },
      { key: 'Escape', description: 'Deselect' },
      { key: 'V', description: 'Select Tool' },
      { key: 'H', description: 'Pan Tool' },
      { key: 'M', description: 'Measure Tool' },
      { key: 'A', description: 'Add Tool' },
      { key: 'Ctrl++', description: 'Zoom In' },
      { key: 'Ctrl+-', description: 'Zoom Out' },
      { key: 'Ctrl+0', description: 'Reset Zoom' },
      { key: 'Ctrl+9', description: 'Fit to Screen' },
      { key: 'Ctrl+G', description: 'Toggle Grid' },
      { key: 'Ctrl+Shift+L', description: 'Align Left' },
      { key: 'Ctrl+Shift+R', description: 'Align Right' },
      { key: 'Ctrl+Shift+T', description: 'Align Top' },
      { key: 'Ctrl+Shift+B', description: 'Align Bottom' },
      { key: 'Ctrl+Shift+H', description: 'Center Horizontal' },
      { key: 'Ctrl+Shift+V', description: 'Center Vertical' }
    ]
  };
}

// Helper function to check if user is typing in an input field
function isTypingInInput(target: EventTarget | null): boolean {
  if (!target) return false;
  
  const element = target as HTMLElement;
  const tagName = element.tagName?.toLowerCase();
  
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.contentEditable === 'true' ||
    element.isContentEditable
  );
}