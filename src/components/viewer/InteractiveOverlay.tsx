import { useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingOverlay } from './BackingOverlay';
import { GridLayer } from './GridLayer';
import { MeasurementOverlay } from './MeasurementOverlay';
import { LiveMeasurement } from './LiveMeasurement';
import { BackingPlacement as BackingType, Measurement, Point } from '@/types';
import { coordinateSystem } from '@/utils/coordinateSystem';

interface InteractiveOverlayProps {
  stageSize: { width: number; height: number };
  zoom: number;
  position: { x: number; y: number };
  backings: BackingType[];
  measurements: Measurement[];
  selectedMeasurementId?: string;
  isDrawingMeasurement: boolean;
  measurementStartPoint: Point | null;
  currentMousePosition: Point | null;
  onAddBacking: (pointer: { x: number; y: number }) => void;
  onBackingUpdate: (backing: BackingType) => void;
  onMeasurementSelect: (id: string) => void;
  onMeasurementDelete: (id: string) => void;
  onStartMeasurement: (point: Point) => void;
  onCompleteMeasurement: (point: Point) => void;
  onStartPan: (stage: any, pointer: { x: number; y: number }) => void;
  onPanMove: (stage: any, pointer: { x: number; y: number }) => void;
  onEndPan: (stage: any) => void;
}

export function InteractiveOverlay({
  stageSize,
  zoom,
  position,
  backings,
  measurements,
  selectedMeasurementId,
  isDrawingMeasurement,
  measurementStartPoint,
  currentMousePosition,
  onAddBacking,
  onBackingUpdate,
  onMeasurementSelect,
  onMeasurementDelete,
  onStartMeasurement,
  onCompleteMeasurement,
  onStartPan,
  onPanMove,
  onEndPan
}: InteractiveOverlayProps) {
  const stageRef = useRef<any>(null);
  const {
    selectedTool,
    selectedBacking,
    showGrid,
    gridSize,
    layers,
    selectBacking
  } = useViewerStore();

  // Handle mouse down for adding backings, measuring, or panning
  const handleMouseDown = (e: any) => {
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    
    if (selectedTool === 'add') {
      onAddBacking(pointer);
    } else if (selectedTool === 'measure') {
      if (!isDrawingMeasurement) {
        // Convert screen coordinates to PDF coordinates
        const pdfPos = coordinateSystem.screenToPdf({
          x: pointer.x - position.x,
          y: pointer.y - position.y,
        });
        onStartMeasurement(pdfPos);
      } else {
        // Complete measurement
        const pdfPos = coordinateSystem.screenToPdf({
          x: pointer.x - position.x,
          y: pointer.y - position.y,
        });
        onCompleteMeasurement(pdfPos);
      }
    } else if (selectedTool === 'pan') {
      onStartPan(stage, pointer);
    }
  };

  // Handle mouse move for tracking cursor and panning
  const handleMouseMove = (e: any) => {
    if (selectedTool === 'pan') {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      onPanMove(stage, pointer);
    }
  };

  // Handle mouse up
  const handleMouseUp = (e: any) => {
    if (selectedTool === 'pan') {
      const stage = stageRef.current;
      onEndPan(stage);
    }
  };

  const getCursor = () => {
    if (selectedTool === 'pan') return 'grab';
    if (selectedTool === 'add') return 'crosshair';
    if (selectedTool === 'measure') return 'crosshair';
    return 'default';
  };

  return (
    <Stage
      ref={stageRef}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0,
        pointerEvents: 'auto',
        zIndex: 10,
        cursor: getCursor()
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
      <GridLayer 
        showGrid={showGrid}
        gridSize={gridSize}
        stageSize={stageSize}
      />

      {/* Backings Layer */}
      {layers.backings && (
        <Layer>
          <BackingOverlay
            backings={backings}
            selectedBackingId={selectedBacking}
            onBackingSelect={selectBacking}
            onBackingUpdate={onBackingUpdate}
            gridSize={gridSize}
            zoom={zoom}
            coordinateSystem={coordinateSystem}
          />
        </Layer>
      )}
      
      {/* Measurements Layer */}
      {layers.backings && (
        <>
          <MeasurementOverlay
            measurements={measurements}
            selectedMeasurementId={selectedMeasurementId}
            onMeasurementSelect={onMeasurementSelect}
            onMeasurementDelete={onMeasurementDelete}
            zoom={zoom}
          />
          
          {/* Live measurement while drawing */}
          {isDrawingMeasurement && measurementStartPoint && currentMousePosition && (
            <LiveMeasurement
              startPoint={measurementStartPoint}
              currentPoint={currentMousePosition}
              zoom={zoom}
            />
          )}
        </>
      )}
    </Stage>
  );
}