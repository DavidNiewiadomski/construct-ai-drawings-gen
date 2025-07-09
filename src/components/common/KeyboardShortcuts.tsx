import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    key: string;
    description: string;
    category?: string;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'File Operations',
    shortcuts: [
      { key: 'Ctrl+O', description: 'Open files' },
      { key: 'Ctrl+S', description: 'Save project' },
      { key: 'Ctrl+E', description: 'Export drawings' },
      { key: 'Ctrl+P', description: 'Print drawing' },
      { key: 'Ctrl+N', description: 'New project' },
    ]
  },
  {
    title: 'Edit Operations',
    shortcuts: [
      { key: 'Ctrl+Z', description: 'Undo last action' },
      { key: 'Ctrl+Y', description: 'Redo last action' },
      { key: 'Ctrl+C', description: 'Copy selected' },
      { key: 'Ctrl+V', description: 'Paste' },
      { key: 'Ctrl+X', description: 'Cut selected' },
      { key: 'Ctrl+A', description: 'Select all' },
      { key: 'Delete', description: 'Delete selected' },
      { key: 'Backspace', description: 'Delete selected' },
    ]
  },
  {
    title: 'Navigation',
    shortcuts: [
      { key: 'Space', description: 'Pan mode (hold and drag)' },
      { key: '+', description: 'Zoom in' },
      { key: '-', description: 'Zoom out' },
      { key: 'F', description: 'Fit to view' },
      { key: '0', description: 'Zoom to 100%' },
      { key: 'R', description: 'Rotate view' },
      { key: 'Arrow Keys', description: 'Pan view' },
    ]
  },
  {
    title: 'Tools & Modes',
    shortcuts: [
      { key: 'V', description: 'Select tool' },
      { key: 'B', description: 'Add backing tool' },
      { key: 'D', description: 'Dimension tool' },
      { key: 'T', description: 'Text/note tool' },
      { key: 'M', description: 'Measure tool' },
      { key: 'H', description: 'Hand/pan tool' },
      { key: 'L', description: 'Line tool' },
    ]
  },
  {
    title: 'View Controls',
    shortcuts: [
      { key: 'Tab', description: 'Toggle panels' },
      { key: 'G', description: 'Toggle grid' },
      { key: 'Ctrl+1', description: 'Original drawing' },
      { key: 'Ctrl+2', description: 'Backing overlay' },
      { key: 'Ctrl+3', description: 'Combined view' },
      { key: 'Alt+1', description: 'Layer controls' },
    ]
  },
  {
    title: 'Selection & Editing',
    shortcuts: [
      { key: 'Shift+Click', description: 'Multi-select' },
      { key: 'Ctrl+Click', description: 'Add to selection' },
      { key: 'Alt+Drag', description: 'Duplicate while dragging' },
      { key: 'Shift+Drag', description: 'Constrain movement' },
      { key: 'Enter', description: 'Confirm edit' },
      { key: 'Escape', description: 'Cancel operation' },
    ]
  },
  {
    title: 'Help & Interface',
    shortcuts: [
      { key: '?', description: 'Show this help dialog' },
      { key: 'F1', description: 'Open help system' },
      { key: 'F11', description: 'Toggle fullscreen' },
      { key: 'Ctrl+,', description: 'Open settings' },
    ]
  }
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Keyboard className="h-5 w-5 mr-2" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcutGroups.map((group, groupIndex) => (
            <Card key={groupIndex}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-foreground">{group.title}</h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Hold <Badge variant="outline" className="mx-1 text-xs">Shift</Badge> while using tools for additional options</li>
            <li>• Use <Badge variant="outline" className="mx-1 text-xs">Ctrl</Badge> for precision operations</li>
            <li>• <Badge variant="outline" className="mx-1 text-xs">Right-click</Badge> on any element for context menu</li>
            <li>• Press <Badge variant="outline" className="mx-1 text-xs">?</Badge> anytime to show this dialog</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Global keyboard shortcut handler hook
export function useKeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      // Help dialog
      if (event.key === '?' || event.key === 'F1') {
        event.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // File operations
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault();
            // Trigger save
            window.dispatchEvent(new CustomEvent('keyboard:save'));
            break;
          case 'o':
            event.preventDefault();
            // Trigger open
            window.dispatchEvent(new CustomEvent('keyboard:open'));
            break;
          case 'e':
            event.preventDefault();
            // Trigger export
            window.dispatchEvent(new CustomEvent('keyboard:export'));
            break;
          case 'z':
            event.preventDefault();
            // Trigger undo
            window.dispatchEvent(new CustomEvent('keyboard:undo'));
            break;
          case 'y':
            event.preventDefault();
            // Trigger redo
            window.dispatchEvent(new CustomEvent('keyboard:redo'));
            break;
        }
        return;
      }

      // Tool shortcuts
      switch (event.key.toLowerCase()) {
        case 'v':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:tool', { detail: 'select' }));
          break;
        case 'b':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:tool', { detail: 'backing' }));
          break;
        case 'd':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:tool', { detail: 'dimension' }));
          break;
        case 't':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:tool', { detail: 'text' }));
          break;
        case 'escape':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:cancel'));
          break;
        case 'delete':
        case 'backspace':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:delete'));
          break;
        case 'f':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:fit'));
          break;
        case '=':
        case '+':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:zoom', { detail: 'in' }));
          break;
        case '-':
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('keyboard:zoom', { detail: 'out' }));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    showShortcuts,
    setShowShortcuts
  };
}