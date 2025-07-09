import { useState } from 'react';
import { 
  Hammer, Edit3, Eye, Settings, Zap, AlertTriangle, 
  CheckCircle, MapPin, Layers, Grid, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AIDetectedComponent, AIBackingRule, AIBackingPlacement } from '@/types';

interface BackingGenerationStepProps {
  detectedComponents: AIDetectedComponent[];
  backingRules?: AIBackingRule[];
  generatedPlacements?: AIBackingPlacement[];
  onPlacementsGenerated: (placements: AIBackingPlacement[]) => void;
}

// Mock backing rules with specific application data
const defaultBackingRules: AIBackingRule[] = [
  {
    id: 'rule-1',
    name: 'TV Mount <50lbs',
    componentTypes: ['tv_mount'],
    material: '2x6 Lumber',
    thickness: 1.5,
    minSize: { width: 48, height: 16 },
    maxSize: { width: 64, height: 24 },
    margin: 6,
    priority: 1,
    conditions: { maxWeight: 50 }
  },
  {
    id: 'rule-2', 
    name: 'TV Mount >50lbs',
    componentTypes: ['tv_mount'],
    material: '2x8 Lumber',
    thickness: 1.5,
    minSize: { width: 64, height: 24 },
    maxSize: { width: 96, height: 32 },
    margin: 8,
    priority: 2,
    conditions: { minWeight: 50 }
  },
  {
    id: 'rule-3',
    name: 'Fire Extinguisher',
    componentTypes: ['fire_extinguisher'],
    material: '3/4" Plywood',
    thickness: 0.75,
    minSize: { width: 16, height: 16 },
    maxSize: { width: 20, height: 20 },
    margin: 2,
    priority: 3
  },
  {
    id: 'rule-4',
    name: 'Grab Bar',
    componentTypes: ['grab_bar'],
    material: '2x6 Continuous',
    thickness: 1.5,
    minSize: { width: 48, height: 16 },
    maxSize: { width: 96, height: 24 },
    margin: 4,
    priority: 4
  },
  {
    id: 'rule-5',
    name: 'Heavy Equipment',
    componentTypes: ['sink', 'cabinet', 'water_heater'],
    material: '2x8 Lumber',
    thickness: 1.5,
    minSize: { width: 32, height: 16 },
    maxSize: { width: 72, height: 32 },
    margin: 6,
    priority: 5
  }
];

