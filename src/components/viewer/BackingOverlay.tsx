import { useState, useRef } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { BackingPlacement as BackingType } from '@/types';
import { DrawingCoordinateSystem } from '@/utils/coordinateSystem';

interface BackingOverlayProps {
  backings: BackingType[];
  selectedBackingId: string | null;
  onBackingSelect: (id: string | null) => void;
  onBackingUpdate: (backing: BackingType) => void;
  gridSize?: number;
  zoom?: number;
  coordinateSystem: DrawingCoordinateSystem;
}

const BACKING_COLORS = {
  ai_generated: 'rgba(59, 130, 246, 0.5)', // blue
  user_modified: 'rgba(249, 115, 22, 0.5)', // orange
  approved: 'rgba(34, 197, 94, 0.5)', // green
};

const BACKING_STROKE_COLORS = {
  ai_generated: '#3b82f6', // blue
  user_modified: '#f97316', // orange
  approved: '#22c55e', // green
};

export function BackingOverlay({
  backings,
  selectedBackingId,
  onBackingSelect,
  onBackingUpdate,
  gridSize = 24,
  zoom = 1,
  coordinateSystem
}: BackingOverlayProps) {
  const [hoveredBackingId, setHoveredBackingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState<{ id: string; startX: number; startY: number } | null>(null);

  const snapToGrid = (pdfPoint: { x: number; y: number }, grid: number = gridSize): { x: number; y: number } => {
    return coordinateSystem.snapToPdfGrid(pdfPoint, grid);
  };

  const formatBackingLabel = (backing: BackingType): string => {
    const { dimensions, backingType } = backing;
    return `${backingType}\n${dimensions.width}" × ${dimensions.height}" × ${dimensions.thickness}"`;
  };

  const getStatusColor = (status: string) => {
    return BACKING_COLORS[status as keyof typeof BACKING_COLORS] || BACKING_COLORS.user_modified;
  };

  const getStatusStrokeColor = (status: string) => {
    return BACKING_STROKE_COLORS[status as keyof typeof BACKING_STROKE_COLORS] || BACKING_STROKE_COLORS.user_modified;
  };

  const handleBackingClick = (backingId: string) => {
    onBackingSelect(backingId === selectedBackingId ? null : backingId);
  };

  const handleBackingDragStart = (backingId: string, x: number, y: number) => {
    setIsDragging(true);
    setDragData({ id: backingId, startX: x, startY: y });
    onBackingSelect(backingId);
  };

  const handleBackingDragMove = (backingId: string, x: number, y: number) => {
    if (!isDragging || !dragData || dragData.id !== backingId) return;

    const backing = backings.find(b => b.id === backingId);
    if (!backing) return;

    // Convert screen coordinates to PDF coordinates
    const pdfPos = coordinateSystem.screenToPdf({ x, y });
    const snappedPos = snapToGrid(pdfPos);

    const updatedBacking: BackingType = {
      ...backing,
      location: {
        ...backing.location,
        x: snappedPos.x,
        y: snappedPos.y,
      },
    };

    onBackingUpdate(updatedBacking);
  };

  const handleBackingDragEnd = () => {
    setIsDragging(false);
    setDragData(null);
  };

  const handleResizeHandleDrag = (
    backingId: string,
    handleType: string,
    x: number,
    y: number
  ) => {
    const backing = backings.find(b => b.id === backingId);
    if (!backing) return;

    const { location, dimensions } = backing;
    let newDimensions = { ...dimensions };
    let newLocation = { ...location };

    // Convert screen coordinates to PDF coordinates
    const pdfPos = coordinateSystem.screenToPdf({ x, y });
    const snappedPos = snapToGrid(pdfPos);

    // Convert backing dimensions from inches to PDF units for calculations
    const pdfWidth = coordinateSystem.inchesToPdfUnits(dimensions.width);
    const pdfHeight = coordinateSystem.inchesToPdfUnits(dimensions.height);
    const minSizePdf = coordinateSystem.inchesToPdfUnits(gridSize);

    switch (handleType) {
      case 'top-left':
        const newWidthTL = Math.max(minSizePdf, pdfWidth + (location.x - snappedPos.x));
        const newHeightTL = Math.max(minSizePdf, pdfHeight + (location.y - snappedPos.y));
        newDimensions.width = coordinateSystem.pdfUnitsToInches(newWidthTL);
        newDimensions.height = coordinateSystem.pdfUnitsToInches(newHeightTL);
        newLocation.x = snappedPos.x;
        newLocation.y = snappedPos.y;
        break;
      case 'top-right':
        const newWidthTR = Math.max(minSizePdf, snappedPos.x - location.x);
        const newHeightTR = Math.max(minSizePdf, pdfHeight + (location.y - snappedPos.y));
        newDimensions.width = coordinateSystem.pdfUnitsToInches(newWidthTR);
        newDimensions.height = coordinateSystem.pdfUnitsToInches(newHeightTR);
        newLocation.y = snappedPos.y;
        break;
      case 'bottom-left':
        const newWidthBL = Math.max(minSizePdf, pdfWidth + (location.x - snappedPos.x));
        const newHeightBL = Math.max(minSizePdf, snappedPos.y - location.y);
        newDimensions.width = coordinateSystem.pdfUnitsToInches(newWidthBL);
        newDimensions.height = coordinateSystem.pdfUnitsToInches(newHeightBL);
        newLocation.x = snappedPos.x;
        break;
      case 'bottom-right':
        const newWidthBR = Math.max(minSizePdf, snappedPos.x - location.x);
        const newHeightBR = Math.max(minSizePdf, snappedPos.y - location.y);
        newDimensions.width = coordinateSystem.pdfUnitsToInches(newWidthBR);
        newDimensions.height = coordinateSystem.pdfUnitsToInches(newHeightBR);
        break;
      case 'top':
        const newHeightT = Math.max(minSizePdf, pdfHeight + (location.y - snappedPos.y));
        newDimensions.height = coordinateSystem.pdfUnitsToInches(newHeightT);
        newLocation.y = snappedPos.y;
        break;
      case 'bottom':
        const newHeightB = Math.max(minSizePdf, snappedPos.y - location.y);
        newDimensions.height = coordinateSystem.pdfUnitsToInches(newHeightB);
        break;
      case 'left':
        const newWidthL = Math.max(minSizePdf, pdfWidth + (location.x - snappedPos.x));
        newDimensions.width = coordinateSystem.pdfUnitsToInches(newWidthL);
        newLocation.x = snappedPos.x;
        break;
      case 'right':
        const newWidthR = Math.max(minSizePdf, snappedPos.x - location.x);
        newDimensions.width = coordinateSystem.pdfUnitsToInches(newWidthR);
        break;
    }

    const updatedBacking: BackingType = {
      ...backing,
      location: newLocation,
      dimensions: newDimensions,
      status: 'user_modified', // Mark as user modified when resized
    };

    onBackingUpdate(updatedBacking);
  };

  const renderResizeHandles = (backing: BackingType) => {
    if (selectedBackingId !== backing.id) return null;

    const { location, dimensions } = backing;
    const handleSize = coordinateSystem.getLineThickness(8);
    const handleRadius = handleSize / 2;

    // Convert backing dimensions to PDF units for positioning
    const pdfWidth = coordinateSystem.inchesToPdfUnits(dimensions.width);
    const pdfHeight = coordinateSystem.inchesToPdfUnits(dimensions.height);

    const handles = [
      { type: 'top-left', x: location.x, y: location.y },
      { type: 'top', x: location.x + pdfWidth / 2, y: location.y },
      { type: 'top-right', x: location.x + pdfWidth, y: location.y },
      { type: 'right', x: location.x + pdfWidth, y: location.y + pdfHeight / 2 },
      { type: 'bottom-right', x: location.x + pdfWidth, y: location.y + pdfHeight },
      { type: 'bottom', x: location.x + pdfWidth / 2, y: location.y + pdfHeight },
      { type: 'bottom-left', x: location.x, y: location.y + pdfHeight },
      { type: 'left', x: location.x, y: location.y + pdfHeight / 2 },
    ];

    return handles.map((handle) => {
      const screenPos = coordinateSystem.pdfToScreen({ x: handle.x, y: handle.y });
      return (
        <Circle
          key={`${backing.id}-${handle.type}`}
          x={screenPos.x}
          y={screenPos.y}
          radius={handleRadius}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={coordinateSystem.getLineThickness(1)}
          draggable
          onDragMove={(e) =>
            handleResizeHandleDrag(backing.id, handle.type, e.target.x(), e.target.y())
          }
          onMouseEnter={(e) => {
            e.target.getStage()!.container().style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            e.target.getStage()!.container().style.cursor = 'default';
          }}
        />
      );
    });
  };

  return (
    <>
      {backings.map((backing) => {
        const isSelected = selectedBackingId === backing.id;
        const isHovered = hoveredBackingId === backing.id;
        const { location, dimensions, status } = backing;

        // Convert PDF coordinates to screen coordinates
        const screenPos = coordinateSystem.pdfToScreen(location);
        const pdfWidth = coordinateSystem.inchesToPdfUnits(dimensions.width);
        const pdfHeight = coordinateSystem.inchesToPdfUnits(dimensions.height);
        const screenWidth = pdfWidth * coordinateSystem.getScaleFactor();
        const screenHeight = pdfHeight * coordinateSystem.getScaleFactor();

        return (
          <Group key={backing.id}>
            {/* Main backing rectangle */}
            <Rect
              x={screenPos.x}
              y={screenPos.y}
              width={screenWidth}
              height={screenHeight}
              fill={getStatusColor(status)}
              stroke={isSelected || isHovered ? getStatusStrokeColor(status) : 'transparent'}
              strokeWidth={isSelected ? coordinateSystem.getLineThickness(3) : isHovered ? coordinateSystem.getLineThickness(2) : 0}
              draggable
              onMouseEnter={() => {
                setHoveredBackingId(backing.id);
              }}
              onMouseLeave={() => {
                setHoveredBackingId(null);
              }}
              onClick={() => handleBackingClick(backing.id)}
              onDragStart={(e) =>
                handleBackingDragStart(backing.id, e.target.x(), e.target.y())
              }
              onDragMove={(e) =>
                handleBackingDragMove(backing.id, e.target.x(), e.target.y())
              }
              onDragEnd={handleBackingDragEnd}
            />

            {/* Selection outline */}
            {isSelected && (
              <Rect
                x={screenPos.x - coordinateSystem.getLineThickness(2)}
                y={screenPos.y - coordinateSystem.getLineThickness(2)}
                width={screenWidth + coordinateSystem.getLineThickness(4)}
                height={screenHeight + coordinateSystem.getLineThickness(4)}
                stroke="#3b82f6"
                strokeWidth={coordinateSystem.getLineThickness(1)}
                dash={[coordinateSystem.getLineThickness(5), coordinateSystem.getLineThickness(5)]}
                listening={false}
              />
            )}

            {/* Backing label */}
            <Text
              x={screenPos.x + coordinateSystem.getLineThickness(4)}
              y={screenPos.y + coordinateSystem.getLineThickness(4)}
              text={formatBackingLabel(backing)}
              fontSize={coordinateSystem.getFontSize(12)}
              fill="white"
              fontFamily="Arial"
              fontStyle="bold"
              listening={false}
              shadowColor="black"
              shadowBlur={2}
              shadowOffset={{ x: 1, y: 1 }}
            />

            {/* Status indicator */}
            <Rect
              x={screenPos.x + screenWidth - coordinateSystem.getLineThickness(20)}
              y={screenPos.y + coordinateSystem.getLineThickness(4)}
              width={coordinateSystem.getLineThickness(16)}
              height={coordinateSystem.getLineThickness(16)}
              fill={getStatusStrokeColor(status)}
              cornerRadius={coordinateSystem.getLineThickness(2)}
              listening={false}
            />

            {/* Dimensions text (when selected) */}
            {isSelected && (
              <>
                {/* Width dimension */}
                <Text
                  x={screenPos.x + screenWidth / 2}
                  y={screenPos.y - coordinateSystem.getLineThickness(20)}
                  text={`${dimensions.width}"`}
                  fontSize={coordinateSystem.getFontSize(10)}
                  fill="#3b82f6"
                  fontFamily="Arial"
                  align="center"
                  offsetX={coordinateSystem.getLineThickness(20)}
                  listening={false}
                />

                {/* Height dimension */}
                <Text
                  x={screenPos.x - coordinateSystem.getLineThickness(25)}
                  y={screenPos.y + screenHeight / 2}
                  text={`${dimensions.height}"`}
                  fontSize={coordinateSystem.getFontSize(10)}
                  fill="#3b82f6"
                  fontFamily="Arial"
                  align="center"
                  offsetY={coordinateSystem.getLineThickness(5)}
                  rotation={-90}
                  listening={false}
                />
              </>
            )}

            {/* Resize handles */}
            {renderResizeHandles(backing)}
          </Group>
        );
      })}
    </>
  );
}