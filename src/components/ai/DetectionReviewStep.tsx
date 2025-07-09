import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIDetectedComponent } from '@/types';

interface DetectionReviewStepProps {
  detectedComponents: AIDetectedComponent[];
  onComponentsChange: (components: AIDetectedComponent[]) => void;
}

export function DetectionReviewStep({ 
  detectedComponents, 
  onComponentsChange 
}: DetectionReviewStepProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'needsReview' | 'confirmed'>('all');

  const confirmedComponents = detectedComponents.filter(c => c.confirmed);
  const needsReviewComponents = detectedComponents.filter(c => !c.confirmed && c.confidence < 0.9);
  const backingRequiredComponents = detectedComponents.filter(c => c.needsBacking);

  const handleComponentToggle = (componentId: string) => {
    onComponentsChange(
      detectedComponents.map(component =>
        component.id === componentId
          ? { ...component, confirmed: !component.confirmed }
          : component
      )
    );
  };

  const handleConfirmAll = () => {
    onComponentsChange(
      detectedComponents.map(component => ({ ...component, confirmed: true }))
    );
  };

  const handleRejectAll = () => {
    onComponentsChange(
      detectedComponents.map(component => ({ ...component, confirmed: false }))
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  const filteredComponents = () => {
    switch (viewMode) {
      case 'needsReview':
        return needsReviewComponents;
      case 'confirmed':
        return confirmedComponents;
      default:
        return detectedComponents;
    }
  };

  const overallConfidence = detectedComponents.length > 0 
    ? detectedComponents.reduce((sum, c) => sum + c.confidence, 0) / detectedComponents.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{detectedComponents.length}</p>
                <p className="text-sm text-muted-foreground">Components Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{confirmedComponents.length}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{needsReviewComponents.length}</p>
                <p className="text-sm text-muted-foreground">Needs Review</p>
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
      </div>

      {/* Overall Confidence */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">Overall Detection Confidence</h4>
            <Badge variant="outline" className={getConfidenceColor(overallConfidence)}>
              {getConfidenceLabel(overallConfidence)} ({Math.round(overallConfidence * 100)}%)
            </Badge>
          </div>
          <Progress value={overallConfidence * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleConfirmAll}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirm All
          </Button>
          <Button variant="outline" size="sm" onClick={handleRejectAll}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject All
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <TabsList>
            <TabsTrigger value="all">All ({detectedComponents.length})</TabsTrigger>
            <TabsTrigger value="needsReview">Review ({needsReviewComponents.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedComponents.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Components List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredComponents().map((component) => (
          <Card
            key={component.id}
            className={`
              cursor-pointer transition-all duration-200 hover:shadow-md
              ${component.confirmed 
                ? 'border-green-200 bg-green-50/50' 
                : component.confidence < 0.7
                ? 'border-red-200 bg-red-50/50'
                : 'border-yellow-200 bg-yellow-50/50'
              }
              ${selectedComponent === component.id ? 'ring-2 ring-primary' : ''}
            `}
            onClick={() => setSelectedComponent(
              selectedComponent === component.id ? null : component.id
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{component.type}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getConfidenceColor(component.confidence)}`}
                  >
                    {Math.round(component.confidence * 100)}%
                  </Badge>
                  <Checkbox
                    checked={component.confirmed}
                    onCheckedChange={() => handleComponentToggle(component.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-mono text-xs">
                    ({Math.round(component.position.x)}, {Math.round(component.position.y)})
                  </span>
                </div>
                
                {component.properties && (
                  <div className="space-y-1">
                    {Object.entries(component.properties).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    {component.needsBacking && (
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Needs Backing
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {component.confirmed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComponents().length === 0 && (
        <div className="text-center py-8">
          <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Components to Show
          </h3>
          <p className="text-muted-foreground">
            {viewMode === 'needsReview' 
              ? 'All components have high confidence scores.'
              : viewMode === 'confirmed'
              ? 'No components have been confirmed yet.'
              : 'No components detected.'
            }
          </p>
        </div>
      )}
    </div>
  );
}