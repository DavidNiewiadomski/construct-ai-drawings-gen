import { Layer, Line, Text, Circle, Group } from 'react-konva';
import { Point } from '@/types';
import { formatFeetInches, calculateDistance, getMidpoint, calculateAngle } from '@/utils/measurements';
import { coordinateSystem } from '@/utils/coordinateSystem';

interface LiveMeasurementProps {
  startPoint: Point;
  currentPoint: Point;
  zoom: number;
}

export function LiveMeasurement({ startPoint, currentPoint, zoom }: LiveMeasurementProps) {
  const strokeWidth = coordinateSystem.getLineThickness(2);
  const textSize = coordinateSystem.getTextSize(12);
  const handleRadius = coordinateSystem.getLineThickness(4);

  const startScreen = coordinateSystem.pdfToScreen(startPoint);
  const currentScreen = coordinateSystem.pdfToScreen(currentPoint);
  const midpoint = getMidpoint(startScreen, currentScreen);
  const angle = calculateAngle(startScreen, currentScreen);
  
  // Calculate distance in PDF units and convert to feet
  const distancePdf = calculateDistance(startPoint, currentPoint);
  const distanceInFeet = distancePdf / 12; // Assuming PDF units are inches
  const formattedDistance = formatFeetInches(distanceInFeet);

  return (
    <Layer>
      <Group>
        {/* Live measurement line */}
        <Line
          points={[startScreen.x, startScreen.y, currentScreen.x, currentScreen.y]}
          stroke="#10b981"
          strokeWidth={strokeWidth}
          dash={[5, 5]}
        />

        {/* Start point */}
        <Circle
          x={startScreen.x}
          y={startScreen.y}
          radius={handleRadius}
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth={strokeWidth / 2}
        />

        {/* Current point */}
        <Circle
          x={currentScreen.x}
          y={currentScreen.y}
          radius={handleRadius}
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth={strokeWidth / 2}
        />

        {/* Live distance label */}
        <Group
          x={midpoint.x}
          y={midpoint.y}
          rotation={angle > 90 || angle < -90 ? angle + 180 : angle}
        >
          <Text
            text={formattedDistance}
            fontSize={textSize}
            fill="#10b981"
            fontFamily="monospace"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={formattedDistance.length * textSize * 0.3}
            offsetY={textSize / 2}
            stroke="#ffffff"
            strokeWidth={1}
          />
        </Group>
      </Group>
    </Layer>
  );
}