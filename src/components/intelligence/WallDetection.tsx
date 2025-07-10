import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Play, CheckCircle, X, Eye } from 'lucide-react';
import { WallSegment } from '@/types';
import { intelligenceService } from '@/services/intelligenceService';

interface WallDetectionProps {
  drawing?: any;
  onWallsDetected: (walls: WallSegment[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function WallDetection({ drawing, onWallsDetected, isProcessing, setIsProcessing }: WallDetectionProps) {
  const [detectedWalls, setDetectedWalls] = useState<WallSegment[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startDetection = async () => {
    if (!drawing) {
      setError('No drawing provided for analysis');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      // Convert drawing to ImageData (mock implementation)
      const imageData = new ImageData(800, 600); // Mock image data
      const walls = await intelligenceService.detectWalls(imageData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setDetectedWalls(walls);
        onWallsDetected(walls);
        setIsProcessing(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      console.error('Wall detection failed:', err);
      setError('Failed to detect walls. Please try again.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const removeWall = (wallId: string) => {
    const updatedWalls = detectedWalls.filter(w => w.id !== wallId);
    setDetectedWalls(updatedWalls);
    onWallsDetected(updatedWalls);
  };

  const getWallTypeColor = (type: string) => {
    const colors = {
      exterior: 'bg-blue-100 text-blue-800',
      interior: 'bg-green-100 text-green-800',
      partition: 'bg-yellow-100 text-yellow-800',
      structural: 'bg-red-100 text-red-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Wall Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Automatically detect walls, openings, and structural elements from the drawing
            </p>
            <Button onClick={startDetection} disabled={isProcessing || !drawing}>
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? 'Detecting...' : 'Start Detection'}
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Analyzing drawing geometry...</span>
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
                Please load a drawing to begin wall detection.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {detectedWalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Detected Walls ({detectedWalls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {detectedWalls.map((wall) => (
                  <div key={wall.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getWallTypeColor(wall.type)}>
                            {wall.type}
                          </Badge>
                          <span className="text-sm font-medium">
                            {wall.length}"L × {wall.thickness}"T
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          From ({wall.startPoint.x}, {wall.startPoint.y}) to ({wall.endPoint.x}, {wall.endPoint.y})
                        </div>
                        {wall.openings && wall.openings.length > 0 && (
                          <div className="text-xs text-blue-600">
                            {wall.openings.length} opening(s) detected
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeWall(wall.id)}
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