export function BackingGenerationStep({ 
  detectedComponents, 
  backingRules = defaultBackingRules,
  generatedPlacements = [],
  onPlacementsGenerated 
}: BackingGenerationStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [collisionDetection, setCollisionDetection] = useState(true);
  const [minimumSpacing, setMinimumSpacing] = useState([12]);
  const [groupSimilar, setGroupSimilar] = useState(true);
  const [optimizeMaterial, setOptimizeMaterial] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate rule applications
  const confirmedComponents = detectedComponents.filter(c => c.confirmed && c.needsBacking);
  
  const ruleApplications = backingRules.map(rule => {
    const matchingComponents = confirmedComponents.filter(component => 
      rule.componentTypes.includes(component.type)
    );
    
    const totalMaterial = matchingComponents.length * (
      (rule.minSize.width + rule.maxSize.width) / 2 * 
      (rule.minSize.height + rule.maxSize.height) / 2
    ) / 144; // Convert to square feet
    
    return {
      rule,
      componentCount: matchingComponents.length,
      components: matchingComponents,
      totalMaterial: Math.ceil(totalMaterial * 100) / 100,
      estimatedCost: totalMaterial * (rule.material.includes('Plywood') ? 45 : 8) // rough cost per sq ft
    };
  }).filter(app => app.componentCount > 0);

  // Calculate material summary
  const materialSummary = ruleApplications.reduce((acc, app) => {
    const material = app.rule.material;
    if (!acc[material]) {
      acc[material] = { quantity: 0, unit: material.includes('Plywood') ? 'sq ft' : 'linear ft' };
    }
    acc[material].quantity += app.totalMaterial;
    return acc;
  }, {} as Record<string, { quantity: number; unit: string }>);

  const handleGeneratePlacements = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate generation process
    const totalSteps = ruleApplications.length * 10;
    let currentStep = 0;
    
    const newPlacements: AIBackingPlacement[] = [];
    
    for (const application of ruleApplications) {
      for (const component of application.components) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const placement: AIBackingPlacement = {
          id: `placement-${component.id}`,
          componentId: component.id,
          ruleId: application.rule.id,
          position: {
            x: component.position.x - application.rule.margin,
            y: component.position.y - application.rule.margin
          },
          size: {
            width: application.rule.minSize.width + application.rule.margin * 2,
            height: application.rule.minSize.height + application.rule.margin * 2
          },
          material: application.rule.material,
          thickness: application.rule.thickness,
          notes: `Auto-generated for ${component.type}`,
          drawingId: component.drawingId || 'drawing-1'
        };
        
        newPlacements.push(placement);
        
        currentStep++;
        setGenerationProgress((currentStep / totalSteps) * 100);
      }
    }
    
    setIsGenerating(false);
    onPlacementsGenerated(newPlacements);
  };

  const handleEditRule = (ruleId: string) => {
    // TODO: Open rule editor
    console.log('Edit rule:', ruleId);
  };

  const handlePreviewPlacements = () => {
    setShowPreview(!showPreview);
    // TODO: Show placement preview overlay
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Backing Generation
          </h3>
          <p className="text-sm text-muted-foreground">
            Applying rules to {confirmedComponents.length} confirmed components
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handlePreviewPlacements}
            className={showPreview ? 'bg-primary/10' : ''}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          
          <Button 
            onClick={handleGeneratePlacements}
            disabled={isGenerating || ruleApplications.length === 0}
          >
            <Hammer className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Backings'}
          </Button>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generating backing placements...</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(generationProgress)}%
                </span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Generation Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="collision-detection">Collision Detection</Label>
                <p className="text-xs text-muted-foreground">Prevent overlapping backings</p>
              </div>
              <Switch
                id="collision-detection"
                checked={collisionDetection}
                onCheckedChange={setCollisionDetection}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="group-similar">Group Similar Components</Label>
                <p className="text-xs text-muted-foreground">Combine nearby components</p>
              </div>
              <Switch
                id="group-similar"
                checked={groupSimilar}
                onCheckedChange={setGroupSimilar}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="optimize-material">Optimize Material Usage</Label>
                <p className="text-xs text-muted-foreground">Minimize waste</p>
              </div>
              <Switch
                id="optimize-material"
                checked={optimizeMaterial}
                onCheckedChange={setOptimizeMaterial}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Minimum Spacing: {minimumSpacing[0]}"</Label>
              <Slider
                value={minimumSpacing}
                onValueChange={setMinimumSpacing}
                max={24}
                min={6}
                step={2}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Application Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5" />
            <span>Backing Rules Application</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ruleApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Component Type</TableHead>
                  <TableHead>Instances</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Total Needed</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ruleApplications.map((application) => (
                  <TableRow key={application.rule.id}>
                    <TableCell className="font-medium">
                      {application.rule.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {application.rule.componentTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {application.componentCount}
                      </Badge>
                    </TableCell>
                    <TableCell>{application.rule.material}</TableCell>
                    <TableCell>
                      {application.totalMaterial} {
                        application.rule.material.includes('Plywood') ? 'sq ft' : 'linear ft'
                      }
                    </TableCell>
                    <TableCell>${application.estimatedCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditRule(application.rule.id)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => console.log('Preview rule:', application.rule.id)}
                        >
                          <MapPin className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-foreground mb-2">
                No Applicable Rules Found
              </h4>
              <p className="text-muted-foreground">
                No backing rules match the confirmed components. Consider reviewing component classifications or adding custom rules.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Material Summary */}
      {Object.keys(materialSummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Grid className="h-5 w-5" />
              <span>Material Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(materialSummary).map(([material, data]) => (
                <div key={material} className="p-4 border rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">{material}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {data.quantity.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {data.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Estimated Total Cost:</span>
              <span className="text-xl font-bold text-primary">
                ${ruleApplications.reduce((sum, app) => sum + app.estimatedCost, 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {confirmedComponents.length}
                </p>
                <p className="text-sm text-muted-foreground">Components Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {ruleApplications.reduce((sum, app) => sum + app.componentCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Rules Applied</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {generatedPlacements.length}
                </p>
                <p className="text-sm text-muted-foreground">Placements Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}