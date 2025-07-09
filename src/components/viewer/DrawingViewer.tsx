import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import { Worker, Viewer, DocumentLoadEvent, PageChangeEvent } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
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

// Set up PDF.js worker
const workerUrl = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface DrawingViewerProps {
  drawingUrl?: string;
  backings: BackingType[];
  onBackingsChange: (backings: BackingType[]) => void;
}

export function DrawingViewer({ drawingUrl, backings, onBackingsChange }: DrawingViewerProps) {
  const stageRef = useRef<any>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(!!drawingUrl);
  
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

  // Default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

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

  // Handle PDF document load
  const handleDocumentLoad = useCallback((e: DocumentLoadEvent) => {
    setTotalPages(e.doc.numPages);
    setIsLoading(false);
    
    // Get PDF container dimensions for overlay alignment
    setTimeout(() => {
      if (pdfContainerRef.current) {
        const pdfElement = pdfContainerRef.current.querySelector('.rpv-core__page-layer');
        if (pdfElement) {
          const rect = pdfElement.getBoundingClientRect();
          setPdfDimensions({
            width: rect.width,
            height: rect.height
          });
        }
      }
    }, 100);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((e: PageChangeEvent) => {
    setCurrentPage(e.currentPage);
    
    // Update PDF dimensions when page changes
    setTimeout(() => {
      if (pdfContainerRef.current) {
        const pdfElement = pdfContainerRef.current.querySelector('.rpv-core__page-layer');
        if (pdfElement) {
          const rect = pdfElement.getBoundingClientRect();
          setPdfDimensions({
            width: rect.width,
            height: rect.height
          });
        }
      }
    }, 100);
  }, []);

  // Handle mouse down for adding backings
  const handleMouseDown = (e: any) => {
    if (selectedTool === 'add') {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      
      // Convert screen coordinates to PDF coordinates
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

  // Handle mouse move for tracking cursor
  const handleMouseMove = (e: any) => {
    // Can be used for cursor tracking or preview placement
  };

  // Handle mouse up
  const handleMouseUp = (e: any) => {
    // Handle end of interactions
  };

  // Grid rendering for overlay
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
          stroke="rgba(255, 255, 255, 0.2)"
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
          stroke="rgba(255, 255, 255, 0.2)"
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
          {/* PDF Info */}
          {totalPages > 0 && (
            <>
              <div className="px-2 py-1 text-sm bg-muted rounded">
                Page {currentPage + 1} of {totalPages}
              </div>
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
        {/* PDF Viewer with Overlay */}
        <div className="flex-1 relative">
          <div 
            id="drawing-viewer-container" 
            ref={pdfContainerRef}
            className="w-full h-full"
            style={{ cursor: selectedTool === 'add' ? 'crosshair' : 'default' }}
          >
            {/* PDF Viewer Layer */}
            {drawingUrl && (
              <Worker workerUrl={workerUrl}>
                <div style={{ height: '100%', position: 'relative' }}>
                  <Viewer
                    fileUrl={drawingUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    onDocumentLoad={handleDocumentLoad}
                    onPageChange={handlePageChange}
                  />
                  
                  {/* Konva Overlay for Interactive Elements */}
                  <Stage
                    ref={stageRef}
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0,
                      pointerEvents: selectedTool === 'pan' ? 'none' : 'auto'
                    }}
                    width={stageSize.width}
                    height={stageSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    {/* Grid Layer */}
                    {showGrid && (
                      <Layer>
                        {renderGrid()}
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
                            zoom={1} // PDF viewer handles its own zoom
                          />
                        ))}
                      </Layer>
                    )}
                  </Stage>
                </div>
              </Worker>
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