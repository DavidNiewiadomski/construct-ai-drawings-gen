import { useState, useEffect } from 'react';
import { Settings, Zap, Package, CheckCircle, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AIBackingRule, AIBackingPlacement, AIDetectedComponent } from '@/types';

interface BackingGenerationStepProps {
  detectedComponents: AIDetectedComponent[];
  backingRules: AIBackingRule[];
  onRulesChange: (rules: AIBackingRule[]) => void;
  backingPlacements: AIBackingPlacement[];
  onPlacementsChange: (placements: AIBackingPlacement[]) => void;
}

// Mock backing rules for demo
const DEFAULT_BACKING_RULES: AIBackingRule[] = [
  {
    id: 'rule-1',
    name: 'Standard Outlet Backing',
    componentTypes: ['Outlet', 'Receptacle'],
    material: 'Plywood',
    thickness: 0.75,
    minSize: { width: 12, height: 12 },
    maxSize: { width: 24, height: 24 },
    margin: 2,
    priority: 1,
    conditions: {
      voltage: ['120V', '240V'],
      mounting: ['wall']
    }
  },
  {
    id: 'rule-2',
    name: 'Heavy Equipment Backing',
    componentTypes: ['Panel', 'Disconnect', 'Motor'],
    material: 'Steel Plate',
    thickness: 0.25,
    minSize: { width: 18, height: 18 },
    maxSize: { width: 48, height: 48 },
    margin: 4,
    priority: 2,
    conditions: {
      amperage: [30, 50, 100],
      mounting: ['wall', 'ceiling']
    }
  },
  {
    id: 'rule-3',
    name: 'Light Fixture Backing',
    componentTypes: ['Light Fixture'],
    material: 'Blocking',
    thickness: 1.5,
    minSize: { width: 8, height: 8 },
    maxSize: { width: 16, height: 16 },
    margin: 1,
    priority: 3,
    conditions: {
      mounting: ['ceiling']
    }
  }
];

const generateMockPlacements = (components: AIDetectedComponent[], rules: AIBackingRule[]): AIBackingPlacement[] => {
  const placements: AIBackingPlacement[] = [];
  
  components.filter(c => c.confirmed && c.needsBacking).forEach((component, index) => {
    const applicableRule = rules.find(rule => 
      rule.componentTypes.includes(component.type)
    ) || rules[0];
    
    if (applicableRule) {
      placements.push({
        id: `backing-${index + 1}`,
        componentId: component.id,
        ruleId: applicableRule.id,
        position: {
          x: component.position.x - (applicableRule.minSize.width / 2),
          y: component.position.y - (applicableRule.minSize.height / 2)
        },
        size: {
          width: applicableRule.minSize.width + Math.random() * 8,
          height: applicableRule.minSize.height + Math.random() * 8
        },
        material: applicableRule.material,
        thickness: applicableRule.thickness,
        notes: `Auto-generated for ${component.type}`,
        drawingId: component.drawingId
      });
    }
  });
  
  return placements;
};

export function BackingGenerationStep({
  detectedComponents,
  backingRules,
  onRulesChange,
  backingPlacements,
  onPlacementsChange
}: BackingGenerationStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Initialize rules if empty
  useEffect(() => {
    if (backingRules.length === 0) {
      onRulesChange(DEFAULT_BACKING_RULES);
    }
  }, [backingRules.length, onRulesChange]);

  const confirmedComponents = detectedComponents.filter(c => c.confirmed);
  const backingRequiredComponents = confirmedComponents.filter(c => c.needsBacking);
  const applicableComponents = backingRequiredComponents.filter(component =>
    backingRules.some(rule => rule.componentTypes.includes(component.type))
  );

  const handleGeneratePlacements = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate placements
    const newPlacements = generateMockPlacements(confirmedComponents, backingRules);
    onPlacementsChange(newPlacements);

    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const handleRegeneratePlacements = () => {
    handleGeneratePlacements();
  };

  const getRuleUsageCount = (ruleId: string) => {
    return backingPlacements.filter(p => p.ruleId === ruleId).length;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{confirmedComponents.length}</p>
                <p className="text-sm text-muted-foreground">Confirmed Components</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{backingRequiredComponents.length}</p>
                <p className="text-sm text-muted-foreground">Need Backing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{backingRules.length}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{backingPlacements.length}</p>
                <p className="text-sm text-muted-foreground">Generated Backings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Backing Generation</span>
            <Badge variant="outline">
              {applicableComponents.length} components applicable
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGenerating ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generating backing placements...</span>
                <span className="text-sm text-muted-foreground">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Generate backing placements for confirmed components using the configured rules.
                </p>
              </div>
              <div className="flex space-x-2">
                {backingPlacements.length > 0 && (
                  <Button variant="outline" onClick={handleRegeneratePlacements}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                )}
                <Button 
                  onClick={handleGeneratePlacements}
                  disabled={applicableComponents.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Generate Placements
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backing Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Backing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backingRules.map((rule) => {
              const usageCount = getRuleUsageCount(rule.id);
              
              return (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        For: {rule.componentTypes.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        Used {usageCount} time{usageCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline">Priority {rule.priority}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Material:</span>
                      <span className="ml-2 font-medium">{rule.material}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thickness:</span>
                      <span className="ml-2 font-medium">{rule.thickness}"</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min Size:</span>
                      <span className="ml-2 font-medium">
                        {rule.minSize.width}" × {rule.minSize.height}"
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Margin:</span>
                      <span className="ml-2 font-medium">{rule.margin}"</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Generated Placements Preview */}
      {backingPlacements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backingPlacements.slice(0, 5).map((placement) => {
                const component = detectedComponents.find(c => c.id === placement.componentId);
                const rule = backingRules.find(r => r.id === placement.ruleId);
                
                return (
                  <div key={placement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                    <div>
                      <p className="font-medium text-foreground">
                        {component?.type} Backing
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {placement.material} • {placement.thickness}" thick • 
                        {Math.round(placement.size.width)}" × {Math.round(placement.size.height)}"
                      </p>
                    </div>
                    <Badge variant="outline">{rule?.name}</Badge>
                  </div>
                );
              })}
              
              {backingPlacements.length > 5 && (
                <div className="text-center py-2">
                  <Badge variant="secondary">
                    +{backingPlacements.length - 5} more placements
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}