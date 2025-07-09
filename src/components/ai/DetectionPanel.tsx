import { useState, useEffect } from 'react';
import { Check, X, ChevronDown, Eye, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { DetectedComponent } from '@/types';

interface DetectionPanelProps {
  components: DetectedComponent[];
  onComponentsChange: (components: DetectedComponent[]) => void;
  isLoading?: boolean;
}

const COMPONENT_TYPES = [
  { value: 'tv', label: 'TV Mount', icon: '📺' },
  { value: 'fire_extinguisher', label: 'Fire Extinguisher', icon: '🧯' },
  { value: 'sink', label: 'Sink', icon: '🚿' },
  { value: 'grab_bar', label: 'Grab Bar', icon: '🛠️' },
  { value: 'cabinet', label: 'Cabinet', icon: '🗄️' },
  { value: 'equipment', label: 'Equipment', icon: '⚙️' },
  { value: 'other', label: 'Other', icon: '❓' },
];

export function DetectionPanel({ components, onComponentsChange, isLoading }: DetectionPanelProps) {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [showOnlyLowConfidence, setShowOnlyLowConfidence] = useState(false);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-500 bg-green-500/10';
    if (confidence >= 0.7) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getComponentIcon = (type: string): string => {
    const typeData = COMPONENT_TYPES.find(t => t.value === type);
    return typeData?.icon || '❓';
  };

  const getComponentLabel = (type: string): string => {
    const typeData = COMPONENT_TYPES.find(t => t.value === type);
    return typeData?.label || 'Unknown';
  };

  const filteredComponents = components.filter(component => {
    if (showOnlyLowConfidence && component.confidence >= 0.7) return false;
    return component.confidence >= confidenceThreshold / 100;
  });

  const handleApprove = (componentId: string) => {
    const updatedComponents = components.map(comp =>
      comp.id === componentId ? { ...comp, confidence: Math.max(comp.confidence, 0.95) } : comp
    );
    onComponentsChange(updatedComponents);
  };

  const handleReject = (componentId: string) => {
    const updatedComponents = components.filter(comp => comp.id !== componentId);
    onComponentsChange(updatedComponents);
  };

  const handleTypeChange = (componentId: string, newType: string) => {
    const updatedComponents = components.map(comp =>
      comp.id === componentId ? { ...comp, componentType: newType as any } : comp
    );
    onComponentsChange(updatedComponents);
  };

  const handleSelectAll = () => {
    if (selectedComponents.length === filteredComponents.length) {
      setSelectedComponents([]);
    } else {
      setSelectedComponents(filteredComponents.map(c => c.id));
    }
  };

  const handleBulkApprove = () => {
    const updatedComponents = components.map(comp =>
      selectedComponents.includes(comp.id) 
        ? { ...comp, confidence: Math.max(comp.confidence, 0.95) }
        : comp
    );
    onComponentsChange(updatedComponents);
    setSelectedComponents([]);
  };

  const handleBulkReject = () => {
    const updatedComponents = components.filter(comp => !selectedComponents.includes(comp.id));
    onComponentsChange(updatedComponents);
    setSelectedComponents([]);
  };

  const approveAllAboveThreshold = () => {
    const updatedComponents = components.map(comp =>
      comp.confidence >= confidenceThreshold / 100
        ? { ...comp, confidence: Math.max(comp.confidence, 0.95) }
        : comp
    );
    onComponentsChange(updatedComponents);
  };

  const rejectAllBelowThreshold = () => {
    const updatedComponents = components.filter(comp => comp.confidence >= confidenceThreshold / 100);
    onComponentsChange(updatedComponents);
  };

  const stats = {
    total: components.length,
    highConfidence: components.filter(c => c.confidence >= 0.9).length,
    mediumConfidence: components.filter(c => c.confidence >= 0.7 && c.confidence < 0.9).length,
    lowConfidence: components.filter(c => c.confidence < 0.7).length,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
            Detecting Components
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={65} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Analyzing drawings with AI vision...
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
                  <div className="w-full h-32 bg-muted-foreground/20 rounded mb-3"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
                </div>
              ))}
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
            <Eye className="h-5 w-5 mr-2 text-primary" />
            Component Detection Results
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {filteredComponents.length} / {components.length} components
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.highConfidence}</div>
            <div className="text-xs text-muted-foreground">High (90%+)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.mediumConfidence}</div>
            <div className="text-xs text-muted-foreground">Medium (70-90%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.lowConfidence}</div>
            <div className="text-xs text-muted-foreground">Low (&lt;70%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters and Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Confidence:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm">{confidenceThreshold}%</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowConfidence"
                checked={showOnlyLowConfidence}
                onCheckedChange={(checked) => setShowOnlyLowConfidence(!!checked)}
              />
              <label htmlFor="lowConfidence" className="text-sm">
                Show only low confidence
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedComponents.length === filteredComponents.length ? 'Deselect All' : 'Select All'}
            </Button>
            
            {selectedComponents.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApprove}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve ({selectedComponents.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReject}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject ({selectedComponents.length})
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={approveAllAboveThreshold}
            >
              Approve {confidenceThreshold}%+
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={rejectAllBelowThreshold}
              className="text-red-600 hover:text-red-700"
            >
              Reject &lt;{confidenceThreshold}%
            </Button>
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((component) => (
            <Card key={component.id} className="relative">
              <CardContent className="p-4">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedComponents.includes(component.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedComponents([...selectedComponents, component.id]);
                      } else {
                        setSelectedComponents(selectedComponents.filter(id => id !== component.id));
                      }
                    }}
                  />
                </div>

                {/* Component Preview */}
                <div className="bg-muted rounded-lg p-4 mb-3 mt-4 flex items-center justify-center h-32">
                  <div className="text-4xl">{getComponentIcon(component.componentType)}</div>
                </div>

                {/* Component Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{getComponentIcon(component.componentType)}</span>
                    <Badge className={getConfidenceColor(component.confidence)}>
                      {Math.round(component.confidence * 100)}%
                    </Badge>
                  </div>

                  <div>
                    <Select
                      value={component.componentType}
                      onValueChange={(value) => handleTypeChange(component.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPONENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center">
                              <span className="mr-2">{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div>Text: "{component.text}"</div>
                    <div>
                      Size: {Math.round(component.boundingBox.width)}" × {Math.round(component.boundingBox.height)}"
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(component.id)}
                      className="flex-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(component.id)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Components Found</h3>
            <p className="text-muted-foreground">
              No components match your current filter criteria. Try adjusting the confidence threshold.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}