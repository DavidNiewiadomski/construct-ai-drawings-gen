import { useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingOverlay } from './BackingOverlay';
import { GridLayer } from './GridLayer';
import { BackingPlacement as BackingType } from '@/types';
import { coordinateSystem } from '@/utils/coordinateSystem';

interface InteractiveOverlayProps {
  stageSize: { width: number; height: number };
  zoom: number;
  position: { x: number; y: number };
  backings: BackingType[];
  onAddBacking: (pointer: { x: number; y: number }) => void;
  onBackingUpdate: (backing: BackingType) => void;
  onStartPan: (stage: any, pointer: { x: number; y: number }) => void;
  onPanMove: (stage: any, pointer: { x: number; y: number }) => void;
  onEndPan: (stage: any) => void;
}

export function InteractiveOverlay({
  stageSize,
  zoom,
  position,
  backings,
  onAddBacking,
  onBackingUpdate,
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

  // Handle mouse down for adding backings or panning
  const handleMouseDown = (e: any) => {
    if (selectedTool === 'add') {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      onAddBacking(pointer);
    } else if (selectedTool === 'pan') {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
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
    </Stage>
  );
}