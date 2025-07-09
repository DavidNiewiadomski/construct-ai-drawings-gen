import { Group, Rect, Text } from 'react-konva';
import { BackingPlacement as BackingType } from '@/types';

interface BackingPlacementProps {
  backing: BackingType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (backing: BackingType) => void;
  zoom: number;
}

const BACKING_COLORS = {
  ai_generated: '#3b82f6', // blue
  user_modified: '#f97316', // orange
  approved: '#10b981', // green
};

export function BackingPlacement({ 
  backing, 
  isSelected, 
  onSelect, 
  onUpdate, 
  zoom 
}: BackingPlacementProps) {
  const color = BACKING_COLORS[backing.status];
  const strokeWidth = 2 / zoom;
  const fontSize = Math.max(10 / zoom, 8);
  
  const handleDragEnd = (e: any) => {
    const updatedBacking: BackingType = {
      ...backing,
      location: {
        ...backing.location,
        x: e.target.x(),
        y: e.target.y(),
      },
    };
    onUpdate(updatedBacking);
  };

  const formatBackingLabel = (backing: BackingType): string => {
    const type = backing.backingType.replace('_', ' ');
    const height = Math.round(backing.location.z);
    return `${type} @ ${height}" AFF`;
  };

  return (
    <Group
      x={backing.location.x}
      y={backing.location.y}
      draggable={isSelected}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Main rectangle */}
      <Rect
        width={backing.dimensions.width}
        height={backing.dimensions.height}
        fill={color}
        fillEnabled={true}
        opacity={0.6}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeEnabled={true}
        shadowColor={color}
        shadowBlur={isSelected ? 10 / zoom : 0}
        shadowOffset={{ x: 0, y: 0 }}
        shadowOpacity={isSelected ? 0.5 : 0}
      />

      {/* Selection outline */}
      {isSelected && (
        <Rect
          width={backing.dimensions.width}
          height={backing.dimensions.height}
          fill="transparent"
          stroke="white"
          strokeWidth={strokeWidth * 2}
          dash={[5 / zoom, 5 / zoom]}
        />
      )}

      {/* Resize handles when selected */}
      {isSelected && (
        <>
          {/* Corner handles */}
          {[
            { x: 0, y: 0 },
            { x: backing.dimensions.width, y: 0 },
            { x: backing.dimensions.width, y: backing.dimensions.height },
            { x: 0, y: backing.dimensions.height },
          ].map((corner, index) => (
            <Rect
              key={index}
              x={corner.x - 4 / zoom}
              y={corner.y - 4 / zoom}
              width={8 / zoom}
              height={8 / zoom}
              fill="white"
              stroke={color}
              strokeWidth={strokeWidth}
              draggable
              onDragMove={(e) => {
                // Handle resize logic here
                const newX = e.target.x() + 4 / zoom;
                const newY = e.target.y() + 4 / zoom;
                
                // Update dimensions based on which corner is being dragged
                let newWidth = backing.dimensions.width;
                let newHeight = backing.dimensions.height;
                let newLocationX = backing.location.x;
                let newLocationY = backing.location.y;
                
                switch (index) {
                  case 0: // Top-left
                    newWidth = backing.dimensions.width - newX;
                    newHeight = backing.dimensions.height - newY;
                    newLocationX = backing.location.x + newX;
                    newLocationY = backing.location.y + newY;
                    break;
                  case 1: // Top-right
                    newWidth = newX;
                    newHeight = backing.dimensions.height - newY;
                    newLocationY = backing.location.y + newY;
                    break;
                  case 2: // Bottom-right
                    newWidth = newX;
                    newHeight = newY;
                    break;
                  case 3: // Bottom-left
                    newWidth = backing.dimensions.width - newX;
                    newHeight = newY;
                    newLocationX = backing.location.x + newX;
                    break;
                }
                
                if (newWidth > 12 && newHeight > 12) {
                  const updatedBacking: BackingType = {
                    ...backing,
                    dimensions: {
                      ...backing.dimensions,
                      width: Math.max(12, newWidth),
                      height: Math.max(12, newHeight),
                    },
                    location: {
                      ...backing.location,
                      x: newLocationX,
                      y: newLocationY,
                    },
                  };
                  onUpdate(updatedBacking);
                }
              }}
            />
          ))}
        </>
      )}

      {/* Label */}
      <Text
        x={backing.dimensions.width / 2}
        y={backing.dimensions.height + 8 / zoom}
        text={formatBackingLabel(backing)}
        fontSize={fontSize}
        fill="white"
        align="center"
        offsetX={0}
        fontFamily="Inter, sans-serif"
        fontStyle="500"
      />

      {/* Dimensions */}
      {isSelected && (
        <>
          {/* Width dimension */}
          <Text
            x={backing.dimensions.width / 2}
            y={-16 / zoom}
            text={`${Math.round(backing.dimensions.width)}"`}
            fontSize={fontSize * 0.8}
            fill="white"
            align="center"
            fontFamily="Inter, sans-serif"
          />
          
          {/* Height dimension */}
          <Text
            x={-20 / zoom}
            y={backing.dimensions.height / 2}
            text={`${Math.round(backing.dimensions.height)}"`}
            fontSize={fontSize * 0.8}
            fill="white"
            align="center"
            rotation={-90}
            fontFamily="Inter, sans-serif"
          />
        </>
      )}
    </Group>
  );
}