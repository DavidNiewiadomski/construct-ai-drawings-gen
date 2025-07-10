import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Save,
  X,
  Target,
  Ruler,
  Weight,
  Hash,
  FileText
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

interface RequirementCardProps {
  requirement: ExtractedRequirement;
  onEdit: (updates: Partial<ExtractedRequirement['parsedData']>) => void;
  onApply: () => void;
  onDelete: () => void;
}

const COMPONENT_TYPES = [
  { value: 'tv', label: 'TV/Display', icon: '📺' },
  { value: 'fire_extinguisher', label: 'Fire Extinguisher', icon: '🧯' },
  { value: 'grab_bar', label: 'Grab Bar', icon: '🚿' },
  { value: 'sink', label: 'Sink', icon: '🚿' },
  { value: 'cabinet', label: 'Cabinet', icon: '📦' },
  { value: 'equipment', label: 'Equipment', icon: '⚙️' },
  { value: 'other', label: 'Other', icon: '🔧' }
];

const BACKING_TYPES = [
  { value: '2x4', label: '2x4 Lumber', icon: '🔨' },
  { value: '2x6', label: '2x6 Lumber', icon: '🔨' },
  { value: '2x8', label: '2x8 Lumber', icon: '🔨' },
  { value: '2x10', label: '2x10 Lumber', icon: '🔨' },
  { value: '3/4_plywood', label: '3/4" Plywood', icon: '📋' },
  { value: '1/2_plywood', label: '1/2" Plywood', icon: '📋' },
  { value: 'steel_plate', label: 'Steel Plate', icon: '🔩' },
  { value: 'blocking', label: 'Blocking', icon: '🧱' }
];

