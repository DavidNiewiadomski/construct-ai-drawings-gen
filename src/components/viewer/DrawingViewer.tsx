import { useState, useEffect } from 'react';
import { Square } from 'lucide-react';
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
import { coordinateSystem } from '@/utils/coordinateSystem';

interface DrawingViewerProps {
  drawingUrl?: string;
  backings: BackingType[];
  onBackingsChange: (backings: BackingType[]) => void;
}

export function DrawingViewer({ drawingUrl, backings, onBackingsChange }: DrawingViewerProps) {
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [currentMousePosition, setCurrentMousePosition] = useState<{ x: number; y: number } | null>(null);
  
  const { selectedTool, selectedBacking, layers, selectBacking } = useViewerStore();
  
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