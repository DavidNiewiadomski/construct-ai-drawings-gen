import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Trash2, 
  Lock, 
  Unlock, 
  Group, 
  Ungroup,
  MoreHorizontal,
  Move3D,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingPlacement } from '@/types';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  selectedBackings: BackingPlacement[];
  position: { x: number; y: number };
  onTypeChange: (backingIds: string[], newType: string) => void;
  onDuplicate: (backingIds: string[]) => void;
  onDelete: (backingIds: string[]) => void;
  onGroup: (backingIds: string[]) => void;
  onUngroup: (groupId: string) => void;
  onLock: (backingIds: string[], locked: boolean) => void;
  className?: string;
}

const BACKING_TYPES = [
  { value: '2x4', label: '2x4 Lumber', icon: '🪵' },
  { value: '2x6', label: '2x6 Lumber', icon: '🪵' },
  { value: '2x8', label: '2x8 Lumber', icon: '🪵' },
  { value: '2x10', label: '2x10 Lumber', icon: '🪵' },
  { value: '3/4_plywood', label: '3/4" Plywood', icon: '📄' },
  { value: 'steel_plate', label: 'Steel Plate', icon: '🔩' },
  { value: 'blocking', label: 'Blocking', icon: '🧱' }
];

export function QuickActions({
  selectedBackings,
  position,
  onTypeChange,
  onDuplicate,
  onDelete,
  onGroup,
  onUngroup,
  onLock,
  className
}: QuickActionsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Show/hide based on selection
  useEffect(() => {
    setIsVisible(selectedBackings.length > 0);
    
    // Check if any selected backings are locked
    const hasLockedBacking = selectedBackings.some(backing => 
      (backing as any).locked === true
    );
    setIsLocked(hasLockedBacking);
  }, [selectedBackings]);

  if (!isVisible || selectedBackings.length === 0) {
    return null;
  }

  const selectedIds = selectedBackings.map(b => b.id);
  const isMultiSelect = selectedBackings.length > 1;
  const commonType = isMultiSelect ? 
    (selectedBackings.every(b => b.backingType === selectedBackings[0].backingType) 
      ? selectedBackings[0].backingType 
      : null) 
    : selectedBackings[0].backingType;

  const handleTypeChange = (newType: string) => {
    onTypeChange(selectedIds, newType);
  };

  const handleDuplicate = () => {
    onDuplicate(selectedIds);
  };

  const handleDelete = () => {
    onDelete(selectedIds);
  };

  const handleGroup = () => {
    if (isMultiSelect) {
      onGroup(selectedIds);
    }
  };

  const handleLockToggle = () => {
    onLock(selectedIds, !isLocked);
    setIsLocked(!isLocked);
  };

  return (
    <div 
      className={cn(
        "fixed z-50 bg-background border rounded-lg shadow-lg p-2 animate-scale-in",
        "flex items-center gap-1 min-w-max",
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y - 60}px`, // Position above the selection
      }}
    >
      {/* Selection indicator */}
      <Badge variant="secondary" className="text-xs mr-2">
        {selectedBackings.length} selected
      </Badge>

      {/* Type change dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2">
            <Settings className="w-3 h-3 mr-1" />
            {commonType ? BACKING_TYPES.find(t => t.value === commonType)?.label || commonType : 'Mixed'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Change Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {BACKING_TYPES.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className="flex items-center gap-2"
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
              {commonType === type.value && (
                <Badge variant="outline" className="ml-auto text-xs">Current</Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Duplicate button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDuplicate}
        className="h-8 px-2"
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="w-3 h-3" />
      </Button>

      {/* Group/Ungroup button */}
      {isMultiSelect && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGroup}
          className="h-8 px-2"
          title="Group selected"
        >
          <Group className="w-3 h-3" />
        </Button>
      )}

      {/* Lock/Unlock button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLockToggle}
        className={cn(
          "h-8 px-2",
          isLocked && "bg-orange-100 text-orange-600 border-orange-200"
        )}
        title={isLocked ? "Unlock position" : "Lock position"}
      >
        {isLocked ? (
          <Lock className="w-3 h-3" />
        ) : (
          <Unlock className="w-3 h-3" />
        )}
      </Button>

      {/* More actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>More Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => {}}>
            <Move3D className="w-4 h-4 mr-2" />
            Edit Properties
          </DropdownMenuItem>
          
          {isMultiSelect && (
            <>
              <DropdownMenuItem onClick={() => {}}>
                <Group className="w-4 h-4 mr-2" />
                Align Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Group className="w-4 h-4 mr-2" />
                Align Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Group className="w-4 h-4 mr-2" />
                Align Right
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <Group className="w-4 h-4 mr-2" />
                Distribute Horizontally
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Group className="w-4 h-4 mr-2" />
                Distribute Vertically
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete button (prominent) */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="h-8 px-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
        title="Delete (Del)"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

// Hook for managing quick actions state
export function useQuickActions(selectedBackingIds: string[]) {
  const { 
    backings, 
    updateBacking, 
    deleteBacking, 
    addBacking 
  } = useViewerStore();
  
  const selectedBackings = backings.filter(b => 
    selectedBackingIds.includes(b.id)
  );

  const handleTypeChange = (backingIds: string[], newType: string) => {
    backingIds.forEach(id => {
      updateBacking(id, { backingType: newType as any });
    });
  };

  const handleDuplicate = (backingIds: string[]) => {
    backingIds.forEach(id => {
      const original = backings.find(b => b.id === id);
      if (original) {
        const duplicate: BackingPlacement = {
          ...original,
          id: crypto.randomUUID(),
          location: {
            ...original.location,
            x: original.location.x + 24, // Offset by 2 feet
            y: original.location.y + 24
          }
        };
        addBacking(duplicate);
      }
    });
  };

  const handleDelete = (backingIds: string[]) => {
    backingIds.forEach(id => {
      deleteBacking(id);
    });
  };

  const handleGroup = (backingIds: string[]) => {
    // TODO: Implement grouping logic
    console.log('Group backings:', backingIds);
  };

  const handleUngroup = (groupId: string) => {
    // TODO: Implement ungrouping logic
    console.log('Ungroup:', groupId);
  };

  const handleLock = (backingIds: string[], locked: boolean) => {
    backingIds.forEach(id => {
      updateBacking(id, { locked } as any);
    });
  };

  return {
    selectedBackings,
    handleTypeChange,
    handleDuplicate,
    handleDelete,
    handleGroup,
    handleUngroup,
    handleLock
  };
}