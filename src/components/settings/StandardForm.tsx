import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Save, 
  RotateCcw,
  Info,
  Zap,
  Ruler
} from 'lucide-react';
import type { BackingStandard } from './BackingStandardsLibrary';

const formSchema = z.object({
  category: z.enum(['Plumbing', 'Electrical', 'HVAC', 'Fire Safety', 'Accessibility', 'AV', 'Custom']),
  componentType: z.string().min(1, 'Component type is required'),
  componentIcon: z.string().min(1, 'Please select an icon'),
  conditions: z.object({
    weightMin: z.number().optional(),
    weightMax: z.number().optional(),
    sizeMin: z.number().optional(),
    sizeMax: z.number().optional(),
    custom: z.string().optional(),
  }),
  backing: z.object({
    material: z.string().min(1, 'Material is required'),
    thickness: z.string().min(1, 'Thickness is required'),
    width: z.number().min(1, 'Width must be greater than 0'),
    height: z.number().min(1, 'Height must be greater than 0'),
    orientation: z.enum(['horizontal', 'vertical']),
  }),
  mounting: z.object({
    heightAFF: z.number().min(0, 'Height must be positive'),
    heightReference: z.enum(['center', 'top', 'bottom']),
    fasteners: z.string().min(1, 'Fastener type is required'),
    spacing: z.number().min(1, 'Spacing must be greater than 0'),
  }),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface StandardFormProps {
  standard?: BackingStandard;
  open: boolean;
  onSave: (standard: BackingStandard) => void;
  onCancel: () => void;
}

const componentIcons = [
  { icon: '📺', label: 'TV/Monitor' },
  { icon: '🚿', label: 'Plumbing' },
  { icon: '🔥', label: 'Fire Safety' },
  { icon: '🚽', label: 'Toilet' },
  { icon: '💡', label: 'Lighting' },
  { icon: '🔌', label: 'Electrical' },
  { icon: '📹', label: 'Camera' },
  { icon: '🔧', label: 'Equipment' },
  { icon: '🤲', label: 'Accessibility' },
  { icon: '🌡️', label: 'HVAC' },
  { icon: '🧯', label: 'Extinguisher' },
  { icon: '📽️', label: 'Projector' },
  { icon: '🪑', label: 'Furniture' },
  { icon: '⚡', label: 'Panel' },
  { icon: '🏢', label: 'Structural' },
  { icon: '🔒', label: 'Security' },
];

const materialOptions = [
  { value: '2x4', label: '2x4 Wood', thickness: '3.5"' },
  { value: '2x6', label: '2x6 Wood', thickness: '5.5"' },
  { value: '2x8', label: '2x8 Wood', thickness: '7.25"' },
  { value: '2x10', label: '2x10 Wood', thickness: '9.25"' },
  { value: '2x12', label: '2x12 Wood', thickness: '11.25"' },
  { value: '3/4_plywood', label: '3/4" Plywood', thickness: '0.75"' },
  { value: '1/2_plywood', label: '1/2" Plywood', thickness: '0.5"' },
  { value: '5/8_plywood', label: '5/8" Plywood', thickness: '0.625"' },
  { value: 'steel_plate', label: 'Steel Plate', thickness: '1/4"' },
  { value: 'steel_angle', label: 'Steel Angle', thickness: '1/4"' },
  { value: 'custom', label: 'Custom Material', thickness: 'Custom' },
];

export function StandardForm({ standard, open, onSave, onCancel }: StandardFormProps) {
  const [selectedIcon, setSelectedIcon] = useState(standard?.componentIcon || '');
  const [selectedMaterial, setSelectedMaterial] = useState(standard?.backing.material || '');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: standard?.category || 'AV',
      componentType: standard?.componentType || '',
      componentIcon: standard?.componentIcon || '',
      conditions: {
        weightMin: standard?.conditions.weightMin,
        weightMax: standard?.conditions.weightMax,
        sizeMin: standard?.conditions.sizeMin,
        sizeMax: standard?.conditions.sizeMax,
        custom: standard?.conditions.custom || '',
      },
      backing: {
        material: standard?.backing.material || '',
        thickness: standard?.backing.thickness || '',
        width: standard?.backing.width || 16,
        height: standard?.backing.height || 16,
        orientation: standard?.backing.orientation || 'horizontal',
      },
      mounting: {
        heightAFF: standard?.mounting.heightAFF || 48,
        heightReference: standard?.mounting.heightReference || 'center',
        fasteners: standard?.mounting.fasteners || '',
        spacing: standard?.mounting.spacing || 16,
      },
      notes: standard?.notes || '',
      tags: standard?.tags?.join(', ') || '',
    },
  });

  const onSubmit = (data: FormData) => {
    const newStandard: BackingStandard = {
      id: standard?.id || `std_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: data.category,
      componentType: data.componentType,
      componentIcon: selectedIcon,
      conditions: {
        weightMin: data.conditions.weightMin,
        weightMax: data.conditions.weightMax,
        sizeMin: data.conditions.sizeMin,
        sizeMax: data.conditions.sizeMax,
        custom: data.conditions.custom,
      },
      backing: {
        material: data.backing.material,
        thickness: data.backing.thickness,
        width: data.backing.width,
        height: data.backing.height,
        orientation: data.backing.orientation,
      },
      mounting: {
        heightAFF: data.mounting.heightAFF,
        heightReference: data.mounting.heightReference,
        fasteners: data.mounting.fasteners,
        spacing: data.mounting.spacing,
      },
      notes: data.notes || '',
      images: standard?.images || [],
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      lastUpdated: new Date(),
      source: standard?.source || 'custom',
    };

    onSave(newStandard);
    
    toast({
      title: standard ? "Standard Updated" : "Standard Created",
      description: `${data.componentType} standard has been ${standard ? 'updated' : 'created'} successfully.`,
    });
  };

  const handleMaterialChange = (value: string) => {
    setSelectedMaterial(value);
    const material = materialOptions.find(m => m.value === value);
    if (material) {
      form.setValue('backing.thickness', material.thickness);
    }
  };

  const handleReset = () => {
    form.reset();
    setSelectedIcon('');
    setSelectedMaterial('');
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ruler className="h-5 w-5" />
            {standard ? 'Edit' : 'Add'} Backing Standard
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Component Information */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  Component Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Plumbing">Plumbing</SelectItem>
                            <SelectItem value="Electrical">Electrical</SelectItem>
                            <SelectItem value="HVAC">HVAC</SelectItem>
                            <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                            <SelectItem value="Accessibility">Accessibility</SelectItem>
                            <SelectItem value="AV">Audio/Visual</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="componentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Component Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TV Mount, Grab Bar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Component Icon</FormLabel>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {componentIcons.map(({ icon, label }) => (
                      <Button
                        key={icon}
                        type="button"
                        variant={selectedIcon === icon ? "default" : "outline"}
                        className={`h-12 text-lg hover-scale ${
                          selectedIcon === icon ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedIcon(icon);
                          form.setValue('componentIcon', icon);
                        }}
                        title={label}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                  {selectedIcon && (
                    <div className="mt-2 animate-fade-in">
                      <Badge variant="outline" className="text-sm">
                        Selected: {selectedIcon} {componentIcons.find(i => i.icon === selectedIcon)?.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4" />
                  Application Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="conditions.weightMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions.weightMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions.sizeMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Size (in)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions.sizeMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Size (in)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="48"
                            {...field}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="conditions.custom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional conditions or requirements..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Backing Specification */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Ruler className="h-4 w-4" />
                  Backing Specification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="backing.material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        handleMaterialChange(value);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialOptions.map(material => (
                            <SelectItem key={material.value} value={material.value}>
                              {material.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="backing.thickness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thickness</FormLabel>
                        <FormControl>
                          <Input placeholder="1.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backing.width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="16"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backing.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="16"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="backing.orientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orientation</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="horizontal" id="horizontal" />
                            <Label htmlFor="horizontal">Horizontal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vertical" id="vertical" />
                            <Label htmlFor="vertical">Vertical</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Mounting Details */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Installation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mounting.heightAFF"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height AFF (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="48"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mounting.heightReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height Reference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="center">To Center</SelectItem>
                            <SelectItem value="top">To Top</SelectItem>
                            <SelectItem value="bottom">To Bottom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mounting.fasteners"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fastener Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Wood screws, lag bolts, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mounting.spacing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fastener Spacing (inches)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="16"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-base">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Installation notes, special requirements, code references..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ada, wall-mount, heavy-duty (comma separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Reference Images</FormLabel>
                  <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload reference images or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="hover-scale"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="hover-scale"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" className="hover-scale">
                <Save className="h-4 w-4 mr-2" />
                {standard ? 'Update' : 'Create'} Standard
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}