import { useState, useEffect } from 'react';
import { X, RotateCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BackingPlacement as BackingType } from '@/types';

interface BackingPropertiesPanelProps {
  backing: BackingType;
  onUpdate: (backing: BackingType) => void;
  onDelete: () => void;
  onClose: () => void;
}

const BACKING_TYPES = [
  { value: '2x4' as const, label: '2x4 Lumber', thickness: 4 },
  { value: '2x6' as const, label: '2x6 Lumber', thickness: 6 },
  { value: '2x8' as const, label: '2x8 Lumber', thickness: 8 },
  { value: '2x10' as const, label: '2x10 Lumber', thickness: 10 },
  { value: '3/4_plywood' as const, label: '3/4" Plywood', thickness: 0.75 },
  { value: 'steel_plate' as const, label: 'Steel Plate', thickness: 0.25 },
  { value: 'blocking' as const, label: 'Blocking', thickness: 3.5 },
];

const ROTATION_OPTIONS = [
  { value: 0, label: '0°' },
  { value: 90, label: '90°' },
  { value: 180, label: '180°' },
  { value: 270, label: '270°' },
];

export function BackingPropertiesPanel({
  backing,
  onUpdate,
  onDelete,
  onClose
}: BackingPropertiesPanelProps) {
  const [formData, setFormData] = useState({
    backingType: backing.backingType,
    width: backing.dimensions.width,
    height: backing.dimensions.height,
    thickness: backing.dimensions.thickness,
    heightAFF: backing.location.z,
    orientation: backing.orientation,
    notes: backing.componentId || '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Track changes to enable/disable apply button
  useEffect(() => {
    const originalData = {
      backingType: backing.backingType,
      width: backing.dimensions.width,
      height: backing.dimensions.height,
      thickness: backing.dimensions.thickness,
      heightAFF: backing.location.z,
      orientation: backing.orientation,
      notes: backing.componentId || '',
    };

    const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasChanged);
  }, [formData, backing]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBackingTypeChange = (newType: BackingType['backingType']) => {
    const backingTypeData = BACKING_TYPES.find(type => type.value === newType);
    setFormData(prev => ({
      ...prev,
      backingType: newType,
      thickness: backingTypeData?.thickness || prev.thickness,
    }));
  };

  const handleOrientationChange = (newOrientation: number) => {
    setFormData(prev => ({
      ...prev,
      orientation: newOrientation,
    }));
  };

  const handleApply = () => {
    const updatedBacking: BackingType = {
      ...backing,
      backingType: formData.backingType,
      dimensions: {
        width: Number(formData.width),
        height: Number(formData.height),
        thickness: Number(formData.thickness),
      },
      location: {
        ...backing.location,
        z: Number(formData.heightAFF),
      },
      orientation: formData.orientation,
      componentId: formData.notes,
      status: 'user_modified', // Mark as user modified when properties change
    };

    onUpdate(updatedBacking);
  };

  const handleReset = () => {
    setFormData({
      backingType: backing.backingType,
      width: backing.dimensions.width,
      height: backing.dimensions.height,
      thickness: backing.dimensions.thickness,
      heightAFF: backing.location.z,
      orientation: backing.orientation,
      notes: backing.componentId || '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ai_generated':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'user_modified':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Backing Properties</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 overflow-y-auto">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Status:</Label>
          <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(backing.status)}`}>
            {backing.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        <Separator />

        {/* Backing Type */}
        <div className="space-y-2">
          <Label htmlFor="backing-type">Backing Type</Label>
          <Select
            value={formData.backingType}
            onValueChange={handleBackingTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select backing type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              {BACKING_TYPES.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className="cursor-pointer hover:bg-accent"
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dimensions */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Dimensions (inches)</Label>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-xs">Width</Label>
              <Input
                id="width"
                type="number"
                min="1"
                step="0.25"
                value={formData.width}
                onChange={(e) => handleInputChange('width', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height" className="text-xs">Height</Label>
              <Input
                id="height"
                type="number"
                min="1"
                step="0.25"
                value={formData.height}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thickness" className="text-xs">Thickness</Label>
            <Input
              id="thickness"
              type="number"
              min="0.125"
              step="0.125"
              value={formData.thickness}
              onChange={(e) => handleInputChange('thickness', parseFloat(e.target.value) || 0)}
              className="h-8"
            />
          </div>
        </div>

        <Separator />

        {/* Height AFF */}
        <div className="space-y-2">
          <Label htmlFor="height-aff">Height AFF (inches)</Label>
          <Input
            id="height-aff"
            type="number"
            min="0"
            step="0.25"
            value={formData.heightAFF}
            onChange={(e) => handleInputChange('heightAFF', parseFloat(e.target.value) || 0)}
            placeholder="Above finished floor"
          />
        </div>

        {/* Orientation */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Orientation</Label>
          <div className="grid grid-cols-4 gap-2">
            {ROTATION_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={formData.orientation === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleOrientationChange(option.value)}
                className="h-8 text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <RotateCw className="h-3 w-3" />
            <span>Current: {formData.orientation}°</span>
          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes / Component ID</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add notes or component identifier..."
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Position Info (Read-only) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Position</Label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted p-2 rounded">
              <span className="text-muted-foreground">X:</span> {backing.location.x.toFixed(1)}"
            </div>
            <div className="bg-muted p-2 rounded">
              <span className="text-muted-foreground">Y:</span> {backing.location.y.toFixed(1)}"
            </div>
          </div>
        </div>
      </CardContent>

      {/* Action Buttons */}
      <div className="p-6 pt-0 space-y-3">
        <div className="flex space-x-2">
          <Button
            onClick={handleApply}
            disabled={!hasChanges}
            className="flex-1"
          >
            Apply Changes
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Backing
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Backing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this backing? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}