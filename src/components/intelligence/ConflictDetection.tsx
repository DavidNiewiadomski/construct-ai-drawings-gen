import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Play, CheckCircle, X, Lightbulb, RefreshCw } from 'lucide-react';
import { BackingPlacement, WallSegment, Clash } from '@/types';
import { intelligenceService } from '@/services/intelligenceService';

interface ConflictDetectionProps {
  backings: BackingPlacement[];
  walls: WallSegment[];
  onConflictsDetected: (conflicts: Clash[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function ConflictDetection({ backings, walls, onConflictsDetected, isProcessing, setIsProcessing }: ConflictDetectionProps) {
  const [conflicts, setConflicts] = useState<Clash[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [autoCheck, setAutoCheck] = useState(true);
  const [settings, setSettings] = useState({
    checkOverlaps: true,
    checkClearances: true,
    checkStructural: true,
    checkMEP: false,
  });

  // Auto-check when backings change
  useEffect(() => {
    if (autoCheck && backings.length > 0) {
      startDetection();
    }
  }, [backings, autoCheck]);

  const startDetection = async () => {
    if (backings.length === 0) {
      setError('No backing placements to analyze');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const detectedConflicts = await intelligenceService.detectClashes(backings, walls);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setConflicts(detectedConflicts);
        onConflictsDetected(detectedConflicts);
        setIsProcessing(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      console.error('Conflict detection failed:', err);
      setError('Failed to detect conflicts. Please try again.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const resolveConflict = (conflictId: string, resolution: string) => {
    const updatedConflicts = conflicts.filter(c => c.id !== conflictId);
    setConflicts(updatedConflicts);
    onConflictsDetected(updatedConflicts);
  };

  const dismissConflict = (conflictId: string) => {
    const updatedConflicts = conflicts.filter(c => c.id !== conflictId);
    setConflicts(updatedConflicts);
    onConflictsDetected(updatedConflicts);
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

  const getConflictTypeLabel = (type: string) => {
    const labels = {
      backing_overlap: 'Backing Overlap',
      door_clearance: 'Door Clearance',
      window_conflict: 'Window Conflict',
      structural_conflict: 'Structural Conflict',
      mep_conflict: 'MEP Conflict',
      insufficient_support: 'Insufficient Support',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const errorConflicts = conflicts.filter(c => c.severity === 'error');
  const warningConflicts = conflicts.filter(c => c.severity === 'warning');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Conflict Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Automatically detect conflicts between backings, doors, and other elements
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={startDetection} disabled={isProcessing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                Re-analyze
              </Button>
            </div>
          </div>

          {/* Auto-check setting */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-check" 
                  checked={autoCheck}
                  onCheckedChange={(checked) => setAutoCheck(!!checked)}
                />
                <label htmlFor="auto-check" className="text-sm">
                  Automatically check for conflicts when backings change
                </label>
              </div>

          {/* Detection Settings */}
          <div className="border rounded-lg p-4 space-y-3">
            <span className="font-medium">Check for:</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="overlaps" 
                  checked={settings.checkOverlaps}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, checkOverlaps: !!checked }))}
                />
                <label htmlFor="overlaps" className="text-sm">Backing overlaps</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="clearances" 
                  checked={settings.checkClearances}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, checkClearances: !!checked }))}
                />
                <label htmlFor="clearances" className="text-sm">Door clearances</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="structural" 
                  checked={settings.checkStructural}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, checkStructural: !!checked }))}
                />
                <label htmlFor="structural" className="text-sm">Structural conflicts</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mep" 
                  checked={settings.checkMEP}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, checkMEP: !!checked }))}
                />
                <label htmlFor="mep" className="text-sm">MEP conflicts</label>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Analyzing conflicts...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {backings.length === 0 && (
            <Alert>
              <AlertDescription>
                Please add backing placements to begin conflict detection.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!isProcessing && backings.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{errorConflicts.length}</div>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningConflicts.length}</div>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(0, backings.length - conflicts.length)}
                </div>
                <p className="text-xs text-muted-foreground">No Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts List */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Detected Conflicts ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(conflict.severity)}
                          <span className="font-medium">
                            {getConflictTypeLabel(conflict.type)}
                          </span>
                          <Badge variant={getSeverityColor(conflict.severity) as any}>
                            {conflict.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Affecting {conflict.items.length} item(s): {conflict.items.join(', ')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissConflict(conflict.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {conflict.resolution && (
                      <div className="bg-muted/30 rounded p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          Suggested Resolution
                        </div>
                        <p className="text-sm text-muted-foreground">{conflict.resolution}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => resolveConflict(conflict.id, conflict.resolution!)}
                          >
                            Apply Fix
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => dismissConflict(conflict.id)}
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {conflicts.length === 0 && !isProcessing && backings.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            No conflicts detected. All backings are properly positioned.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}