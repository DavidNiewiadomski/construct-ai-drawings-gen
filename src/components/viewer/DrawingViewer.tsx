import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import { Worker, Viewer, DocumentLoadEvent, PageChangeEvent } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Square } from 'lucide-react';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingOverlay } from './BackingOverlay';
import { BackingPropertiesPanel } from './BackingPropertiesPanel';
import { ViewerToolbar } from './ViewerToolbar';
import { BackingPlacement as BackingType } from '@/types';
import { constrainPosition, getZoomToFit, Point } from '@/utils/viewerUtils';
import { coordinateSystem } from '@/utils/coordinateSystem';

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
  const [drawingOpacity, setDrawingOpacity] = useState(100);
  
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
    selectBacking,
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
          const containerRect = pdfContainerRef.current.getBoundingClientRect();
          
          const pdfBounds = {
            width: rect.width,
            height: rect.height,
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
          };
          
          setPdfDimensions({
            width: rect.width,
            height: rect.height
          });
          
          // Update coordinate system with PDF bounds
          coordinateSystem.updatePdfBounds(pdfBounds);
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
          const containerRect = pdfContainerRef.current.getBoundingClientRect();
          
          const pdfBounds = {
            width: rect.width,
            height: rect.height,
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
          };
          
          setPdfDimensions({
            width: rect.width,
            height: rect.height
          });
          
          // Update coordinate system with PDF bounds
          coordinateSystem.updatePdfBounds(pdfBounds);
        }
      }
    }, 100);
  }, []);

  // Handle page navigation from toolbar
  const handlePageNavigation = useCallback((page: number) => {
    setCurrentPage(page);
    // The PDF viewer will handle the actual page change
  }, []);

  // Handle zoom to fit
  const handleZoomToFit = useCallback(() => {
    if (pdfDimensions.width > 0 && pdfDimensions.height > 0) {
      const { zoom: newZoom, position: newPosition } = getZoomToFit(
        pdfDimensions,
        stageSize,
        50
      );
      setZoom(newZoom);
      setPosition(newPosition);
    }
  }, [pdfDimensions, stageSize, setZoom, setPosition]);

  // Update coordinate system when zoom/pan changes
  useEffect(() => {
    coordinateSystem.updateViewport({
      zoom,
      pan: position,
      stageSize
    });
  }, [zoom, position, stageSize]);

  // Handle mouse down for adding backings or panning
  const handleMouseDown = (e: any) => {
    if (selectedTool === 'add') {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      
      // Convert screen coordinates to PDF coordinates
      const pdfPos = coordinateSystem.screenToPdf({
        x: pointer.x - position.x,
        y: pointer.y - position.y,
      });

      // Snap to grid if enabled
      const finalPos = showGrid 
        ? coordinateSystem.snapToPdfGrid(pdfPos, gridSize)
        : pdfPos;

      const newBacking: BackingType = {
        id: crypto.randomUUID(),
        componentId: '',
        backingType: '2x6',
        dimensions: { width: 48, height: 24, thickness: 6 },
        location: { x: finalPos.x, y: finalPos.y, z: 42 },
        orientation: 0,
        status: 'user_modified',
      };

      onBackingsChange([...backings, newBacking]);
      selectBacking(newBacking.id);
    } else if (selectedTool === 'pan') {
      // Start panning
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      stage.dragData = {
        startX: pointer.x - position.x,
        startY: pointer.y - position.y
      };
    }
  };

  // Handle mouse move for tracking cursor and panning
  const handleMouseMove = (e: any) => {
    if (selectedTool === 'pan') {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      
      if (stage.dragData) {
        const newPosition = {
          x: pointer.x - stage.dragData.startX,
          y: pointer.y - stage.dragData.startY
        };
        
        // Constrain position to keep content visible
        const constrainedPosition = constrainPosition(
          newPosition,
          zoom,
          stageSize,
          pdfDimensions
        );
        
        setPosition(constrainedPosition);
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = (e: any) => {
    if (selectedTool === 'pan') {
      const stage = stageRef.current;
      stage.dragData = null;
    }
  };

  // Grid rendering for overlay
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = coordinateSystem.getGridLines(gridSize);
    const lines = [];
    const strokeWidth = coordinateSystem.getLineThickness(0.5);
    
    // Vertical lines
    gridLines.vertical.forEach((x, i) => {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[x, 0, x, stageSize.height]}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
        />
      );
    });

    // Horizontal lines
    gridLines.horizontal.forEach((y, i) => {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, y, stageSize.width, y]}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
        />
      );
    });

    return lines;
  };

  const selectedBackingData = backings.find(b => b.id === selectedBacking);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <ViewerToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageNavigation}
        onZoomToFit={handleZoomToFit}
        drawingOpacity={drawingOpacity}
        onDrawingOpacityChange={setDrawingOpacity}
      />

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
                <div 
                  style={{ 
                    height: '100%', 
                    position: 'relative',
                    opacity: layers.drawing ? drawingOpacity / 100 : 0
                  }}
                >
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
                      pointerEvents: 'auto',
                      zIndex: 10,
                      cursor: selectedTool === 'pan' ? 'grab' : selectedTool === 'add' ? 'crosshair' : 'default'
                    }}
                    width={stageSize.width}
                    height={stageSize.height}
                    x={position.x}
                    y={position.y}
                    scaleX={zoom}
                    scaleY={zoom}
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
                        <BackingOverlay
                          backings={backings}
                          selectedBackingId={selectedBacking}
                          onBackingSelect={selectBacking}
                          onBackingUpdate={(updatedBacking) => {
                            const updatedBackings = backings.map(b =>
                              b.id === updatedBacking.id ? updatedBacking : b
                            );
                            onBackingsChange(updatedBackings);
                          }}
                          gridSize={gridSize}
                          zoom={zoom}
                          coordinateSystem={coordinateSystem}
                        />
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

        {/* Backing Properties Panel */}
        {selectedBackingData && (
          <div className="w-80 border-l border-border">
            <BackingPropertiesPanel
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