import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Square, 
  Copy, 
  RotateCcw, 
  RotateCw, 
  Trash2,
  MousePointer,
  Move,
  AlignStartVertical,
  AlignCenterVertical, 
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Minus,
  Plus,
  Save,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingPropertiesPanel } from './BackingPropertiesPanel';
import { ViewerToolbar } from './ViewerToolbar';
import { PDFViewerLayer } from './PDFViewerLayer';
import { InteractiveOverlay } from './InteractiveOverlay';
import { MeasurementPanel } from './MeasurementPanel';
import { BackingPlacement as BackingType } from '@/types';
import { useDrawingViewer } from '@/hooks/useDrawingViewer';
import { usePanAndZoom } from '@/hooks/usePanAndZoom';
import { useBackingPlacement } from '@/hooks/useBackingPlacement';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { coordinateSystem } from '@/utils/coordinateSystem';
import { useToast } from '@/hooks/use-toast';

interface DrawingViewerProps {
  drawingUrl?: string;
  backings: BackingType[];
  onBackingsChange: (backings: BackingType[]) => void;
}

interface HistoryState {
  backings: BackingType[];
  timestamp: number;
}

export function DrawingViewer({ drawingUrl, backings, onBackingsChange }: DrawingViewerProps) {
  const { toast } = useToast();
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [currentMousePosition, setCurrentMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedBackings, setSelectedBackings] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<BackingType[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { tool: selectedTool, selectedBackingId: selectedBacking, layers, selectBacking } = useViewerStore();
  
  // Custom hooks for managing different aspects
  const {
    pdfContainerRef,
    pdfDimensions,
    currentPage,
    totalPages,
    isLoading,
    drawingOpacity,
    setDrawingOpacity,
    handleDocumentLoad,
    handlePageChange,
    handlePageNavigation,
    setDrawingUrl,
  } = useDrawingViewer();

  const {
    zoom,
    position,
    handleZoomToFit,
    handlePanMove,
    startPan,
    endPan,
    updateCoordinateSystem
  } = usePanAndZoom(stageSize, pdfDimensions);

  const { handleAddBacking, handleBackingUpdate } = useBackingPlacement(backings, onBackingsChange);

  // Measurement management
  const {
    measurements,
    selectedMeasurementId,
    isDrawingMeasurement,
    measurementStartPoint,
    startMeasurement,
    completeMeasurement,
    selectMeasurement,
    deleteMeasurement,
    clearAllMeasurements
  } = useMeasurements();

  // History management
  const addToHistory = useCallback((newBackings: BackingType[]) => {
    const newState: HistoryState = {
      backings: JSON.parse(JSON.stringify(newBackings)),
      timestamp: Date.now()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex]);

  // Enhanced backing change handler with history
  const handleBackingsChangeWithHistory = useCallback((newBackings: BackingType[]) => {
    addToHistory(backings); // Add current state to history before changing
    onBackingsChange(newBackings);
  }, [backings, onBackingsChange, addToHistory]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      const previousState = history[historyIndex];
      setHistoryIndex(historyIndex - 1);
      onBackingsChange(previousState.backings);
      toast({ title: "Undone", description: "Last action has been undone" });
    }
  }, [history, historyIndex, onBackingsChange, toast]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onBackingsChange(nextState.backings);
      toast({ title: "Redone", description: "Action has been redone" });
    }
  }, [history, historyIndex, onBackingsChange, toast]);

  // Copy selected backings
  const handleCopy = useCallback(() => {
    if (selectedBackings.length > 0) {
      const backingsToCopy = backings.filter(b => selectedBackings.includes(b.id));
      setClipboard(backingsToCopy);
      toast({ 
        title: "Copied", 
        description: `${backingsToCopy.length} backing${backingsToCopy.length === 1 ? '' : 's'} copied to clipboard` 
      });
    }
  }, [selectedBackings, backings, toast]);

  // Paste backings
  const handlePaste = useCallback(() => {
    if (clipboard.length > 0) {
      const newBackings = clipboard.map(backing => ({
        ...backing,
        id: `backing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        location: {
          ...backing.location,
          x: backing.location.x + 24, // Offset by 2 feet
          y: backing.location.y + 24
        }
      }));
      
      const updatedBackings = [...backings, ...newBackings];
      handleBackingsChangeWithHistory(updatedBackings);
      setSelectedBackings(newBackings.map(b => b.id));
      toast({ 
        title: "Pasted", 
        description: `${newBackings.length} backing${newBackings.length === 1 ? '' : 's'} pasted` 
      });
    }
  }, [clipboard, backings, handleBackingsChangeWithHistory, toast]);

  // Duplicate selected backings
  const handleDuplicate = useCallback(() => {
    if (selectedBackings.length > 0) {
      const backingsToDuplicate = backings.filter(b => selectedBackings.includes(b.id));
      const duplicatedBackings = backingsToDuplicate.map(backing => ({
        ...backing,
        id: `backing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        location: {
          ...backing.location,
          x: backing.location.x + 24, // Offset by 2 feet
          y: backing.location.y + 24
        }
      }));
      
      const updatedBackings = [...backings, ...duplicatedBackings];
      handleBackingsChangeWithHistory(updatedBackings);
      setSelectedBackings(duplicatedBackings.map(b => b.id));
      toast({ 
        title: "Duplicated", 
        description: `${duplicatedBackings.length} backing${duplicatedBackings.length === 1 ? '' : 's'} duplicated` 
      });
    }
  }, [selectedBackings, backings, handleBackingsChangeWithHistory, toast]);

  // Delete selected backings
  const handleDelete = useCallback(() => {
    if (selectedBackings.length > 0) {
      const updatedBackings = backings.filter(b => !selectedBackings.includes(b.id));
      handleBackingsChangeWithHistory(updatedBackings);
      setSelectedBackings([]);
      selectBacking(null);
      toast({ 
        title: "Deleted", 
        description: `${selectedBackings.length} backing${selectedBackings.length === 1 ? '' : 's'} deleted` 
      });
    }
  }, [selectedBackings, backings, handleBackingsChangeWithHistory, selectBacking, toast]);

  // Alignment functions
  const alignBackings = useCallback((alignment: 'left' | 'center-v' | 'right' | 'top' | 'center-h' | 'bottom') => {
    if (selectedBackings.length < 2) return;
    
    const selectedBackingData = backings.filter(b => selectedBackings.includes(b.id));
    
    let referenceValue: number;
    switch (alignment) {
      case 'left':
        referenceValue = Math.min(...selectedBackingData.map(b => b.location.x));
        break;
      case 'center-v':
        const leftMost = Math.min(...selectedBackingData.map(b => b.location.x));
        const rightMost = Math.max(...selectedBackingData.map(b => b.location.x + b.dimensions.width));
        referenceValue = (leftMost + rightMost) / 2;
        break;
      case 'right':
        referenceValue = Math.max(...selectedBackingData.map(b => b.location.x + b.dimensions.width));
        break;
      case 'top':
        referenceValue = Math.min(...selectedBackingData.map(b => b.location.y));
        break;
      case 'center-h':
        const topMost = Math.min(...selectedBackingData.map(b => b.location.y));
        const bottomMost = Math.max(...selectedBackingData.map(b => b.location.y + b.dimensions.height));
        referenceValue = (topMost + bottomMost) / 2;
        break;
      case 'bottom':
        referenceValue = Math.max(...selectedBackingData.map(b => b.location.y + b.dimensions.height));
        break;
    }
    
    const updatedBackings = backings.map(backing => {
      if (!selectedBackings.includes(backing.id)) return backing;
      
      const newLocation = { ...backing.location };
      switch (alignment) {
        case 'left':
          newLocation.x = referenceValue;
          break;
        case 'center-v':
          newLocation.x = referenceValue - backing.dimensions.width / 2;
          break;
        case 'right':
          newLocation.x = referenceValue - backing.dimensions.width;
          break;
        case 'top':
          newLocation.y = referenceValue;
          break;
        case 'center-h':
          newLocation.y = referenceValue - backing.dimensions.height / 2;
          break;
        case 'bottom':
          newLocation.y = referenceValue - backing.dimensions.height;
          break;
      }
      
      return { ...backing, location: newLocation };
    });
    
    handleBackingsChangeWithHistory(updatedBackings);
    toast({ 
      title: "Aligned", 
      description: `${selectedBackings.length} backings aligned` 
    });
  }, [selectedBackings, backings, handleBackingsChangeWithHistory, toast]);

  // Distribution functions
  const distributeBackings = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedBackings.length < 3) return;
    
    const selectedBackingData = backings.filter(b => selectedBackings.includes(b.id));
    
    if (direction === 'horizontal') {
      selectedBackingData.sort((a, b) => a.location.x - b.location.x);
      const leftMost = selectedBackingData[0].location.x;
      const rightMost = selectedBackingData[selectedBackingData.length - 1].location.x + 
                       selectedBackingData[selectedBackingData.length - 1].dimensions.width;
      const totalWidth = rightMost - leftMost;
      const spacing = totalWidth / (selectedBackingData.length - 1);
      
      const updatedBackings = backings.map(backing => {
        const index = selectedBackingData.findIndex(b => b.id === backing.id);
        if (index === -1 || index === 0 || index === selectedBackingData.length - 1) return backing;
        
        return {
          ...backing,
          location: {
            ...backing.location,
            x: leftMost + (spacing * index)
          }
        };
      });
      
      handleBackingsChangeWithHistory(updatedBackings);
    } else {
      selectedBackingData.sort((a, b) => a.location.y - b.location.y);
      const topMost = selectedBackingData[0].location.y;
      const bottomMost = selectedBackingData[selectedBackingData.length - 1].location.y + 
                        selectedBackingData[selectedBackingData.length - 1].dimensions.height;
      const totalHeight = bottomMost - topMost;
      const spacing = totalHeight / (selectedBackingData.length - 1);
      
      const updatedBackings = backings.map(backing => {
        const index = selectedBackingData.findIndex(b => b.id === backing.id);
        if (index === -1 || index === 0 || index === selectedBackingData.length - 1) return backing;
        
        return {
          ...backing,
          location: {
            ...backing.location,
            y: topMost + (spacing * index)
          }
        };
      });
      
      handleBackingsChangeWithHistory(updatedBackings);
    }
    
    toast({ 
      title: "Distributed", 
      description: `${selectedBackings.length} backings distributed ${direction}ly` 
    });
  }, [selectedBackings, backings, handleBackingsChangeWithHistory, toast]);

  // Save project
  const handleSave = useCallback(() => {
    const projectData = {
      backings,
      drawingUrl,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backing-project-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Saved", description: "Project saved successfully" });
  }, [backings, drawingUrl, toast]);

  // Load project
  const handleLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string);
        if (projectData.backings) {
          handleBackingsChangeWithHistory(projectData.backings);
          toast({ title: "Loaded", description: "Project loaded successfully" });
        }
      } catch (error) {
        toast({ 
          title: "Error", 
          description: "Failed to load project file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  }, [handleBackingsChangeWithHistory, toast]);

  // Keyboard shortcuts using the hook
  const { setTool } = useViewerStore();
  
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onDuplicate: handleDuplicate,
    onSave: handleSave,
    onDelete: handleDelete,
    onSelectAll: () => setSelectedBackings(backings.map(b => b.id)),
    onEscape: () => {
      setSelectedBackings([]);
      selectBacking(null);
    },
    // Tool shortcuts
    onSelectTool: () => setTool('select'),
    onPanTool: () => setTool('pan'), 
    onMeasureTool: () => setTool('measure'),
    onAddTool: () => setTool('add'),
    // View shortcuts
    onZoomIn: () => {
      // TODO: Implement zoom in
      console.log('Zoom in');
    },
    onZoomOut: () => {
      // TODO: Implement zoom out
      console.log('Zoom out');
    },
    onZoomFit: handleZoomToFit,
    onZoomReset: () => {
      // TODO: Implement zoom reset
      console.log('Zoom reset');
    },
    onToggleGrid: () => {
      // TODO: Implement grid toggle
      console.log('Toggle grid');
    },
    // Alignment shortcuts
    onAlignLeft: () => alignBackings('left'),
    onAlignRight: () => alignBackings('right'),
    onAlignTop: () => alignBackings('top'),
    onAlignBottom: () => alignBackings('bottom'),
    onAlignCenterHorizontal: () => alignBackings('center-h'),
    onAlignCenterVertical: () => alignBackings('center-v'),
    // Project shortcuts
    onOpenProjectManager: () => {
      // TODO: Open project manager
      console.log('Open project manager');
    },
    onNewProject: () => {
      // TODO: New project
      console.log('New project');
    }
  });

  // Initialize drawing URL loading state
  useEffect(() => {
    setDrawingUrl(drawingUrl);
  }, [drawingUrl, setDrawingUrl]);

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('drawing-viewer-container');
      if (container) {
        const newSize = {
          width: container.offsetWidth,
          height: container.offsetHeight,
        };
        setStageSize(newSize);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update coordinate system when zoom/pan changes
  useEffect(() => {
    updateCoordinateSystem();
  }, [updateCoordinateSystem]);

  // Track mouse position for live measurements
  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectedTool === 'measure' && isDrawingMeasurement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Convert to PDF coordinates
      const pdfPos = coordinateSystem.screenToPdf({
        x: pointer.x - position.x,
        y: pointer.y - position.y,
      });
      
      setCurrentMousePosition(pdfPos);
    }
  };

  const selectedBackingData = backings.find(b => b.id === selectedBacking);
  const showMeasurementPanel = selectedTool === 'measure' || measurements.length > 0;
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          {/* File Operations */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="h-8 px-3"
            title="Save Project (Ctrl+S)"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoad}
            className="h-8 px-3"
            title="Load Project (Ctrl+O)"
          >
            <FolderOpen className="h-4 w-4 mr-1" />
            Load
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileLoad}
            className="hidden"
          />

          <Separator orientation="vertical" className="h-6" />

          {/* Undo/Redo */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            className="h-8 w-8 p-0"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            className="h-8 w-8 p-0"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Edit Operations */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={selectedBackings.length === 0}
            className="h-8 w-8 p-0"
            title="Copy (Ctrl+C)"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePaste}
            disabled={clipboard.length === 0}
            className="h-8 w-8 p-0"
            title="Paste (Ctrl+V)"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={selectedBackings.length === 0}
            className="h-8 w-8 p-0"
            title="Delete (Del)"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment Tools */}
          {selectedBackings.length >= 2 && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    title="Align Objects"
                  >
                    <AlignStartVertical className="h-4 w-4 mr-1" />
                    Align
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => alignBackings('left')}>
                    <AlignStartVertical className="h-4 w-4 mr-2" />
                    Align Left
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alignBackings('center-v')}>
                    <AlignCenterVertical className="h-4 w-4 mr-2" />
                    Align Center Vertical
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alignBackings('right')}>
                    <AlignEndVertical className="h-4 w-4 mr-2" />
                    Align Right
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => alignBackings('top')}>
                    <AlignStartHorizontal className="h-4 w-4 mr-2" />
                    Align Top
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alignBackings('center-h')}>
                    <AlignCenterHorizontal className="h-4 w-4 mr-2" />
                    Align Center Horizontal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alignBackings('bottom')}>
                    <AlignEndHorizontal className="h-4 w-4 mr-2" />
                    Align Bottom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedBackings.length >= 3 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      title="Distribute Objects"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Distribute
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => distributeBackings('horizontal')}>
                      <Minus className="h-4 w-4 mr-2" />
                      Distribute Horizontally
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => distributeBackings('vertical')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Distribute Vertically
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Selection Info */}
          {selectedBackings.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedBackings.length} selected
            </Badge>
          )}
        </div>

        {/* Original Toolbar Integration */}
        <ViewerToolbar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageNavigation}
          onZoomToFit={handleZoomToFit}
          drawingOpacity={drawingOpacity}
          onDrawingOpacityChange={setDrawingOpacity}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* PDF Viewer with Overlay */}
        <div className="flex-1 relative">
          <div 
            id="drawing-viewer-container" 
            ref={pdfContainerRef}
            className="w-full h-full"
            style={{ cursor: selectedTool === 'add' ? 'crosshair' : selectedTool === 'measure' ? 'crosshair' : 'default' }}
            onMouseMove={handleMouseMove}
          >
            {/* PDF Viewer Layer */}
            <PDFViewerLayer
              drawingUrl={drawingUrl}
              drawingOpacity={drawingOpacity}
              layers={layers}
              onDocumentLoad={handleDocumentLoad}
              onPageChange={handlePageChange}
            />
            
            {/* Interactive Overlay */}
            {drawingUrl && (
              <InteractiveOverlay
                stageSize={stageSize}
                zoom={zoom}
                position={position}
                backings={backings}
                measurements={measurements}
                selectedMeasurementId={selectedMeasurementId}
                isDrawingMeasurement={isDrawingMeasurement}
                measurementStartPoint={measurementStartPoint}
                currentMousePosition={currentMousePosition}
                onAddBacking={handleAddBacking}
                onBackingUpdate={handleBackingUpdate}
                onMeasurementSelect={selectMeasurement}
                onMeasurementDelete={deleteMeasurement}
                onStartMeasurement={startMeasurement}
                onCompleteMeasurement={completeMeasurement}
                onStartPan={startPan}
                onPanMove={handlePanMove}
                onEndPan={endPan}
              />
            )}

            {/* No PDF Placeholder */}
            {!drawingUrl && (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <div className="text-center text-muted-foreground">
                  <Square className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Drawing Selected</p>
                  <p className="text-sm">Upload a PDF drawing to view and add backings</p>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {isLoading && drawingUrl && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading PDF...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Measurement Panel */}
        {showMeasurementPanel && (
          <div className="border-l border-border">
            <MeasurementPanel
              measurements={measurements}
              selectedMeasurementId={selectedMeasurementId}
              onMeasurementSelect={selectMeasurement}
              onMeasurementDelete={deleteMeasurement}
              onClearAll={clearAllMeasurements}
            />
          </div>
        )}

        {/* Backing Properties Panel */}
        {selectedBackingData && !showMeasurementPanel && (
          <div className="w-80 border-l border-border">
            <BackingPropertiesPanel
              backing={selectedBackingData}
              onUpdate={handleBackingUpdate}
              onDelete={() => {
                const updatedBackings = backings.filter(b => b.id !== selectedBacking);
                handleBackingsChangeWithHistory(updatedBackings);
                selectBacking(null);
              }}
              onClose={() => selectBacking(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}