import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { DoorOpen, Play, CheckCircle, X, Settings, Eye } from 'lucide-react';
import { WallSegment, DoorOpening } from '@/types';

interface DoorDetectionProps {
  drawing?: any;
  walls: WallSegment[];
  onDoorsDetected: (doors: DoorOpening[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function DoorDetection({ drawing, walls, onDoorsDetected, isProcessing, setIsProcessing }: DoorDetectionProps) {
  const [detectedDoors, setDetectedDoors] = useState<DoorOpening[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    minWidth: 24, // inches
    maxWidth: 48, // inches
    detectSwingDirection: true,
    includeWindows: false,
  });

  const startDetection = async () => {
    if (!drawing || walls.length === 0) {
      setError('Please ensure a drawing is loaded and walls are detected first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 12, 90));
      }, 400);

      // Mock door detection based on wall openings
      const doors: DoorOpening[] = [];
      walls.forEach((wall, index) => {
        if (wall.openings) {
          wall.openings.forEach((opening, openingIndex) => {
            if (opening.width >= settings.minWidth && opening.width <= settings.maxWidth) {
              doors.push({
                id: `door-${wall.id}-${openingIndex}`,
                wallId: wall.id,
                position: opening.position,
                width: opening.width,
                height: opening.height || 84, // Standard door height
                type: opening.type === 'window' && settings.includeWindows ? 'window' : 'door',
                swingDirection: settings.detectSwingDirection ? 
                  (Math.random() > 0.5 ? 'left' : 'right') : undefined,
                clearanceRequired: 36, // ADA clearance
                confidence: 0.85 + Math.random() * 0.15,
              });
            }
          });
        }

        // Add some mock doors for demonstration
        if (index < 3) {
          doors.push({
            id: `door-${wall.id}-detected`,
            wallId: wall.id,
            position: {
              x: wall.startPoint.x + (wall.endPoint.x - wall.startPoint.x) * 0.3,
              y: wall.startPoint.y + (wall.endPoint.y - wall.startPoint.y) * 0.3,
            },
            width: 32 + Math.random() * 8,
            height: 84,
            type: 'door',
            swingDirection: Math.random() > 0.5 ? 'left' : 'right',
            clearanceRequired: 36,
            confidence: 0.75 + Math.random() * 0.25,
          });
        }
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setDetectedDoors(doors);
        onDoorsDetected(doors);
        setIsProcessing(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      console.error('Door detection failed:', err);
      setError('Failed to detect doors. Please try again.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const removeDoor = (doorId: string) => {
    const updatedDoors = detectedDoors.filter(d => d.id !== doorId);
    setDetectedDoors(updatedDoors);
    onDoorsDetected(updatedDoors);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      door: 'bg-blue-100 text-blue-800',
      window: 'bg-green-100 text-green-800',
      opening: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            Door & Opening Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Detect doors, windows, and openings with clearance requirements
            </p>
            <Button onClick={startDetection} disabled={isProcessing || !drawing || walls.length === 0}>
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? 'Detecting...' : 'Start Detection'}
            </Button>
          </div>

          {/* Detection Settings */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Detection Settings</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Width: {settings.minWidth}"</Label>
                <Slider
                  value={[settings.minWidth]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, minWidth: value }))}
                  min={12}
                  max={48}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Width: {settings.maxWidth}"</Label>
                <Slider
                  value={[settings.maxWidth]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, maxWidth: value }))}
                  min={24}
                  max={96}
                  step={1}
                />
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Analyzing openings and clearances...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!drawing && (
            <Alert>
              <AlertDescription>
                Please load a drawing to begin door detection.
              </AlertDescription>
            </Alert>
          )}

          {walls.length === 0 && drawing && (
            <Alert>
              <AlertDescription>
                Please detect walls first before analyzing doors and openings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {detectedDoors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Detected Openings ({detectedDoors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {detectedDoors.map((door) => (
                  <div key={door.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(door.type)}>
                            {door.type}
                          </Badge>
                          <span className="text-sm font-medium">
                            {door.width}" × {door.height}"
                          </span>
                          <span className={`text-xs font-medium ${getConfidenceColor(door.confidence)}`}>
                            {Math.round(door.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Position: ({Math.round(door.position.x)}, {Math.round(door.position.y)})
                          {door.swingDirection && ` • Swing: ${door.swingDirection}`}
                        </div>
                        <div className="text-xs text-blue-600">
                          Required clearance: {door.clearanceRequired}"
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeDoor(door.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}