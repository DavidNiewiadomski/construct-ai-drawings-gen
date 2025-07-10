import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ExportFormat } from './ExportWizard';

interface FormatSelectionStepProps {
  formats: ExportFormat[];
  selectedFormat?: ExportFormat;
  onFormatSelect: (format: ExportFormat) => void;
}

export function FormatSelectionStep({
  formats,
  selectedFormat,
  onFormatSelect
}: FormatSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Export Format</h3>
        <p className="text-muted-foreground">
          Select the format you'd like to export your drawing to.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formats.map((format) => (
          <Card
            key={format.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedFormat?.id === format.id && "ring-2 ring-primary bg-primary/5"
            )}
            onClick={() => onFormatSelect(format)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{format.icon}</div>
              <h4 className="font-semibold mb-2">{format.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {format.description}
              </p>
              
              <div className="flex flex-wrap gap-1 justify-center">
                {format.requiresPageSetup && (
                  <Badge variant="secondary" className="text-xs">
                    Page Setup
                  </Badge>
                )}
                {format.requiresTitleBlock && (
                  <Badge variant="secondary" className="text-xs">
                    Title Block
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFormat && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Format: {selectedFormat.name}</h4>
          <p className="text-sm text-muted-foreground">
            {selectedFormat.description}
          </p>
        </div>
      )}
    </div>
  );
}