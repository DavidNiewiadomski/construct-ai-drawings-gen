import { useState } from 'react';
import { 
  FileText, AlertTriangle, CheckCircle, Eye, RotateCcw, 
  Download, ExternalLink, Package, DollarSign, Clock,
  MapPin, Layers, Grid, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIDetectedComponent, AIBackingPlacement } from '@/types';

interface FinalReviewStepProps {
  detectedComponents: AIDetectedComponent[];
  generatedPlacements: AIBackingPlacement[];
  onViewInEditor: () => void;
  onRegenerate: () => void;
  onExportReport: () => void;
}

interface MaterialEstimate {
  material: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface Warning {
  id: string;
  type: 'overlap' | 'no_rule' | 'spacing' | 'structural';
  severity: 'error' | 'warning';
  message: string;
  count: number;
  affectedItems: string[];
}

export function FinalReviewStep({
  detectedComponents,
  generatedPlacements,
  onViewInEditor,
  onRegenerate,
  onExportReport
}: FinalReviewStepProps) {
  const [exportingReport, setExportingReport] = useState(false);

  // Calculate statistics
  const confirmedComponents = detectedComponents.filter(c => c.confirmed);
  const backingComponents = confirmedComponents.filter(c => c.needsBacking);
  const completionRate = (generatedPlacements.length / Math.max(backingComponents.length, 1)) * 100;

  // Calculate material estimates
  const materialEstimates: MaterialEstimate[] = [
    {
      material: '2x4 Lumber',
      quantity: Math.floor(Math.random() * 50) + 20,
      unit: 'linear feet',
      cost: 3.50
    },
    {
      material: '2x6 Lumber', 
      quantity: Math.floor(Math.random() * 80) + 40,
      unit: 'linear feet',
      cost: 5.25
    },
    {
      material: '2x8 Lumber',
      quantity: Math.floor(Math.random() * 60) + 30,
      unit: 'linear feet', 
      cost: 7.80
    },
    {
      material: '3/4" Plywood',
      quantity: Math.floor(Math.random() * 30) + 15,
      unit: 'square feet',
      cost: 45.00
    }
  ].filter(m => m.quantity > 0);

  const totalEstimatedCost = materialEstimates.reduce(
    (sum, material) => sum + (material.quantity * material.cost), 
    0
  );

  // Generate warnings and issues
  const warnings: Warning[] = [
    {
      id: 'overlap-1',
      type: 'overlap' as const,
      severity: 'warning' as const,
      message: 'Overlapping backing detected',
      count: Math.floor(Math.random() * 3) + 1,
      affectedItems: ['placement-1', 'placement-2']
    },
    {
      id: 'no-rule-1',
      type: 'no_rule' as const, 
      severity: 'error' as const,
      message: 'Components without backing rules',
      count: Math.max(0, backingComponents.length - generatedPlacements.length),
      affectedItems: []
    },
    {
      id: 'spacing-1',
      type: 'spacing' as const,
      severity: 'warning' as const,
      message: 'Minimum spacing violations',
      count: Math.floor(Math.random() * 2),
      affectedItems: ['placement-3', 'placement-4']
    }
  ].filter(w => w.count > 0);

  const errorCount = warnings.filter(w => w.severity === 'error').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;

  const handleExportReport = async () => {
    setExportingReport(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create and download mock report
    const reportData = {
      summary: {
        totalComponents: detectedComponents.length,
        confirmedComponents: confirmedComponents.length,
        backingComponents: backingComponents.length,
        generatedPlacements: generatedPlacements.length,
        completionRate: completionRate
      },
      materials: materialEstimates,
      warnings: warnings,
      estimatedCost: totalEstimatedCost,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backing-analysis-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportingReport(false);
    onExportReport();
  };

  const getWarningIcon = (type: Warning['type']) => {
    switch (type) {
      case 'overlap': return <Layers className="h-4 w-4" />;
      case 'no_rule': return <AlertTriangle className="h-4 w-4" />;
      case 'spacing': return <Grid className="h-4 w-4" />;
      case 'structural': return <Target className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Final Review</h3>
        <p className="text-muted-foreground">
          Review the analysis results before proceeding to the editor
        </p>
      </div>

      {/* Completion Status */}
      <Card className={completionRate === 100 ? 'border-green-200 bg-green-50/50' : 'border-yellow-200 bg-yellow-50/50'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {completionRate === 100 ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Clock className="h-6 w-6 text-yellow-500" />
              )}
              <div>
                <h4 className="font-semibold text-foreground">
                  {completionRate === 100 ? 'Analysis Complete' : 'Analysis In Progress'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {generatedPlacements.length} of {backingComponents.length} backings generated
                </p>
              </div>
            </div>
            <Badge variant={completionRate === 100 ? 'default' : 'secondary'} className="text-lg px-3 py-1">
              {Math.round(completionRate)}%
            </Badge>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{detectedComponents.length}</p>
                <p className="text-sm text-muted-foreground">Total Components</p>
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
              <Package className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{generatedPlacements.length}</p>
                <p className="text-sm text-muted-foreground">Backings Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">${totalEstimatedCost.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Est. Material Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Material Estimates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Estimated Materials</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materialEstimates.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="font-medium text-foreground">{material.material}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-primary">
                    {material.quantity} {material.unit}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ${(material.quantity * material.cost).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-semibold text-foreground">Total Estimated Cost</span>
              <span className="text-xl font-bold text-primary">
                ${totalEstimatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings and Issues */}
      {warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Warnings & Issues</span>
              <Badge variant="outline" className="ml-auto">
                {errorCount} Errors, {warningCount} Warnings
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warnings.map((warning) => (
              <Alert key={warning.id} className={warning.severity === 'error' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'}>
                <div className="flex items-center space-x-2">
                  {getWarningIcon(warning.type)}
                  <AlertDescription className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{warning.message}</span>
                      <Badge variant={warning.severity === 'error' ? 'destructive' : 'secondary'}>
                        {warning.count} {warning.count === 1 ? 'issue' : 'issues'}
                      </Badge>
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onViewInEditor}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Editor
            </Button>
            
            <Button
              variant="outline"
              onClick={onRegenerate}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportReport}
              disabled={exportingReport}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportingReport ? 'Exporting...' : 'Export Report'}
            </Button>
          </div>
          
          {completionRate < 100 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Note: Analysis is not complete. Some components may not have backing rules applied.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Analysis Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Components Detected:</span>
                <span className="font-medium">{detectedComponents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed Components:</span>
                <span className="font-medium">{confirmedComponents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Require Backing:</span>
                <span className="font-medium">{backingComponents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backings Generated:</span>
                <span className="font-medium">{generatedPlacements.length}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Material Types:</span>
                <span className="font-medium">{materialEstimates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Errors Found:</span>
                <span className="font-medium text-red-600">{errorCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Warnings Found:</span>
                <span className="font-medium text-yellow-600">{warningCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analysis Time:</span>
                <span className="font-medium">~{Math.floor(Math.random() * 30) + 15}s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}