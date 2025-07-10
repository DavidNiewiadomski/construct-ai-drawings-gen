import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  FileText,
  Target,
  Ruler,
  Weight,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtractedRequirement {
  id: string;
  specSection: string;
  pageNumber: number;
  text: string;
  parsedData: {
    componentType?: string;
    backingType?: string;
    dimensions?: { width: number; height: number };
    heightAFF?: number;
    weight?: number;
    notes?: string;
  };
  confidence: number;
  applied: boolean;
}

interface RequirementExtractorProps {
  specifications?: any[];
  onRequirementApplied?: (requirement: ExtractedRequirement) => void;
  onRequirementsChanged?: (requirements: ExtractedRequirement[]) => void;
}

interface RequirementCardProps {
  requirement: ExtractedRequirement;
  onEdit: (updates: Partial<ExtractedRequirement['parsedData']>) => void;
  onApply: () => void;
  onDelete: () => void;
}

const COMPONENT_TYPES = [
  { value: 'tv', label: 'Television/Monitor' },
  { value: 'fire_extinguisher', label: 'Fire Extinguisher' },
  { value: 'grab_bar', label: 'Grab Bar' },
  { value: 'sink', label: 'Sink/Lavatory' },
  { value: 'cabinet', label: 'Cabinet/Millwork' },
  { value: 'equipment', label: 'Equipment Mount' },
  { value: 'other', label: 'Other' }
];

const BACKING_TYPES = [
  { value: '2x4', label: '2x4 Lumber' },
  { value: '2x6', label: '2x6 Lumber' },
  { value: '2x8', label: '2x8 Lumber' },
  { value: '2x10', label: '2x10 Lumber' },
  { value: '3/4_plywood', label: '3/4" Plywood' },
  { value: '1/2_plywood', label: '1/2" Plywood' },
  { value: 'steel_plate', label: 'Steel Plate' },
  { value: 'blocking', label: 'Blocking' }
];

