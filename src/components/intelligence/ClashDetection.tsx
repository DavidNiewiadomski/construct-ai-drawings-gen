import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, X, RefreshCw, Lightbulb } from 'lucide-react';
import { Clash, BackingPlacement, WallSegment } from '@/types';
import { intelligenceService } from '@/services/intelligenceService';

interface ClashDetectionProps {
  backings: BackingPlacement[];
  walls: WallSegment[];
  onClashResolve: (clashId: string, resolution: string) => void;
}

export function ClashDetection({ backings, walls, onClashResolve }: ClashDetectionProps) {
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (backings.length > 0) {
      analyzeClashes();
    }
  }, [backings, walls]);

  const analyzeClashes = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      const detectedClashes = await intelligenceService.detectClashes(backings, walls);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      setTimeout(() => {
        setClashes(detectedClashes);
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
    } catch (error) {
      console.error('Clash analysis failed:', error);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const handleResolveClash = (clash: Clash, resolution: string) => {
    onClashResolve(clash.id, resolution);
    setClashes(prev => prev.filter(c => c.id !== clash.id));
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'error' ? (
      <AlertTriangle className="h-4 w-4 text-destructive" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    );
  };

  const getSeverityColor = (severity: string) => {
    return severity === 'error' ? 'destructive' : 'default';
  };

  const getClashTypeLabel = (type: string) => {
    const labels = {
      backing_overlap: 'Backing Overlap',
      door_swing: 'Door Clearance',
      window: 'Window Conflict',
      mep: 'MEP Conflict',
      structural: 'Structural Conflict',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const errorClashes = clashes.filter(c => c.severity === 'error');
  const warningClashes = clashes.filter(c => c.severity === 'warning');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Clash Detection
          </CardTitle>
          <Button variant="outline" size="sm" onClick={analyzeClashes} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Re-analyze
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Analyzing conflicts...</span>
            </div>
            <Progress value={analysisProgress} className="w-full" />
          </div>
        )}

        {!isAnalyzing && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{errorClashes.length}</div>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningClashes.length}</div>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {backings.length - clashes.length}
                </div>
                <p className="text-xs text-muted-foreground">No Issues</p>
              </div>
            </div>

            {clashes.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No conflicts detected. All backings are properly positioned.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {clashes.map((clash) => (
                    <div key={clash.id} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(clash.severity)}
                            <span className="font-medium">
                              {getClashTypeLabel(clash.type)}
                            </span>
                            <Badge variant={getSeverityColor(clash.severity) as any}>
                              {clash.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Affecting {clash.items.length} item(s): {clash.items.join(', ')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setClashes(prev => prev.filter(c => c.id !== clash.id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {clash.resolution && (
                        <div className="bg-muted/30 rounded p-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            Suggested Resolution
                          </div>
                          <p className="text-sm text-muted-foreground">{clash.resolution}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleResolveClash(clash, clash.resolution!)}
                            >
                              Apply Fix
                            </Button>
                            <Button variant="outline" size="sm">
                              Ignore
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}