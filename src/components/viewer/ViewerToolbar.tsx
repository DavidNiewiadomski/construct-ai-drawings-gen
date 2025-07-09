import { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Hand, 
  MousePointer, 
  Square, 
  Ruler, 
  Grid, 
  Eye, 
  EyeOff,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useViewerStore } from '@/stores/viewerStore';

interface ViewerToolbarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onZoomToFit: () => void;
  drawingOpacity?: number;
  onDrawingOpacityChange?: (opacity: number) => void;
}

const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200];

export function ViewerToolbar({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onZoomToFit,
  drawingOpacity = 100,
  onDrawingOpacityChange
}: ViewerToolbarProps) {
  const [pageInput, setPageInput] = useState(currentPage + 1);
  const [gridSizeInput, setGridSizeInput] = useState(24);
  
  const {
    zoom,
    tool: selectedTool,
    gridEnabled: showGrid,
    gridSize,
    layers,
    setZoom,
    setTool: selectTool,
    toggleLayer,
    toggleGrid,
    setGridSize,
    resetView,
  } = useViewerStore();

  const handleZoomChange = (newZoom: number) => {
    const zoomValue = newZoom / 100;
    setZoom(zoomValue);
  };

  const handleZoomIn = () => {
    const currentZoomPercent = Math.round(zoom * 100);
    const nextPreset = ZOOM_PRESETS.find(preset => preset > currentZoomPercent);
    const newZoom = nextPreset ? nextPreset / 100 : Math.min(5, zoom * 1.2);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const currentZoomPercent = Math.round(zoom * 100);
    const prevPreset = [...ZOOM_PRESETS].reverse().find(preset => preset < currentZoomPercent);
    const newZoom = prevPreset ? prevPreset / 100 : Math.max(0.1, zoom / 1.2);
    setZoom(newZoom);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPageInput(value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage = Math.max(1, Math.min(totalPages, pageInput)) - 1;
    onPageChange(newPage);
  };

  const handleGridSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGridSize(Math.max(1, gridSizeInput));
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'pan': return <Hand className="h-4 w-4" />;
      case 'select': return <MousePointer className="h-4 w-4" />;
      case 'add': return <Square className="h-4 w-4" />;
      case 'measure': return <Ruler className="h-4 w-4" />;
      default: return <MousePointer className="h-4 w-4" />;
    }
  };

  const getToolLabel = (tool: string) => {
    switch (tool) {
      case 'pan': return 'Pan';
      case 'select': return 'Select';
      case 'add': return 'Add Backing';
      case 'measure': return 'Measure';
      default: return 'Select';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border">
      <div className="flex items-center space-x-2">
        {/* Zoom Controls */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-3 min-w-[80px]">
              {Math.round(zoom * 100)}%
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border border-border">
            {ZOOM_PRESETS.map((preset) => (
              <DropdownMenuItem
                key={preset}
                onClick={() => handleZoomChange(preset)}
                className="cursor-pointer hover:bg-accent"
              >
                {preset}%
              </DropdownMenuItem>
            ))}
            <Separator className="my-1" />
            <DropdownMenuItem
              onClick={onZoomToFit}
              className="cursor-pointer hover:bg-accent"
            >
              Fit to Screen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetView}
          className="h-8 px-3"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Page Navigation */}
        {totalPages > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="h-8 w-8 p-0"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-1">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={handlePageInputChange}
                className="h-8 w-16 text-center"
                onBlur={() => setPageInput(currentPage + 1)}
              />
              <span className="text-sm text-muted-foreground">of {totalPages}</span>
            </form>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="h-8 w-8 p-0"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Tools */}
        {(['pan', 'select', 'add', 'measure'] as const).map((tool) => (
          <Button
            key={tool}
            variant={selectedTool === tool ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectTool(tool)}
            className="h-8 w-8 p-0"
            title={getToolLabel(tool)}
          >
            {getToolIcon(tool)}
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6" />

        {/* Grid Controls */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={showGrid ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0"
              title="Grid Settings"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-popover border border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="grid-toggle">Show Grid</Label>
                <Button
                  id="grid-toggle"
                  variant={showGrid ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleGrid}
                  className="h-6 w-12"
                >
                  {showGrid ? 'On' : 'Off'}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grid-size">Grid Size (inches)</Label>
                <form onSubmit={handleGridSizeSubmit} className="flex space-x-2">
                  <Input
                    id="grid-size"
                    type="number"
                    min={1}
                    value={gridSizeInput}
                    onChange={(e) => setGridSizeInput(parseInt(e.target.value) || 1)}
                    className="h-8"
                  />
                  <Button type="submit" size="sm" className="h-8">
                    Apply
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground">
                  Current: {gridSize}"
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Layer Controls */}
      <div className="flex items-center space-x-2">
        {/* Drawing Layer with Opacity */}
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant={layers.drawing ? 'default' : 'outline'}
              className="cursor-pointer text-xs px-3 py-1"
            >
              {layers.drawing ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Drawing
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-popover border border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Drawing Visibility</Label>
                <Button
                  variant={layers.drawing ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleLayer('drawing')}
                  className="h-6 w-12"
                >
                  {layers.drawing ? 'On' : 'Off'}
                </Button>
              </div>
              
              {layers.drawing && onDrawingOpacityChange && (
                <div className="space-y-2">
                  <Label>Opacity: {drawingOpacity}%</Label>
                  <Slider
                    value={[drawingOpacity]}
                    onValueChange={(value) => onDrawingOpacityChange(value[0])}
                    max={100}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Other Layer Toggles */}
        {Object.entries(layers)
          .filter(([layer]) => layer !== 'drawing')
          .map(([layer, visible]) => (
            <Badge
              key={layer}
              variant={visible ? 'default' : 'outline'}
              className="cursor-pointer text-xs px-3 py-1"
              onClick={() => toggleLayer(layer as keyof typeof layers)}
            >
              {visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {layer.charAt(0).toUpperCase() + layer.slice(1)}
            </Badge>
          ))}
      </div>
    </div>
  );
}
