import { useState } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BackingPlacement } from '@/types';
import { formatDimension } from '@/utils/viewerUtils';

interface BackingEditorProps {
  backing: BackingPlacement;
  onUpdate: (backing: BackingPlacement) => void;
  onDelete: () => void;
  onClose: () => void;
}

const BACKING_TYPES = [
  { value: '2x4', label: '2x4 Lumber' },
  { value: '2x6', label: '2x6 Lumber' },
  { value: '2x8', label: '2x8 Lumber' },
  { value: '2x10', label: '2x10 Lumber' },
  { value: '3/4_plywood', label: '3/4" Plywood' },
  { value: 'steel_plate', label: 'Steel Plate' },
  { value: 'blocking', label: 'Blocking' },
];

const STATUS_OPTIONS = [
  { value: 'ai_generated', label: 'AI Generated', color: 'text-blue-400' },
  { value: 'user_modified', label: 'User Modified', color: 'text-orange-400' },
  { value: 'approved', label: 'Approved', color: 'text-green-400' },
];

export function BackingEditor({ backing, onUpdate, onDelete, onClose }: BackingEditorProps) {
  const [localBacking, setLocalBacking] = useState<BackingPlacement>(backing);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    let updatedBacking = { ...localBacking };
    
    if (keys.length === 1) {
      updatedBacking = { ...updatedBacking, [keys[0]]: value };
    } else if (keys.length === 2) {
      updatedBacking = {
        ...updatedBacking,
        [keys[0]]: {
          ...(updatedBacking as any)[keys[0]],
          [keys[1]]: value,
        },
      };
    }
    
    // Update status to user_modified when making changes
    if (backing.status === 'ai_generated' && field !== 'status') {
      updatedBacking.status = 'user_modified';
    }
    
    setLocalBacking(updatedBacking);
    setHasChanges(true);
  };

  const handleApply = () => {
    onUpdate(localBacking);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalBacking(backing);
    setHasChanges(false);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === localBacking.status);

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Backing Properties</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={localBacking.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <span className={status.color}>
                      {status.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Backing Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Backing Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={localBacking.backingType}
              onValueChange={(value) => handleInputChange('backingType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BACKING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Dimensions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="width" className="text-xs">Width (in)</Label>
                <Input
                  id="width"
                  type="number"
                  value={Math.round(localBacking.dimensions.width)}
                  onChange={(e) => 
                    handleInputChange('dimensions.width', parseInt(e.target.value) || 0)
                  }
                  min="1"
                  step="1"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-xs">Height (in)</Label>
                <Input
                  id="height"
                  type="number"
                  value={Math.round(localBacking.dimensions.height)}
                  onChange={(e) => 
                    handleInputChange('dimensions.height', parseInt(e.target.value) || 0)
                  }
                  min="1"
                  step="1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="thickness" className="text-xs">Thickness (in)</Label>
              <Input
                id="thickness"
                type="number"
                value={localBacking.dimensions.thickness}
                onChange={(e) => 
                  handleInputChange('dimensions.thickness', parseFloat(e.target.value) || 0)
                }
                min="0.25"
                step="0.25"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="x" className="text-xs">X Position</Label>
                <Input
                  id="x"
                  type="number"
                  value={Math.round(localBacking.location.x)}
                  onChange={(e) => 
                    handleInputChange('location.x', parseInt(e.target.value) || 0)
                  }
                  step="1"
                />
              </div>
              <div>
                <Label htmlFor="y" className="text-xs">Y Position</Label>
                <Input
                  id="y"
                  type="number"
                  value={Math.round(localBacking.location.y)}
                  onChange={(e) => 
                    handleInputChange('location.y', parseInt(e.target.value) || 0)
                  }
                  step="1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="z" className="text-xs">
                Height Above Floor ({formatDimension(localBacking.location.z)})
              </Label>
              <Input
                id="z"
                type="number"
                value={Math.round(localBacking.location.z)}
                onChange={(e) => 
                  handleInputChange('location.z', parseInt(e.target.value) || 0)
                }
                min="0"
                step="1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orientation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Orientation</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="orientation" className="text-xs">Rotation (degrees)</Label>
              <Input
                id="orientation"
                type="number"
                value={localBacking.orientation}
                onChange={(e) => 
                  handleInputChange('orientation', parseInt(e.target.value) || 0)
                }
                min="0"
                max="359"
                step="1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-3">
        {hasChanges && (
          <div className="flex space-x-2">
            <Button
              onClick={handleApply}
              className="flex-1"
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
              size="sm"
            >
              Reset
            </Button>
          </div>
        )}
        
        <Separator />
        
        <Button
          variant="destructive"
          onClick={onDelete}
          className="w-full"
          size="sm"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Backing
        </Button>
      </div>
    </div>
  );
}