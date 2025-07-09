import { useState } from 'react';
import { RefreshCw, Play, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DetectedComponent, BackingPlacement, BackingRule } from '@/types';

interface PlacementPreviewProps {
  components: DetectedComponent[];
  backings: BackingPlacement[];
  rules: BackingRule[];
  onBackingsChange: (backings: BackingPlacement[]) => void;
  onProceedToEditor: () => void;
  isGenerating?: boolean;
}

export function PlacementPreview({ 
  components, 
  backings, 
  rules, 
  onBackingsChange, 
  onProceedToEditor,
  isGenerating = false 
}: PlacementPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'original' | 'placements'>('placements');

  const stats = {
    totalBackings: backings.length,
    byType: backings.reduce((acc, backing) => {
      acc[backing.backingType] = (acc[backing.backingType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalMaterial: calculateTotalMaterial(backings),
    conflicts: detectConflicts(backings),
  };

  const handleRegenerateAll = () => {
    // This would trigger AI re-generation
    console.log('Regenerating all placements...');
  };

  const handleApplyRules = () => {
    // Apply current rules to generate new placements
    console.log('Applying rules to generate placements...');
  };

  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-primary animate-spin" />
            Generating Backing Placements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={75} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Analyzing {components.length} components and applying {rules.length} rules...
            </p>
            <div className="bg-muted/30 rounded-lg p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse text-4xl mb-2">🤖</div>
                <p className="text-sm text-muted-foreground">AI is working...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Generated Placements Preview
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateAll}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyRules}
            >
              Apply Rules
            </Button>
            <Button
              size="sm"
              onClick={onProceedToEditor}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Proceed to Editor
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Statistics</h3>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Backings:</span>
                    <Badge variant="secondary">{stats.totalBackings}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">By Type:</span>
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {type.replace('_', ' ')}:
                        </span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Est. Material:</span>
                    <span className="text-sm">{stats.totalMaterial}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conflicts:</span>
                    <Badge 
                      variant={stats.conflicts > 0 ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {stats.conflicts > 0 ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {stats.conflicts > 0 ? `${stats.conflicts} conflicts` : 'No conflicts'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-3">Component Coverage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Components detected:</span>
                    <span>{components.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Backings generated:</span>
                    <span>{backings.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Coverage:</span>
                    <span className="font-medium">
                      {components.length > 0 ? Math.round((backings.length / components.length) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={components.length > 0 ? (backings.length / components.length) * 100 : 0} 
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === 'original' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('original')}
              >
                Original + Detections
              </Button>
              <Button
                variant={previewMode === 'placements' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('placements')}
              >
                With Backing Placements
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="bg-slate-900 rounded-lg aspect-[4/3] flex items-center justify-center relative overflow-hidden">
                  {previewMode === 'original' ? (
                    <OriginalDrawingPreview components={components} />
                  ) : (
                    <PlacementsDrawingPreview components={components} backings={backings} />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Placement List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generated Placements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {backings.map((backing, index) => {
                    const component = components.find(c => c.id === backing.componentId);
                    return (
                      <div 
                        key={backing.id} 
                        className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                      >
                        <div>
                          <span className="font-medium">
                            {backing.backingType.replace('_', ' ')} 
                          </span>
                          <span className="text-muted-foreground ml-2">
                            for {component?.componentType || 'component'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {backing.dimensions.width}" × {backing.dimensions.height}"
                        </div>
                      </div>
                    );
                  })}
                  
                  {backings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p>No backing placements generated yet</p>
                      <p className="text-xs">Check your backing rules and try regenerating</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OriginalDrawingPreview({ components }: { components: DetectedComponent[] }) {
  return (
    <div className="w-full h-full relative bg-white/10 rounded">
      <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded flex items-center justify-center">
        <div className="text-center text-white/60">
          <div className="text-lg mb-2">📋 Original Drawing</div>
          <div className="text-sm">
            {components.length} component{components.length !== 1 ? 's' : ''} detected
          </div>
        </div>
      </div>
      
      {/* Mock detection boxes */}
      {components.slice(0, 5).map((component, index) => (
        <div
          key={component.id}
          className="absolute border-2 border-blue-400 bg-blue-400/20"
          style={{
            left: `${10 + index * 15}%`,
            top: `${20 + index * 10}%`,
            width: '60px',
            height: '40px',
          }}
        >
          <div className="absolute -top-6 left-0 text-xs text-blue-400 font-medium">
            {component.componentType}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlacementsDrawingPreview({ 
  components, 
  backings 
}: { 
  components: DetectedComponent[];
  backings: BackingPlacement[];
}) {
  return (
    <div className="w-full h-full relative bg-white/10 rounded">
      <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded flex items-center justify-center">
        <div className="text-center text-white/60">
          <div className="text-lg mb-2">🔧 With Backing Placements</div>
          <div className="text-sm">
            {backings.length} backing{backings.length !== 1 ? 's' : ''} generated
          </div>
        </div>
      </div>
      
      {/* Mock backing placements */}
      {backings.slice(0, 5).map((backing, index) => (
        <div
          key={backing.id}
          className="absolute border-2 border-orange-400 bg-orange-400/20"
          style={{
            left: `${8 + index * 15}%`,
            top: `${18 + index * 10}%`,
            width: '80px',
            height: '60px',
          }}
        >
          <div className="absolute -top-6 left-0 text-xs text-orange-400 font-medium">
            {backing.backingType}
          </div>
        </div>
      ))}
      
      {/* Mock components (smaller, behind backings) */}
      {components.slice(0, 5).map((component, index) => (
        <div
          key={component.id}
          className="absolute border border-blue-400/50 bg-blue-400/10"
          style={{
            left: `${18 + index * 15}%`,
            top: `${28 + index * 10}%`,
            width: '40px',
            height: '30px',
          }}
        />
      ))}
    </div>
  );
}

function calculateTotalMaterial(backings: BackingPlacement[]): string {
  const totalSquareFeet = backings.reduce((total, backing) => {
    const sqFt = (backing.dimensions.width * backing.dimensions.height) / 144;
    return total + sqFt;
  }, 0);
  
  return `${Math.round(totalSquareFeet)} sq ft`;
}

function detectConflicts(backings: BackingPlacement[]): number {
  let conflicts = 0;
  
  for (let i = 0; i < backings.length; i++) {
    for (let j = i + 1; j < backings.length; j++) {
      const a = backings[i];
      const b = backings[j];
      
      // Check for overlap (simplified)
      const overlap = !(
        a.location.x + a.dimensions.width < b.location.x ||
        b.location.x + b.dimensions.width < a.location.x ||
        a.location.y + a.dimensions.height < b.location.y ||
        b.location.y + b.dimensions.height < a.location.y
      );
      
      if (overlap) conflicts++;
    }
  }
  
  return conflicts;
}