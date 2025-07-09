import { useState, useRef } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { BackingPlacement as BackingType } from '@/types';

interface BackingOverlayProps {
  backings: BackingType[];
  selectedBackingId: string | null;
  onBackingSelect: (id: string | null) => void;
  onBackingUpdate: (backing: BackingType) => void;
  gridSize?: number;
  zoom?: number;
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
  zoom = 1
}: BackingOverlayProps) {
  const [hoveredBackingId, setHoveredBackingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState<{ id: string; startX: number; startY: number } | null>(null);

  const snapToGrid = (value: number, grid: number = gridSize): number => {
    return Math.round(value / grid) * grid;
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

    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    const updatedBacking: BackingType = {
      ...backing,
      location: {
        ...backing.location,
        x: snappedX,
        y: snappedY,
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

    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    switch (handleType) {
      case 'top-left':
        newDimensions.width = Math.max(gridSize, dimensions.width + (location.x - snappedX));
        newDimensions.height = Math.max(gridSize, dimensions.height + (location.y - snappedY));
        newLocation.x = snappedX;
        newLocation.y = snappedY;
        break;
      case 'top-right':
        newDimensions.width = Math.max(gridSize, snappedX - location.x);
        newDimensions.height = Math.max(gridSize, dimensions.height + (location.y - snappedY));
        newLocation.y = snappedY;
        break;
      case 'bottom-left':
        newDimensions.width = Math.max(gridSize, dimensions.width + (location.x - snappedX));
        newDimensions.height = Math.max(gridSize, snappedY - location.y);
        newLocation.x = snappedX;
        break;
      case 'bottom-right':
        newDimensions.width = Math.max(gridSize, snappedX - location.x);
        newDimensions.height = Math.max(gridSize, snappedY - location.y);
        break;
      case 'top':
        newDimensions.height = Math.max(gridSize, dimensions.height + (location.y - snappedY));
        newLocation.y = snappedY;
        break;
      case 'bottom':
        newDimensions.height = Math.max(gridSize, snappedY - location.y);
        break;
      case 'left':
        newDimensions.width = Math.max(gridSize, dimensions.width + (location.x - snappedX));
        newLocation.x = snappedX;
        break;
      case 'right':
        newDimensions.width = Math.max(gridSize, snappedX - location.x);
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
    const handleSize = 8 / zoom;
    const handleRadius = handleSize / 2;

    const handles = [
      { type: 'top-left', x: location.x, y: location.y },
      { type: 'top', x: location.x + dimensions.width / 2, y: location.y },
      { type: 'top-right', x: location.x + dimensions.width, y: location.y },
      { type: 'right', x: location.x + dimensions.width, y: location.y + dimensions.height / 2 },
      { type: 'bottom-right', x: location.x + dimensions.width, y: location.y + dimensions.height },
      { type: 'bottom', x: location.x + dimensions.width / 2, y: location.y + dimensions.height },
      { type: 'bottom-left', x: location.x, y: location.y + dimensions.height },
      { type: 'left', x: location.x, y: location.y + dimensions.height / 2 },
    ];

    return handles.map((handle) => (
      <Circle
        key={`${backing.id}-${handle.type}`}
        x={handle.x}
        y={handle.y}
        radius={handleRadius}
        fill="white"
        stroke="#3b82f6"
        strokeWidth={1 / zoom}
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
    ));
  };

  return (
    <>
      {backings.map((backing) => {
        const isSelected = selectedBackingId === backing.id;
        const isHovered = hoveredBackingId === backing.id;
        const { location, dimensions, status } = backing;

        return (
          <Group key={backing.id}>
            {/* Main backing rectangle */}
            <Rect
              x={location.x}
              y={location.y}
              width={dimensions.width}
              height={dimensions.height}
              fill={getStatusColor(status)}
              stroke={isSelected || isHovered ? getStatusStrokeColor(status) : 'transparent'}
              strokeWidth={isSelected ? 3 / zoom : isHovered ? 2 / zoom : 0}
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
                x={location.x - 2 / zoom}
                y={location.y - 2 / zoom}
                width={dimensions.width + 4 / zoom}
                height={dimensions.height + 4 / zoom}
                stroke="#3b82f6"
                strokeWidth={1 / zoom}
                dash={[5 / zoom, 5 / zoom]}
                listening={false}
              />
            )}

            {/* Backing label */}
            <Text
              x={location.x + 4 / zoom}
              y={location.y + 4 / zoom}
              text={formatBackingLabel(backing)}
              fontSize={Math.max(10, 12 / zoom)}
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
              x={location.x + dimensions.width - 20 / zoom}
              y={location.y + 4 / zoom}
              width={16 / zoom}
              height={16 / zoom}
              fill={getStatusStrokeColor(status)}
              cornerRadius={2 / zoom}
              listening={false}
            />

            {/* Dimensions text (when selected) */}
            {isSelected && (
              <>
                {/* Width dimension */}
                <Text
                  x={location.x + dimensions.width / 2}
                  y={location.y - 20 / zoom}
                  text={`${dimensions.width}"`}
                  fontSize={Math.max(8, 10 / zoom)}
                  fill="#3b82f6"
                  fontFamily="Arial"
                  align="center"
                  offsetX={20 / zoom}
                  listening={false}
                />

                {/* Height dimension */}
                <Text
                  x={location.x - 25 / zoom}
                  y={location.y + dimensions.height / 2}
                  text={`${dimensions.height}"`}
                  fontSize={Math.max(8, 10 / zoom)}
                  fill="#3b82f6"
                  fontFamily="Arial"
                  align="center"
                  offsetY={5 / zoom}
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