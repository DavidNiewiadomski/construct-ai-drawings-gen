import { CheckCircle, Download, Eye, Package, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AIDetectedComponent, AIBackingPlacement } from '@/types';
import { FileCard } from '@/stores/uploadStore';

interface FinalReviewStepProps {
  selectedFiles: FileCard[];
  detectedComponents: AIDetectedComponent[];
  backingPlacements: AIBackingPlacement[];
  onComplete: () => void;
}

export function FinalReviewStep({
  selectedFiles,
  detectedComponents,
  backingPlacements,
  onComplete
}: FinalReviewStepProps) {
  const confirmedComponents = detectedComponents.filter(c => c.confirmed);
  const backingRequiredComponents = confirmedComponents.filter(c => c.needsBacking);
  
  // Group placements by material
  const placementsByMaterial = backingPlacements.reduce((acc, placement) => {
    const material = placement.material;
    if (!acc[material]) {
      acc[material] = [];
    }
    acc[material].push(placement);
    return acc;
  }, {} as Record<string, AIBackingPlacement[]>);

  // Calculate material quantities
  const materialSummary = Object.entries(placementsByMaterial).map(([material, placements]) => {
    const totalArea = placements.reduce((sum, p) => 
      sum + (p.size.width * p.size.height), 0
    ) / 144; // Convert to square feet
    
    const thicknesses = [...new Set(placements.map(p => p.thickness))];
    
    return {
      material,
      count: placements.length,
      totalArea: Math.ceil(totalArea * 100) / 100,
      thicknesses
    };
  });

  const handleExportResults = () => {
    const results = {
      processedFiles: selectedFiles.map(f => f.name),
      detectedComponents: confirmedComponents.length,
      backingPlacements: backingPlacements.length,
      materialSummary,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-processing-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isReadyToComplete = confirmedComponents.length > 0 && backingPlacements.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{selectedFiles.length}</p>
                <p className="text-sm text-muted-foreground">Files Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{confirmedComponents.length}</p>
                <p className="text-sm text-muted-foreground">Components Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{backingPlacements.length}</p>
                <p className="text-sm text-muted-foreground">Backings Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((backingPlacements.length / Math.max(backingRequiredComponents.length, 1)) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Coverage Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Files Processed</h4>
              <div className="space-y-2">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{file.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {file.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Component Types</h4>
              <div className="space-y-2">
                {Array.from(new Set(confirmedComponents.map(c => c.type))).map((type) => {
                  const count = confirmedComponents.filter(c => c.type === type).length;
                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span>{type}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Backing Materials</h4>
              <div className="space-y-2">
                {materialSummary.map((summary) => (
                  <div key={summary.material} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span>{summary.material}</span>
                      <Badge variant="secondary">{summary.count}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {summary.totalArea} sq ft • {summary.thicknesses.join(', ')}" thick
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Quantities */}
      {materialSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Material Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Material</th>
                    <th className="text-center p-2">Quantity</th>
                    <th className="text-center p-2">Total Area</th>
                    <th className="text-center p-2">Thickness</th>
                    <th className="text-right p-2">Est. Sheets (4'×8')</th>
                  </tr>
                </thead>
                <tbody>
                  {materialSummary.map((summary) => (
                    <tr key={summary.material} className="border-b">
                      <td className="p-2 font-medium">{summary.material}</td>
                      <td className="p-2 text-center">{summary.count} pieces</td>
                      <td className="p-2 text-center">{summary.totalArea} sq ft</td>
                      <td className="p-2 text-center">{summary.thicknesses.join(', ')}"</td>
                      <td className="p-2 text-right">
                        {Math.ceil(summary.totalArea / 32)} sheets
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {confirmedComponents.length > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm">
                {confirmedComponents.length > 0 
                  ? `${confirmedComponents.length} components confirmed and ready`
                  : 'No components confirmed yet'
                }
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {backingPlacements.length > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm">
                {backingPlacements.length > 0 
                  ? `${backingPlacements.length} backing placements generated`
                  : 'No backing placements generated yet'
                }
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {materialSummary.length > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm">
                {materialSummary.length > 0 
                  ? `Material requirements calculated for ${materialSummary.length} material types`
                  : 'No material requirements calculated'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleExportResults}>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>

        <div className="flex items-center space-x-3">
          {!isReadyToComplete && (
            <div className="text-sm text-muted-foreground">
              Complete previous steps to proceed
            </div>
          )}
          
          <Button 
            onClick={onComplete}
            disabled={!isReadyToComplete}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete & Apply Results
          </Button>
        </div>
      </div>
    </div>
  );
}