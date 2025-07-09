import { Layer, Line } from 'react-konva';
import { coordinateSystem } from '@/utils/coordinateSystem';

interface GridLayerProps {
  showGrid: boolean;
  gridSize: number;
  stageSize: { width: number; height: number };
}

export function GridLayer({ showGrid, gridSize, stageSize }: GridLayerProps) {
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

  return (
    <Layer>
      {lines}
    </Layer>
  );
}