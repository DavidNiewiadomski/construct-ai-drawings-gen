import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
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
  RotateCcw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingPlacement } from './BackingPlacement';
import { BackingEditor } from './BackingEditor';
import { BackingPlacement as BackingType } from '@/types';
import { constrainPosition, getZoomToFit, Point } from '@/utils/viewerUtils';

interface DrawingViewerProps {
  drawingUrl?: string;
  backings: BackingType[];
  onBackingsChange: (backings: BackingType[]) => void;
}

export function DrawingViewer({ drawingUrl, backings, onBackingsChange }: DrawingViewerProps) {
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isLoading, setIsLoading] = useState(!!drawingUrl);
  const [drawingSize, setDrawingSize] = useState({ width: 1000, height: 800 });
  
  const {
    zoom,
    position,
    selectedTool,
    selectedBacking,
    showGrid,
    gridSize,
    layers,
    setZoom,
    setPosition,
    selectTool,
    selectBacking,
    toggleLayer,
    toggleGrid,
    resetView,
  } = useViewerStore();

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('drawing-viewer-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle zoom with mouse wheel
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / zoom,
      y: (pointer.y - position.y) / zoom,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newZoom = zoom * (1 + direction * 0.1);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newZoom,
      y: pointer.y - mousePointTo.y * newZoom,
    };

    setZoom(newZoom);
    setPosition(constrainPosition(newPos, newZoom, stageSize, drawingSize));
  };

  // Handle mouse down for panning and adding backings
  const handleMouseDown = (e: any) => {
    if (selectedTool === 'add') {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      const worldPos = {
        x: (pointer.x - position.x) / zoom,
        y: (pointer.y - position.y) / zoom,
      };

      const newBacking: BackingType = {
        id: crypto.randomUUID(),
        componentId: '',
        backingType: '2x6',
        dimensions: { width: 48, height: 24, thickness: 6 },
        location: { x: worldPos.x, y: worldPos.y, z: 42 },
        orientation: 0,
        status: 'user_modified',
      };

      onBackingsChange([...backings, newBacking]);
      selectBacking(newBacking.id);
    }
  };

  // Handle stage drag for panning
  const handleStageDrag = (e: any) => {
    const newPos = {
      x: e.target.x(),
      y: e.target.y(),
    };
    setPosition(constrainPosition(newPos, zoom, stageSize, drawingSize));
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);
  const handleFitToScreen = () => {
    const fit = getZoomToFit(drawingSize, stageSize);
    setZoom(fit.zoom);
    setPosition(fit.position);
  };

  // Grid rendering
  const renderGrid = () => {
    if (!showGrid || !layers.drawing) return null;

    const lines = [];
    const gridSpacing = gridSize * zoom;
    const offsetX = position.x % gridSpacing;
    const offsetY = position.y % gridSpacing;

    // Vertical lines
    for (let i = 0; i < Math.ceil(stageSize.width / gridSpacing) + 1; i++) {
      const x = i * gridSpacing + offsetX;
      lines.push(
        <Line
          key={`v-${i}`}
          points={[x, 0, x, stageSize.height]}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={0.5}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i < Math.ceil(stageSize.height / gridSpacing) + 1; i++) {
      const y = i * gridSpacing + offsetY;
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, y, stageSize.width, y]}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={0.5}
        />
      );
    }

    return lines;
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

  const selectedBackingData = backings.find(b => b.id === selectedBacking);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <div className="px-2 py-1 text-sm font-mono bg-muted rounded min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleFitToScreen}
            className="h-8 px-3"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Fit
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Tools */}
          {(['pan', 'select', 'add', 'measure'] as const).map((tool) => (
            <Button
              key={tool}
              variant={selectedTool === tool ? 'default' : 'outline'}
              size="sm"
              onClick={() => selectTool(tool)}
              className="h-8 w-8 p-0"
            >
              {getToolIcon(tool)}
            </Button>
          ))}

          <Separator orientation="vertical" className="h-6" />

          {/* Grid Toggle */}
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={toggleGrid}
            className="h-8 w-8 p-0"
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center space-x-2">
          {Object.entries(layers).map(([layer, visible]) => (
            <Badge
              key={layer}
              variant={visible ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => toggleLayer(layer as keyof typeof layers)}
            >
              {visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {layer.charAt(0).toUpperCase() + layer.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 relative">
          <div 
            id="drawing-viewer-container" 
            className="w-full h-full"
            style={{ cursor: selectedTool === 'add' ? 'crosshair' : 'default' }}
          >
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              draggable={selectedTool === 'pan'}
              onDragEnd={handleStageDrag}
              x={position.x}
              y={position.y}
              scaleX={zoom}
              scaleY={zoom}
            >
              {/* Background */}
              <Layer>
                <Rect
                  x={-position.x / zoom}
                  y={-position.y / zoom}
                  width={stageSize.width / zoom}
                  height={stageSize.height / zoom}
                  fill="#0f172a"
                />
              </Layer>

              {/* Grid Layer */}
              {showGrid && (
                <Layer>
                  {renderGrid()}
                </Layer>
              )}

              {/* Drawing Layer */}
              {layers.drawing && (
                <Layer>
                  {/* Drawing background */}
                  <Rect
                    x={0}
                    y={0}
                    width={drawingSize.width}
                    height={drawingSize.height}
                    fill="white"
                    stroke="#ccc"
                    strokeWidth={1 / zoom}
                  />
                  
                  {/* Placeholder drawing content */}
                  <Text
                    x={drawingSize.width / 2}
                    y={drawingSize.height / 2}
                    text="Drawing will be displayed here"
                    fontSize={16 / zoom}
                    fill="#666"
                    align="center"
                    offsetX={100 / zoom}
                    offsetY={8 / zoom}
                  />
                </Layer>
              )}

              {/* Backings Layer */}
              {layers.backings && (
                <Layer>
                  {backings.map((backing) => (
                    <BackingPlacement
                      key={backing.id}
                      backing={backing}
                      isSelected={selectedBacking === backing.id}
                      onSelect={() => selectBacking(backing.id)}
                      onUpdate={(updatedBacking) => {
                        const updatedBackings = backings.map(b =>
                          b.id === backing.id ? updatedBacking : b
                        );
                        onBackingsChange(updatedBackings);
                      }}
                      zoom={zoom}
                    />
                  ))}
                </Layer>
              )}
            </Stage>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading drawing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Backing Editor Panel */}
        {selectedBackingData && (
          <div className="w-80 border-l border-border">
            <BackingEditor
              backing={selectedBackingData}
              onUpdate={(updatedBacking) => {
                const updatedBackings = backings.map(b =>
                  b.id === selectedBacking ? updatedBacking : b
                );
                onBackingsChange(updatedBackings);
              }}
              onDelete={() => {
                const updatedBackings = backings.filter(b => b.id !== selectedBacking);
                onBackingsChange(updatedBackings);
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