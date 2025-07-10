import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  SortAsc, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit,
  MoreHorizontal,
  Square,
  CheckSquare,
  Package,
  Layers,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingPlacement } from '@/types';

interface BackingListItem {
  id: string;
  type: string;
  dimensions: string;
  location: string;
  floor: string;
  status: 'ai_generated' | 'user_modified' | 'approved';
  visible: boolean;
}

interface BackingListPanelProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

type SortOption = 'type' | 'location' | 'size';

const BACKING_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '2x4': Square,
  '2x6': Square,
  '2x8': Square,
  '2x10': Square,
  '3/4_plywood': Layers,
  'steel_plate': Package,
  'blocking': Square,
};

const STATUS_COLORS: Record<string, string> = {
  ai_generated: 'bg-blue-500',
  user_modified: 'bg-orange-500',
  approved: 'bg-green-500',
};

export function BackingListPanel({ isCollapsed = false, onToggle }: BackingListPanelProps) {
  const { 
    backings, 
    selectedBackingId, 
    selectBacking, 
    deleteBacking,
    updateBacking,
    setZoom,
    setPan
  } = useViewerStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('type');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hiddenBackings, setHiddenBackings] = useState<Set<string>>(new Set());
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set(['Floor 1']));

  // Convert BackingPlacement to BackingListItem
  const backingListItems = useMemo(() => {
    return backings.map((backing): BackingListItem => ({
      id: backing.id,
      type: backing.backingType,
      dimensions: `${backing.dimensions.width}"x${backing.dimensions.height}"x${backing.dimensions.thickness}" @ ${backing.location.z}" AFF`,
      location: `X:${backing.location.x.toFixed(1)}, Y:${backing.location.y.toFixed(1)}`,
      floor: `Floor ${Math.ceil(backing.location.z / 120)}`, // Approximate floor based on height
      status: backing.status,
      visible: !hiddenBackings.has(backing.id)
    }));
  }, [backings, hiddenBackings]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = backingListItems.filter(item =>
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dimensions.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.floor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'type':
          return a.type.localeCompare(b.type);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'size':
          const aSize = parseFloat(a.dimensions.split('x')[0]);
          const bSize = parseFloat(b.dimensions.split('x')[0]);
          return aSize - bSize;
        default:
          return 0;
      }
    });

    return filtered;
  }, [backingListItems, searchQuery, sortBy]);

  // Group by floor
  const groupedByFloor = useMemo(() => {
    const groups: Record<string, BackingListItem[]> = {};
    filteredAndSortedItems.forEach(item => {
      if (!groups[item.floor]) {
        groups[item.floor] = [];
      }
      groups[item.floor].push(item);
    });
    return groups;
  }, [filteredAndSortedItems]);

  const handleItemClick = (item: BackingListItem) => {
    selectBacking(item.id);
    
    // Zoom to backing (simplified implementation)
    const backing = backings.find(b => b.id === item.id);
    if (backing) {
      setPan({ 
        x: -backing.location.x + 400, 
        y: -backing.location.y + 300 
      });
      setZoom(2);
    }
  };

  const handleItemDoubleClick = (item: BackingListItem) => {
    // TODO: Open properties editor
    console.log('Edit backing:', item.id);
  };

  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const toggleItemVisibility = (id: string) => {
    const newHidden = new Set(hiddenBackings);
    if (newHidden.has(id)) {
      newHidden.delete(id);
    } else {
      newHidden.add(id);
    }
    setHiddenBackings(newHidden);
  };

  const toggleFloorExpansion = (floor: string) => {
    const newExpanded = new Set(expandedFloors);
    if (newExpanded.has(floor)) {
      newExpanded.delete(floor);
    } else {
      newExpanded.add(floor);
    }
    setExpandedFloors(newExpanded);
  };

  const selectAllVisible = () => {
    const visibleIds = filteredAndSortedItems
      .filter(item => item.visible)
      .map(item => item.id);
    setSelectedItems(new Set(visibleIds));
  };

  const hideSelected = () => {
    const newHidden = new Set(hiddenBackings);
    selectedItems.forEach(id => newHidden.add(id));
    setHiddenBackings(newHidden);
    setSelectedItems(new Set());
  };

  const showSelected = () => {
    const newHidden = new Set(hiddenBackings);
    selectedItems.forEach(id => newHidden.delete(id));
    setHiddenBackings(newHidden);
    setSelectedItems(new Set());
  };

  const deleteSelected = () => {
    selectedItems.forEach(id => deleteBacking(id));
    setSelectedItems(new Set());
  };

  const changeTypeForSelected = (newType: string) => {
    selectedItems.forEach(id => {
      updateBacking(id, { backingType: newType as any });
    });
    setSelectedItems(new Set());
  };

  const getStatusIndicator = (status: string) => (
    <div 
      className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] || 'bg-gray-500'}`} 
      title={status.replace('_', ' ')}
    />
  );

  const getBackingIcon = (type: string) => {
    const IconComponent = BACKING_TYPE_ICONS[type] || Package;
    return <IconComponent className="w-4 h-4 text-muted-foreground" />;
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-background flex flex-col items-center py-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggle}
          className="mb-4"
        >
          <Layers className="w-4 h-4" />
        </Button>
        <div className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
          {backings.length} items
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Backing List</h3>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggle}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search backings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <SortAsc className="w-3 h-3 mr-1" />
                Sort: {sortBy}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'type'}
                onCheckedChange={() => setSortBy('type')}
              >
                Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'location'}
                onCheckedChange={() => setSortBy('location')}
              >
                Location
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'size'}
                onCheckedChange={() => setSortBy('size')}
              >
                Size
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuCheckboxItem onCheckedChange={selectAllVisible}>
                Select All Visible
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem 
                onCheckedChange={hideSelected}
                disabled={selectedItems.size === 0}
              >
                Hide Selected
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                onCheckedChange={showSelected}
                disabled={selectedItems.size === 0}
              >
                Show Selected
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem 
                onCheckedChange={deleteSelected}
                disabled={selectedItems.size === 0}
                className="text-destructive"
              >
                Delete Selected
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Item Count */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-b">
        {filteredAndSortedItems.length} of {backings.length} backings
        {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-auto">
        {Object.entries(groupedByFloor).map(([floor, items]) => (
          <Collapsible
            key={floor}
            open={expandedFloors.has(floor)}
            onOpenChange={() => toggleFloorExpansion(floor)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer border-b">
                <div className="flex items-center gap-2">
                  {expandedFloors.has(floor) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium text-sm">{floor}</span>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 pl-6 text-sm hover:bg-muted/50 cursor-pointer border-b border-muted/30 ${
                    selectedBackingId === item.id ? 'bg-primary/10 border-primary/20' : ''
                  }`}
                  onClick={() => handleItemClick(item)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                >
                  {/* Selection Checkbox */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-4 h-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemSelection(item.id);
                    }}
                  >
                    {selectedItems.has(item.id) ? (
                      <CheckSquare className="w-3 h-3" />
                    ) : (
                      <Square className="w-3 h-3" />
                    )}
                  </Button>

                  {/* Type Icon */}
                  {getBackingIcon(item.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.type}</span>
                      {getStatusIndicator(item.status)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.dimensions}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.location}
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-4 h-4 p-0 opacity-60 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemVisibility(item.id);
                    }}
                  >
                    {item.visible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t bg-muted/20 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Total: {backings.length}</span>
          <span>Hidden: {hiddenBackings.size}</span>
        </div>
      </div>
    </div>
  );
}