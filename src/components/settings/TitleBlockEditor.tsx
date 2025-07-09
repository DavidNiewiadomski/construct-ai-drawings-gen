import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';
import { TitleBlockConfig } from '@/types';

interface TitleBlockEditorProps {
  template?: TitleBlockConfig | null;
  onSave: (template: TitleBlockConfig) => void;
  onCancel: () => void;
}

interface FormData {
  templateName: string;
  position: 'bottom' | 'right';
  projectName: string;
  drawingTitle: string;
  drawingNumber: string;
  date: string;
  drawnBy: string;
  checkedBy: string;
  scale: string;
  revision: string;
}

export function TitleBlockEditor({ template, onSave, onCancel }: TitleBlockEditorProps) {
  const [logoFile, setLogoFile] = useState<string | null>(template?.logoUrl || null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      templateName: template?.template || '',
      position: template?.position || 'bottom',
      projectName: template?.fields.projectName || '',
      drawingTitle: template?.fields.drawingTitle || 'Backing Plan',
      drawingNumber: template?.fields.drawingNumber || '',
      date: template?.fields.date || new Date().toLocaleDateString(),
      drawnBy: template?.fields.drawnBy || '',
      checkedBy: template?.fields.checkedBy || '',
      scale: template?.fields.scale || '1/4" = 1\'',
      revision: template?.fields.revision || 'A',
    },
  });

  const onSubmit = (data: FormData) => {
    const titleBlockConfig: TitleBlockConfig = {
      template: data.templateName,
      position: data.position,
      logoUrl: logoFile || undefined,
      fields: {
        projectName: data.projectName,
        drawingTitle: data.drawingTitle,
        drawingNumber: data.drawingNumber,
        date: data.date,
        drawnBy: data.drawnBy,
        checkedBy: data.checkedBy,
        scale: data.scale,
        revision: data.revision,
      },
    };

    onSave(titleBlockConfig);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogoFile(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                {...register('templateName', { required: 'Template name is required' })}
                placeholder="e.g., Commercial Standard"
              />
              {errors.templateName && (
                <p className="text-sm text-destructive mt-1">{errors.templateName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="position">Title Block Position</Label>
              <Select value={watch('position')} onValueChange={(value) => setValue('position', value as 'bottom' | 'right')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Company Logo</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                {logoFile ? (
                  <div className="relative">
                    <img
                      src={logoFile}
                      alt="Company Logo"
                      className="w-full h-20 object-contain border rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm text-muted-foreground">
                        Click to upload logo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Values */}
        <Card>
          <CardHeader>
            <CardTitle>Default Field Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                {...register('projectName')}
                placeholder="Leave empty for runtime input"
              />
            </div>

            <div>
              <Label htmlFor="drawingTitle">Drawing Title</Label>
              <Input
                id="drawingTitle"
                {...register('drawingTitle')}
                placeholder="Backing Plan"
              />
            </div>

            <div>
              <Label htmlFor="drawingNumber">Drawing Number</Label>
              <Input
                id="drawingNumber"
                {...register('drawingNumber')}
                placeholder="Leave empty for runtime input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="drawnBy">Drawn By</Label>
                <Input
                  id="drawnBy"
                  {...register('drawnBy')}
                  placeholder="Name"
                />
              </div>
              <div>
                <Label htmlFor="checkedBy">Checked By</Label>
                <Input
                  id="checkedBy"
                  {...register('checkedBy')}
                  placeholder="Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="scale">Scale</Label>
                <Input
                  id="scale"
                  {...register('scale')}
                  placeholder="1/4 inch = 1 foot"
                />
              </div>
              <div>
                <Label htmlFor="revision">Revision</Label>
                <Input
                  id="revision"
                  {...register('revision')}
                  placeholder="A"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                {...register('date')}
                placeholder="Auto-filled with current date"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-white min-h-[200px] relative">
            <div className="text-xs text-muted-foreground mb-2">Title Block Preview</div>
            
            {watch('position') === 'bottom' ? (
              <div className="absolute bottom-4 right-4 border border-gray-300 bg-white p-2 min-w-[300px]">
                {logoFile && (
                  <div className="mb-2">
                    <img src={logoFile} alt="Logo" className="h-8 object-contain" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div><strong>Project:</strong> {watch('projectName') || '[Project Name]'}</div>
                  <div><strong>Drawing:</strong> {watch('drawingTitle')}</div>
                  <div><strong>Number:</strong> {watch('drawingNumber') || '[Number]'}</div>
                  <div><strong>Scale:</strong> {watch('scale')}</div>
                  <div><strong>Drawn:</strong> {watch('drawnBy') || '[Name]'}</div>
                  <div><strong>Date:</strong> {watch('date')}</div>
                </div>
              </div>
            ) : (
              <div className="absolute top-4 right-4 border border-gray-300 bg-white p-2 w-[200px]">
                {logoFile && (
                  <div className="mb-2">
                    <img src={logoFile} alt="Logo" className="h-6 object-contain" />
                  </div>
                )}
                <div className="space-y-1 text-xs">
                  <div><strong>Project:</strong><br />{watch('projectName') || '[Project Name]'}</div>
                  <div><strong>Drawing:</strong><br />{watch('drawingTitle')}</div>
                  <div><strong>Number:</strong> {watch('drawingNumber') || '[Number]'}</div>
                  <div><strong>Scale:</strong> {watch('scale')}</div>
                  <div><strong>Date:</strong> {watch('date')}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update Template' : 'Save Template'}
        </Button>
      </div>
    </form>
  );
}