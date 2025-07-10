import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Image, 
  Layers,
  Grid3X3,
  Ruler,
  Package
} from 'lucide-react';
import { ExportSettings } from './ExportWizard';

interface ExportPreviewStepProps {
  settings: ExportSettings;
  backings: any[];
  onExport: () => Promise<void>;
  isExporting: boolean;
}

export function ExportPreviewStep({
  settings,
  backings,
  onExport,
  isExporting
}: ExportPreviewStepProps) {
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'dwg': return <Image className="w-4 h-4" />;
      case 'csv': return <Grid3X3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getEstimatedFileSize = () => {
    if (settings.format.id === 'csv') return '< 1 MB';
    
    let baseSize = 2; // Base PDF size in MB
    if (settings.quality === 'high') baseSize *= 2;
    if (settings.quality === 'draft') baseSize *= 0.5;
    if (backings.length > 50) baseSize *= 1.5;
    
    return `~${baseSize.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Export</h3>
        <p className="text-muted-foreground">
          Review your export settings and generate your drawing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {getFormatIcon(settings.format.id)}
              Export Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Format:</span>
              <Badge variant="outline">{settings.format.name}</Badge>
            </div>

            {settings.pageSize && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Page Size:</span>
                <span className="text-sm">{settings.pageSize.name}</span>
              </div>
            )}

            {settings.scale && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Scale:</span>
                <span className="text-sm">{settings.scale.name}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Orientation:</span>
              <span className="text-sm capitalize">{settings.orientation}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Quality:</span>
              <span className="text-sm capitalize">{settings.quality}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Color Mode:</span>
              <span className="text-sm">
                {settings.colorMode === 'blackwhite' ? 'Black & White' : 
                 settings.colorMode === 'grayscale' ? 'Grayscale' : 'Color'}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Size:</span>
              <span className="text-sm">{getEstimatedFileSize()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Content Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Content Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Backings:</span>
              </div>
              <Badge variant={settings.includeBackings ? 'default' : 'secondary'}>
                {settings.includeBackings ? `${backings.length} included` : 'Excluded'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                <span className="text-sm font-medium">Dimensions:</span>
              </div>
              <Badge variant={settings.includeDimensions ? 'default' : 'secondary'}>
                {settings.includeDimensions ? 'Included' : 'Excluded'}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm font-medium">Grid:</span>
              </div>
              <Badge variant={settings.includeGrid ? 'default' : 'secondary'}>
                {settings.includeGrid ? 'Included' : 'Excluded'}
              </Badge>
            </div>

            {settings.titleBlock && (
              <>
                <Separator />
                <div>
                  <div className="text-sm font-medium mb-2">Title Block:</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Project: {settings.titleBlock.projectName}</div>
                    <div>Drawing: {settings.titleBlock.drawingTitle}</div>
                    <div>Number: {settings.titleBlock.drawingNumber}</div>
                    <div>Scale: {settings.titleBlock.scale}</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Material Summary (for CSV export) */}
      {settings.format.id === 'csv' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Material Schedule Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="font-medium">Export will include:</div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Material type and dimensions</li>
                <li>Quantity and total length/area</li>
                <li>Location coordinates</li>
                <li>Installation height (AFF)</li>
                <li>Status (AI generated, user modified, approved)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Action */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Ready to Export</h4>
              <p className="text-sm text-muted-foreground">
                Your {settings.format.name.toLowerCase()} will be generated and downloaded automatically.
              </p>
            </div>

            <Button 
              size="lg"
              onClick={onExport}
              disabled={isExporting}
              className="w-full max-w-xs"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Generating {settings.format.name}...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {settings.format.name}
                </>
              )}
            </Button>

            {isExporting && (
              <div className="text-xs text-muted-foreground">
                This may take a few moments depending on drawing complexity...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}