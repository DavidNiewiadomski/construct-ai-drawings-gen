import { Layer, Line, Text, Group, Circle } from 'react-konva';
import { Measurement } from '@/types';
import { formatFeetInches, getMidpoint, calculateAngle } from '@/utils/measurements';
import { coordinateSystem } from '@/utils/coordinateSystem';

interface MeasurementOverlayProps {
  measurements: Measurement[];
  selectedMeasurementId?: string;
  onMeasurementSelect: (id: string) => void;
  onMeasurementDelete: (id: string) => void;
  zoom: number;
}

export function MeasurementOverlay({
  measurements,
  selectedMeasurementId,
  onMeasurementSelect,
  onMeasurementDelete,
  zoom
}: MeasurementOverlayProps) {
  const strokeWidth = coordinateSystem.getLineThickness(2);
  const textSize = coordinateSystem.getTextSize(12);
  const handleRadius = coordinateSystem.getLineThickness(4);

  const handleMeasurementClick = (measurement: Measurement) => {
    onMeasurementSelect(measurement.id);
  };

  const handleDeleteClick = (measurementId: string, e: any) => {
    e.cancelBubble = true;
    onMeasurementDelete(measurementId);
  };

  return (
    <Layer>
      {measurements.map((measurement) => {
        const isSelected = measurement.id === selectedMeasurementId;
        const startScreen = coordinateSystem.pdfToScreen(measurement.startPoint);
        const endScreen = coordinateSystem.pdfToScreen(measurement.endPoint);
        const midpoint = getMidpoint(startScreen, endScreen);
        const angle = calculateAngle(startScreen, endScreen);
        
        // Convert distance from PDF units to feet and format
        const distanceInFeet = measurement.distance / 12; // Assuming PDF units are inches
        const formattedDistance = formatFeetInches(distanceInFeet);

        return (
          <Group key={measurement.id}>
            {/* Measurement line */}
            <Line
              points={[startScreen.x, startScreen.y, endScreen.x, endScreen.y]}
              stroke={isSelected ? "#3b82f6" : "#ef4444"}
              strokeWidth={strokeWidth}
              onClick={() => handleMeasurementClick(measurement)}
              onTap={() => handleMeasurementClick(measurement)}
            />

            {/* Start point handle */}
            <Circle
              x={startScreen.x}
              y={startScreen.y}
              radius={handleRadius}
              fill={isSelected ? "#3b82f6" : "#ef4444"}
              stroke="#ffffff"
              strokeWidth={strokeWidth / 2}
              onClick={() => handleMeasurementClick(measurement)}
              onTap={() => handleMeasurementClick(measurement)}
            />

            {/* End point handle */}
            <Circle
              x={endScreen.x}
              y={endScreen.y}
              radius={handleRadius}
              fill={isSelected ? "#3b82f6" : "#ef4444"}
              stroke="#ffffff"
              strokeWidth={strokeWidth / 2}
              onClick={() => handleMeasurementClick(measurement)}
              onTap={() => handleMeasurementClick(measurement)}
            />

            {/* Distance label */}
            <Group
              x={midpoint.x}
              y={midpoint.y}
              rotation={angle > 90 || angle < -90 ? angle + 180 : angle}
            >
              <Text
                text={formattedDistance}
                fontSize={textSize}
                fill={isSelected ? "#3b82f6" : "#ef4444"}
                fontFamily="monospace"
                fontStyle="bold"
                align="center"
                verticalAlign="middle"
                offsetX={formattedDistance.length * textSize * 0.3}
                offsetY={textSize / 2}
                stroke="#ffffff"
                strokeWidth={1}
                onClick={() => handleMeasurementClick(measurement)}
                onTap={() => handleMeasurementClick(measurement)}
              />
            </Group>

            {/* Delete button for selected measurement */}
            {isSelected && (
              <Group x={endScreen.x + 20} y={endScreen.y - 20}>
                <Circle
                  radius={12}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth={2}
                  onClick={(e) => handleDeleteClick(measurement.id, e)}
                  onTap={(e) => handleDeleteClick(measurement.id, e)}
                />
                <Text
                  text="×"
                  fontSize={16}
                  fill="#ffffff"
                  fontStyle="bold"
                  align="center"
                  verticalAlign="middle"
                  offsetX={8}
                  offsetY={8}
                  onClick={(e) => handleDeleteClick(measurement.id, e)}
                  onTap={(e) => handleDeleteClick(measurement.id, e)}
                />
              </Group>
            )}
          </Group>
        );
      })}
    </Layer>
  );
}