const getConfidenceLevel = (confidence: number): string => {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
  if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

export function RequirementCard({ requirement, onEdit, onApply, onDelete }: RequirementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(requirement.parsedData);
  const { toast } = useToast();

  const handleSave = () => {
    try {
      onEdit(editedData);
      setIsEditing(false);
      toast({
        title: "Requirement Updated",
        description: "The requirement has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update the requirement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedData(requirement.parsedData);
    setIsEditing(false);
  };

  const handleApply = () => {
    if (!requirement.parsedData.componentType || !requirement.parsedData.backingType) {
      toast({
        title: "Missing Information",
        description: "Please specify both component type and backing type before applying.",
        variant: "destructive",
      });
      return;
    }
    
    onApply();
    toast({
      title: "Requirement Applied",
      description: "The requirement has been applied to your project.",
    });
  };

  const handleDelete = () => {
    onDelete();
    toast({
      title: "Requirement Deleted",
      description: "The requirement has been removed.",
    });
  };

  const confidenceColor = getConfidenceColor(requirement.confidence);
  const confidenceLevel = getConfidenceLevel(requirement.confidence);

  const getComponentTypeDisplay = (type?: string) => {
    const component = COMPONENT_TYPES.find(c => c.value === type);
    return component ? `${component.icon} ${component.label}` : type;
  };

  const getBackingTypeDisplay = (type?: string) => {
    const backing = BACKING_TYPES.find(b => b.value === type);
    return backing ? `${backing.icon} ${backing.label}` : type;
  };

  return (
    <Card className={cn(
      "requirement-card transition-all duration-200 hover:shadow-md",
      requirement.applied && "border-green-200 bg-green-50/30"
    )}>
      <CardHeader className="pb-3">
        {/* Header */}
        <div className="requirement-header flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                {requirement.specSection}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Page {requirement.pageNumber}
              </Badge>
              <Badge className={cn("text-xs border", confidenceColor)}>
                {Math.round(requirement.confidence * 100)}% confident
              </Badge>
              {requirement.applied && (
                <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Applied
                </Badge>
              )}
            </div>
          </div>
          
          <div className="requirement-actions flex items-center gap-1">
            {!requirement.applied && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Original Text */}
        <div className="requirement-text">
          <Label className="text-xs text-muted-foreground">Original Text</Label>
          <div className="text-xs bg-muted/50 p-3 rounded-md border italic max-h-24 overflow-y-auto">
            "{requirement.text}"
          </div>
        </div>

        <Separator />

        {/* Parsed Data - Edit Mode */}
        {isEditing ? (
          <div className="requirement-edit space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Component Type</Label>
                <Select
                  value={editedData.componentType || ''}
                  onValueChange={(value) => setEditedData({ ...editedData, componentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Component Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPONENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Backing Type</Label>
                <Select
                  value={editedData.backingType || ''}
                  onValueChange={(value) => setEditedData({ ...editedData, backingType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Backing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKING_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Height AFF (inches)</Label>
                <Input
                  type="number"
                  placeholder="48"
                  value={editedData.heightAFF || ''}
                  onChange={(e) => setEditedData({ 
                    ...editedData, 
                    heightAFF: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
              
              <div>
                <Label className="text-sm">Width (inches)</Label>
                <Input
                  type="number"
                  placeholder="24"
                  value={editedData.dimensions?.width || ''}
                  onChange={(e) => setEditedData({ 
                    ...editedData, 
                    dimensions: { 
                      ...editedData.dimensions, 
                      width: e.target.value ? parseInt(e.target.value) : 0,
                      height: editedData.dimensions?.height || 0
                    }
                  })}
                />
              </div>
              
              <div>
                <Label className="text-sm">Height (inches)</Label>
                <Input
                  type="number"
                  placeholder="6"
                  value={editedData.dimensions?.height || ''}
                  onChange={(e) => setEditedData({ 
                    ...editedData, 
                    dimensions: { 
                      ...editedData.dimensions, 
                      width: editedData.dimensions?.width || 0,
                      height: e.target.value ? parseInt(e.target.value) : 0
                    }
                  })}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">Weight Capacity (lbs)</Label>
              <Input
                type="number"
                placeholder="50"
                value={editedData.weight || ''}
                onChange={(e) => setEditedData({ 
                  ...editedData, 
                  weight: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>

            <div>
              <Label className="text-sm">Notes</Label>
              <Textarea
                placeholder="Additional notes or requirements..."
                value={editedData.notes || ''}
                onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* Parsed Data - Display Mode */
          <div className="requirement-parsed space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {requirement.parsedData.componentType && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Component:</span>
                    <Badge variant="secondary" className="text-xs">
                      {getComponentTypeDisplay(requirement.parsedData.componentType)}
                    </Badge>
                  </div>
                )}
                
                {requirement.parsedData.backingType && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Backing:</span>
                    <Badge variant="secondary" className="text-xs">
                      {getBackingTypeDisplay(requirement.parsedData.backingType)}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {requirement.parsedData.heightAFF && (
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Height:</span>
                    <span className="text-sm font-medium">📏 {requirement.parsedData.heightAFF}" AFF</span>
                  </div>
                )}
                
                {requirement.parsedData.weight && (
                  <div className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="text-sm font-medium">⚖️ {requirement.parsedData.weight} lbs</span>
                  </div>
                )}
              </div>
            </div>

            {requirement.parsedData.dimensions && (
              <div className="text-sm">
                <span className="text-muted-foreground">Dimensions: </span>
                <span className="font-medium">
                  📐 {requirement.parsedData.dimensions.width}" × {requirement.parsedData.dimensions.height}"
                </span>
              </div>
            )}

            {requirement.parsedData.notes && (
              <div className="text-sm">
                <span className="text-muted-foreground">Notes: </span>
                <span className="italic">{requirement.parsedData.notes}</span>
              </div>
            )}

            {!requirement.applied && (
              <Button 
                onClick={handleApply}
                className="w-full mt-4"
                disabled={!requirement.parsedData.componentType || !requirement.parsedData.backingType}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Apply to Project
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}