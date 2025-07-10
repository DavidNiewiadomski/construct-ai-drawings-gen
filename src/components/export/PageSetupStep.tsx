import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PageSize, Scale, ExportSettings } from './ExportWizard';

interface PageSetupStepProps {
  pageSizes: PageSize[];
  scales: Scale[];
  settings: Partial<ExportSettings>;
  onSettingsChange: (updates: Partial<ExportSettings>) => void;
}

export function PageSetupStep({
  pageSizes,
  scales,
  settings,
  onSettingsChange
}: PageSetupStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Page Setup</h3>
        <p className="text-muted-foreground">
          Configure your drawing layout and export settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Page Size</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={settings.pageSize?.id}
              onValueChange={(value) => {
                const pageSize = pageSizes.find(p => p.id === value);
                if (pageSize) onSettingsChange({ pageSize });
              }}
              className="space-y-3"
            >
              {pageSizes.map((size) => (
                <div key={size.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={size.id} id={size.id} />
                  <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{size.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {size.name} ({size.width}" × {size.height}")
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Scale and Orientation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scale & Orientation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scale">Drawing Scale</Label>
              <Select
                value={settings.scale?.id}
                onValueChange={(value) => {
                  const scale = scales.find(s => s.id === value);
                  if (scale) onSettingsChange({ scale });
                }}
              >
                <SelectTrigger id="scale" className="mt-1">
                  <SelectValue placeholder="Select scale" />
                </SelectTrigger>
                <SelectContent>
                  {scales.map((scale) => (
                    <SelectItem key={scale.id} value={scale.id}>
                      {scale.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="orientation">Orientation</Label>
              <RadioGroup
                value={settings.orientation}
                onValueChange={(value: 'portrait' | 'landscape') => 
                  onSettingsChange({ orientation: value })
                }
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Landscape</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Portrait</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-backings">Include Backings</Label>
                <Switch
                  id="include-backings"
                  checked={settings.includeBackings}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ includeBackings: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="include-dimensions">Include Dimensions</Label>
                <Switch
                  id="include-dimensions"
                  checked={settings.includeDimensions}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ includeDimensions: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="include-grid">Include Grid</Label>
                <Switch
                  id="include-grid"
                  checked={settings.includeGrid}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ includeGrid: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="quality">Export Quality</Label>
                <Select
                  value={settings.quality}
                  onValueChange={(value: 'draft' | 'standard' | 'high') => 
                    onSettingsChange({ quality: value })
                  }
                >
                  <SelectTrigger id="quality" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Fast)</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High Quality (Slow)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color-mode">Color Mode</Label>
                <Select
                  value={settings.colorMode}
                  onValueChange={(value: 'color' | 'grayscale' | 'blackwhite') => 
                    onSettingsChange({ colorMode: value })
                  }
                >
                  <SelectTrigger id="color-mode" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Full Color</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="blackwhite">Black & White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}