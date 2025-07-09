import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus } from 'lucide-react';
import { BackingStandard } from '@/types';

interface StandardsFormProps {
  standard?: BackingStandard | null;
  onSave: (standard: BackingStandard) => void;
  onCancel: () => void;
}

interface FormData {
  componentType: string;
  weightMin: string;
  weightMax: string;
  widthMin: string;
  widthMax: string;
  customCondition: string;
  material: string;
  thickness: string;
  width: string;
  height: string;
  fasteners: string;
  spacing: string;
  heightAFF: string;
  notes: string;
  category: string;
}

export function StandardsForm({ standard, onSave, onCancel }: StandardsFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      componentType: standard?.componentType || '',
      weightMin: standard?.conditions.weightMin?.toString() || '',
      weightMax: standard?.conditions.weightMax?.toString() || '',
      widthMin: standard?.conditions.widthMin?.toString() || '',
      widthMax: standard?.conditions.widthMax?.toString() || '',
      customCondition: standard?.conditions.custom || '',
      material: standard?.backing.material || '',
      thickness: standard?.backing.thickness || '',
      width: standard?.backing.width?.toString() || '',
      height: standard?.backing.height?.toString() || '',
      fasteners: standard?.backing.fasteners || '',
      spacing: standard?.backing.spacing?.toString() || '',
      heightAFF: standard?.heightAFF?.toString() || '',
      notes: standard?.notes || '',
      category: standard?.category || '',
    },
  });

  useEffect(() => {
    if (standard?.images) {
      setUploadedImages(standard.images);
    }
  }, [standard]);

  const componentTypes = [
    { value: 'tv', label: 'TV', icon: '📺' },
    { value: 'grab_bar', label: 'Grab Bar', icon: '🦯' },
    { value: 'sink', label: 'Sink', icon: '🚿' },
    { value: 'equipment', label: 'Equipment', icon: '⚙️' },
    { value: 'cabinet', label: 'Cabinet', icon: '🗄️' },
    { value: 'fire_extinguisher', label: 'Fire Extinguisher', icon: '🧯' },
    { value: 'other', label: 'Other', icon: '📦' },
  ];

  const backingMaterials = [
    '2x4', '2x6', '2x8', '2x10', '2x12',
    '3/4_plywood', '1/2_plywood', '5/8_plywood',
    'steel_plate', 'blocking', 'custom'
  ];

  const categories = [
    'Electronics', 'Accessibility', 'Plumbing', 'Mechanical',
    'Fire Safety', 'Storage', 'General', 'Custom'
  ];

  const onSubmit = (data: FormData) => {
    const newStandard: BackingStandard = {
      id: standard?.id || Date.now().toString(),
      componentType: data.componentType,
      conditions: {
        weightMin: data.weightMin ? parseFloat(data.weightMin) : undefined,
        weightMax: data.weightMax ? parseFloat(data.weightMax) : undefined,
        widthMin: data.widthMin ? parseFloat(data.widthMin) : undefined,
        widthMax: data.widthMax ? parseFloat(data.widthMax) : undefined,
        custom: data.customCondition || undefined,
      },
      backing: {
        material: data.material,
        thickness: data.thickness,
        width: parseFloat(data.width) || 0,
        height: parseFloat(data.height) || 0,
        fasteners: data.fasteners,
        spacing: parseFloat(data.spacing) || 0,
      },
      heightAFF: parseFloat(data.heightAFF) || 0,
      notes: data.notes,
      images: uploadedImages,
      category: data.category,
      updatedAt: new Date().toISOString(),
      updatedBy: 'User',
    };

    onSave(newStandard);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImages(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Information */}
        <Card>
          <CardHeader>
            <CardTitle>Component Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="componentType">Component Type *</Label>
              <Select value={watch('componentType')} onValueChange={(value) => setValue('componentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="heightAFF">Height Above Finished Floor (inches) *</Label>
              <Input
                id="heightAFF"
                type="number"
                step="0.1"
                {...register('heightAFF', { required: 'Height AFF is required' })}
              />
              {errors.heightAFF && (
                <p className="text-sm text-destructive mt-1">{errors.heightAFF.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Backing Specification */}
        <Card>
          <CardHeader>
            <CardTitle>Backing Specification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="material">Backing Material *</Label>
              <Select value={watch('material')} onValueChange={(value) => setValue('material', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select backing material" />
                </SelectTrigger>
                <SelectContent>
                  {backingMaterials.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="thickness">Thickness</Label>
              <Input
                id="thickness"
                placeholder="e.g., 1.5 inches"
                {...register('thickness')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="width">Width (inches) *</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  {...register('width', { required: 'Width is required' })}
                />
                {errors.width && (
                  <p className="text-sm text-destructive mt-1">{errors.width.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="height">Height (inches) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  {...register('height', { required: 'Height is required' })}
                />
                {errors.height && (
                  <p className="text-sm text-destructive mt-1">{errors.height.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="fasteners">Fastener Requirements</Label>
              <Input
                id="fasteners"
                placeholder="e.g., 3-inch wood screws"
                {...register('fasteners')}
              />
            </div>

            <div>
              <Label htmlFor="spacing">Fastener Spacing (inches)</Label>
              <Input
                id="spacing"
                type="number"
                step="0.1"
                placeholder="e.g., 16"
                {...register('spacing')}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Application Conditions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Define when this standard applies (weight, size, or custom conditions)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="weightMin">Weight Min (lbs)</Label>
              <Input
                id="weightMin"
                type="number"
                step="0.1"
                {...register('weightMin')}
              />
            </div>
            <div>
              <Label htmlFor="weightMax">Weight Max (lbs)</Label>
              <Input
                id="weightMax"
                type="number"
                step="0.1"
                {...register('weightMax')}
              />
            </div>
            <div>
              <Label htmlFor="widthMin">Width Min (inches)</Label>
              <Input
                id="widthMin"
                type="number"
                step="0.1"
                {...register('widthMin')}
              />
            </div>
            <div>
              <Label htmlFor="widthMax">Width Max (inches)</Label>
              <Input
                id="widthMax"
                type="number"
                step="0.1"
                {...register('widthMax')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customCondition">Custom Conditions</Label>
            <Input
              id="customCondition"
              placeholder="e.g., Over 8 feet AFF, In wet areas"
              {...register('customCondition')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes and Images */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Installation Notes</Label>
            <Textarea
              id="notes"
              placeholder="Special installation requirements, code references, etc."
              rows={3}
              {...register('notes')}
            />
          </div>

          <div>
            <Label>Reference Images</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">
                    Click to upload images or drag and drop
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {standard ? 'Update Standard' : 'Save Standard'}
        </Button>
      </div>
    </form>
  );
}