function RequirementCard({ requirement, onEdit, onApply, onDelete }: RequirementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(requirement.parsedData);

  const handleSave = () => {
    onEdit(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(requirement.parsedData);
    setIsEditing(false);
  };

  const confidenceColor = requirement.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                         requirement.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                         'bg-red-100 text-red-800';

  return (
    <Card className={cn(
      "transition-all duration-200",
      requirement.applied && "border-green-200 bg-green-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Page {requirement.pageNumber}
              </Badge>
              <Badge className={cn("text-xs", confidenceColor)}>
                {Math.round(requirement.confidence * 100)}% confidence
              </Badge>
              {requirement.applied && (
                <Badge className="text-xs bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Applied
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm">{requirement.specSection}</CardTitle>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              disabled={requirement.applied}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={requirement.applied}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Original Text */}
        <div>
          <Label className="text-xs text-muted-foreground">Original Text</Label>
          <div className="text-xs bg-gray-50 p-2 rounded border max-h-20 overflow-y-auto">
            {requirement.text}
          </div>
        </div>

        <Separator />

        {/* Parsed Data */}
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Component Type</Label>
                <Select
                  value={editData.componentType || ''}
                  onValueChange={(value) => setEditData({ ...editData, componentType: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPONENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Backing Type</Label>
                <Select
                  value={editData.backingType || ''}
                  onValueChange={(value) => setEditData({ ...editData, backingType: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select backing" />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKING_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Height AFF (inches)</Label>
                <Input
                  type="number"
                  value={editData.heightAFF || ''}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    heightAFF: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  className="h-8"
                  placeholder="48"
                />
              </div>
              
              <div>
                <Label className="text-xs">Width (inches)</Label>
                <Input
                  type="number"
                  value={editData.dimensions?.width || ''}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    dimensions: { 
                      ...editData.dimensions, 
                      width: e.target.value ? parseInt(e.target.value) : 0,
                      height: editData.dimensions?.height || 0
                    }
                  })}
                  className="h-8"
                  placeholder="24"
                />
              </div>
              
              <div>
                <Label className="text-xs">Height (inches)</Label>
                <Input
                  type="number"
                  value={editData.dimensions?.height || ''}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    dimensions: { 
                      ...editData.dimensions, 
                      width: editData.dimensions?.width || 0,
                      height: e.target.value ? parseInt(e.target.value) : 0
                    }
                  })}
                  className="h-8"
                  placeholder="6"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Weight Capacity (lbs)</Label>
              <Input
                type="number"
                value={editData.weight || ''}
                onChange={(e) => setEditData({ 
                  ...editData, 
                  weight: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="h-8"
                placeholder="50"
              />
            </div>

            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={editData.notes || ''}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                className="min-h-[60px]"
                placeholder="Additional notes or requirements..."
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Display parsed data */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                {requirement.parsedData.componentType && (
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Component:</span>
                    <Badge variant="outline" className="text-xs">
                      {COMPONENT_TYPES.find(t => t.value === requirement.parsedData.componentType)?.label}
                    </Badge>
                  </div>
                )}
                
                {requirement.parsedData.backingType && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Backing:</span>
                    <Badge variant="outline" className="text-xs">
                      {BACKING_TYPES.find(t => t.value === requirement.parsedData.backingType)?.label}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                {requirement.parsedData.heightAFF && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Height:</span>
                    <span>{requirement.parsedData.heightAFF}" AFF</span>
                  </div>
                )}
                
                {requirement.parsedData.weight && (
                  <div className="flex items-center gap-2">
                    <Weight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{requirement.parsedData.weight} lbs</span>
                  </div>
                )}
              </div>
            </div>

            {requirement.parsedData.dimensions && (
              <div className="text-xs">
                <span className="text-muted-foreground">Dimensions: </span>
                <span>{requirement.parsedData.dimensions.width}" × {requirement.parsedData.dimensions.height}"</span>
              </div>
            )}

            {requirement.parsedData.notes && (
              <div className="text-xs">
                <span className="text-muted-foreground">Notes: </span>
                <span>{requirement.parsedData.notes}</span>
              </div>
            )}

            {!requirement.applied && (
              <Button 
                size="sm" 
                onClick={onApply}
                className="w-full mt-3"
                disabled={!requirement.parsedData.componentType || !requirement.parsedData.backingType}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Apply Requirement
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RequirementExtractor({ 
  specifications = [], 
  onRequirementApplied,
  onRequirementsChanged 
}: RequirementExtractorProps) {
  const [requirements, setRequirements] = useState<ExtractedRequirement[]>([]);
  const [selectedText, setSelectedText] = useState('');

  // Parse selected text for backing requirements
  const parseRequirement = useCallback((text: string): ExtractedRequirement['parsedData'] => {
    const parsed: ExtractedRequirement['parsedData'] = {};
    
    // Extract backing type
    const backingPatterns = [
      { pattern: /(\d+x\d+)\s*(lumber|wood|stud)/i, type: (match: RegExpMatchArray) => match[1] },
      { pattern: /(3\/4|1\/2)["']?\s*(plywood|ply)/i, type: (match: RegExpMatchArray) => `${match[1]}_plywood` },
      { pattern: /(\d+)\s*gauge\s*steel/i, type: () => 'steel_plate' },
      { pattern: /blocking/i, type: () => 'blocking' }
    ];

    for (const { pattern, type } of backingPatterns) {
      const match = text.match(pattern);
      if (match) {
        parsed.backingType = type(match);
        break;
      }
    }
    
    // Extract height AFF
    const heightMatch = text.match(/(\d+)["']?\s*(AFF|above\s*finished\s*floor)/i);
    if (heightMatch) {
      parsed.heightAFF = parseInt(heightMatch[1]);
    }
    
    // Extract weight
    const weightMatch = text.match(/(\d+)\s*(lbs?|pounds?)/i);
    if (weightMatch) {
      parsed.weight = parseInt(weightMatch[1]);
    }

    // Extract dimensions
    const dimensionMatch = text.match(/(\d+)["']?\s*x\s*(\d+)["']?/i);
    if (dimensionMatch) {
      parsed.dimensions = {
        width: parseInt(dimensionMatch[1]),
        height: parseInt(dimensionMatch[2])
      };
    }
    
    // Detect component type from context
    const componentTypes = {
      'tv': ['television', 'tv', 'display', 'monitor', 'flat panel'],
      'fire_extinguisher': ['fire extinguisher', 'extinguisher', 'FE'],
      'grab_bar': ['grab bar', 'handrail', 'rail', 'safety bar'],
      'sink': ['sink', 'lavatory', 'basin', 'washbasin'],
      'cabinet': ['cabinet', 'millwork', 'casework', 'cabinetry'],
      'equipment': ['equipment', 'mechanical', 'electrical', 'device']
    };
    
    for (const [type, keywords] of Object.entries(componentTypes)) {
      if (keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()))) {
        parsed.componentType = type;
        break;
      }
    }
    
    return parsed;
  }, []);

  const addRequirement = useCallback((text: string, pageNumber: number, specSection: string) => {
    const parsedData = parseRequirement(text);
    
    // Calculate confidence score
    let confidence = 0.3; // Base confidence
    if (parsedData.backingType) confidence += 0.3;
    if (parsedData.componentType) confidence += 0.2;
    if (parsedData.heightAFF) confidence += 0.1;
    if (parsedData.weight) confidence += 0.1;
    
    const newRequirement: ExtractedRequirement = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      specSection,
      pageNumber,
      text: text.trim(),
      parsedData,
      confidence: Math.min(confidence, 1.0),
      applied: false
    };

    setRequirements(prev => {
      const updated = [...prev, newRequirement];
      onRequirementsChanged?.(updated);
      return updated;
    });
  }, [parseRequirement, onRequirementsChanged]);

  const updateRequirement = useCallback((id: string, updates: Partial<ExtractedRequirement['parsedData']>) => {
    setRequirements(prev => {
      const updated = prev.map(req => 
        req.id === id 
          ? { ...req, parsedData: { ...req.parsedData, ...updates } }
          : req
      );
      onRequirementsChanged?.(updated);
      return updated;
    });
  }, [onRequirementsChanged]);

  const applyRequirement = useCallback((id: string) => {
    setRequirements(prev => {
      const updated = prev.map(req => 
        req.id === id ? { ...req, applied: true } : req
      );
      const appliedReq = updated.find(req => req.id === id);
      if (appliedReq) {
        onRequirementApplied?.(appliedReq);
      }
      onRequirementsChanged?.(updated);
      return updated;
    });
  }, [onRequirementApplied, onRequirementsChanged]);

  const deleteRequirement = useCallback((id: string) => {
    setRequirements(prev => {
      const updated = prev.filter(req => req.id !== id);
      onRequirementsChanged?.(updated);
      return updated;
    });
  }, [onRequirementsChanged]);

  const clearAllRequirements = useCallback(() => {
    setRequirements([]);
    onRequirementsChanged?.([]);
  }, [onRequirementsChanged]);

  const appliedCount = requirements.filter(req => req.applied).length;
  const pendingCount = requirements.length - appliedCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Extracted Requirements
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Total: {requirements.length}</span>
                <span>Applied: {appliedCount}</span>
                <span>Pending: {pendingCount}</span>
              </div>
            </div>
            
            {requirements.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllRequirements}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Requirements List */}
      <div className="space-y-3">
        {requirements.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No requirements extracted yet.</p>
              <p className="text-xs mt-1">
                Select text from specifications to extract backing requirements automatically.
              </p>
            </CardContent>
          </Card>
        ) : (
          requirements.map(requirement => (
            <RequirementCard
              key={requirement.id}
              requirement={requirement}
              onEdit={(updates) => updateRequirement(requirement.id, updates)}
              onApply={() => applyRequirement(requirement.id)}
              onDelete={() => deleteRequirement(requirement.id)}
            />
          ))
        )}
      </div>

      {/* Helper for external components to add requirements */}
      {React.createElement('div', { 
        ref: (el: any) => {
          if (el) {
            el._addRequirement = addRequirement;
          }
        },
        style: { display: 'none' }
      })}
    </div>
  );
}