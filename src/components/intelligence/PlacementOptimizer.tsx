import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Play, CheckCircle, RotateCcw, TrendingUp, Package } from 'lucide-react';
import { BackingPlacement, WallSegment, BackingZone } from '@/types';
import { intelligenceService } from '@/services/intelligenceService';

interface PlacementOptimizerProps {
  backings: BackingPlacement[];
  walls: WallSegment[];
  onOptimizationComplete: (optimizedBackings: BackingPlacement[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function PlacementOptimizer({ backings, walls, onOptimizationComplete, isProcessing, setIsProcessing }: PlacementOptimizerProps) {
  const [optimizedBackings, setOptimizedBackings] = useState<BackingPlacement[]>([]);
  const [optimizationZones, setOptimizationZones] = useState<BackingZone[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<{
    materialSaved: number;
    laborReduced: number;
    costSavings: number;
    zonesCreated: number;
  } | null>(null);
  const [settings, setSettings] = useState({
    groupingDistance: 24, // inches
    minimizeWaste: true,
    optimizeForSpeed: false,
    maintainStructural: true,
    allowCombining: true,
  });

  const startOptimization = async () => {
    if (backings.length === 0) {
      setError('No backing placements to optimize');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress with multiple steps
      const steps = [
        'Analyzing placement patterns...',
        'Grouping nearby backings...',
        'Optimizing material usage...',
        'Calculating zones...',
        'Finalizing layout...',
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 18, 90);
          if (newProgress >= (stepIndex + 1) * 18 && stepIndex < steps.length - 1) {
            stepIndex++;
          }
          return newProgress;
        });
      }, 400);

      const zones = await intelligenceService.optimizeBackings(backings);
      
      // Convert zones back to optimized backing placements
      const optimized: BackingPlacement[] = [];
      zones.forEach(zone => {
        zone.backings.forEach(backing => {
          optimized.push({
            ...backing,
            optimized: true,
            zoneId: zone.id,
          });
        });
      });

      // Calculate optimization results
      const originalMaterial = backings.reduce((sum, b) => sum + (b.width * b.height), 0);
      const optimizedMaterial = optimized.reduce((sum, b) => sum + (b.width * b.height), 0);
      const materialSaved = Math.max(0, originalMaterial - optimizedMaterial);
      
      const results = {
        materialSaved: materialSaved,
        laborReduced: zones.length < backings.length ? Math.round(((backings.length - zones.length) / backings.length) * 100) : 0,
        costSavings: Math.round(materialSaved * 0.15), // Rough cost calculation
        zonesCreated: zones.length,
      };
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setOptimizedBackings(optimized);
        setOptimizationZones(zones);
        setOptimizationResults(results);
        onOptimizationComplete(optimized);
        setIsProcessing(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      console.error('Optimization failed:', err);
      setError('Failed to optimize placements. Please try again.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const resetToOriginal = () => {
    setOptimizedBackings([]);
    setOptimizationZones([]);
    setOptimizationResults(null);
    onOptimizationComplete(backings);
  };

  const applyOptimization = () => {
    if (optimizedBackings.length > 0) {
      onOptimizationComplete(optimizedBackings);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Placement Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Optimize backing layouts for material efficiency and installation speed
            </p>
            <div className="flex items-center gap-2">
              {optimizedBackings.length > 0 && (
                <Button variant="outline" size="sm" onClick={resetToOriginal}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button onClick={startOptimization} disabled={isProcessing || backings.length === 0}>
                <Play className="h-4 w-4 mr-2" />
                {isProcessing ? 'Optimizing...' : 'Start Optimization'}
              </Button>
            </div>
          </div>

          {/* Optimization Settings */}
          <div className="border rounded-lg p-4 space-y-4">
            <span className="font-medium">Optimization Settings</span>
            
            <div className="space-y-2">
              <Label>Grouping Distance: {settings.groupingDistance}"</Label>
              <Slider
                value={[settings.groupingDistance]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, groupingDistance: value }))}
                min={6}
                max={48}
                step={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="minimize-waste" 
                  checked={settings.minimizeWaste}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, minimizeWaste: !!checked }))}
                />
                <label htmlFor="minimize-waste" className="text-sm">Minimize material waste</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="optimize-speed" 
                  checked={settings.optimizeForSpeed}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, optimizeForSpeed: !!checked }))}
                />
                <label htmlFor="optimize-speed" className="text-sm">Optimize for speed</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="structural" 
                  checked={settings.maintainStructural}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintainStructural: !!checked }))}
                />
                <label htmlFor="structural" className="text-sm">Maintain structural integrity</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="combining" 
                  checked={settings.allowCombining}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowCombining: !!checked }))}
                />
                <label htmlFor="combining" className="text-sm">Allow combining backings</label>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Optimizing placement layout...</span>
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
                Please add backing placements to begin optimization.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimizationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Optimization Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {optimizationResults.materialSaved.toFixed(0)} sq"
                </div>
                <p className="text-xs text-muted-foreground">Material Saved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {optimizationResults.laborReduced}%
                </div>
                <p className="text-xs text-muted-foreground">Labor Reduced</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${optimizationResults.costSavings}
                </div>
                <p className="text-xs text-muted-foreground">Cost Savings</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {optimizationResults.zonesCreated}
                </div>
                <p className="text-xs text-muted-foreground">Zones Created</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={applyOptimization}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Optimization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Zones */}
      {optimizationZones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Optimized Zones ({optimizationZones.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {optimizationZones.map((zone) => (
                  <div key={zone.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Zone {zone.id.slice(-3)}</Badge>
                        <span className="text-sm font-medium">
                          {zone.backings.length} backing(s)
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(zone.totalArea)} sq"
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Material: {zone.materialType}</div>
                      <div>
                        Dimensions: {Math.round(zone.bounds.width)}" × {Math.round(zone.bounds.height)}"
                      </div>
                      <div>
                        Center: ({Math.round(zone.center.x)}, {Math.round(zone.center.y)})
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