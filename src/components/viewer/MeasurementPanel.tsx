import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Ruler, Trash2, Calculator } from 'lucide-react';
import { Measurement } from '@/types';
import { formatFeetInches, calculateTotalDistance } from '@/utils/measurements';

interface MeasurementPanelProps {
  measurements: Measurement[];
  selectedMeasurementId?: string;
  onMeasurementSelect: (id: string) => void;
  onMeasurementDelete: (id: string) => void;
  onClearAll: () => void;
}

export function MeasurementPanel({
  measurements,
  selectedMeasurementId,
  onMeasurementSelect,
  onMeasurementDelete,
  onClearAll
}: MeasurementPanelProps) {
  // Calculate total distance
  const totalDistance = measurements.reduce((sum, measurement) => sum + measurement.distance, 0);
  const totalInFeet = totalDistance / 12; // Assuming PDF units are inches
  const formattedTotal = formatFeetInches(totalInFeet);

  return (
    <Card className="w-80 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Measurements
        </CardTitle>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calculator className="h-3 w-3" />
            Total: {formattedTotal}
          </Badge>
          {measurements.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {measurements.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Ruler className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No measurements yet</p>
            <p className="text-xs">Use the measure tool to add measurements</p>
          </div>
        ) : (
          measurements.map((measurement, index) => {
            const isSelected = measurement.id === selectedMeasurementId;
            const distanceInFeet = measurement.distance / 12;
            const formattedDistance = formatFeetInches(distanceInFeet);

            return (
              <div key={measurement.id}>
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => onMeasurementSelect(measurement.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Measurement {index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formattedDistance}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Start: ({Math.round(measurement.startPoint.x)}, {Math.round(measurement.startPoint.y)})
                        <br />
                        End: ({Math.round(measurement.endPoint.x)}, {Math.round(measurement.endPoint.y)})
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMeasurementDelete(measurement.id);
                      }}
                      className="text-destructive hover:text-destructive p-1 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {index < measurements.length - 1 && <Separator className="my-2" />}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}