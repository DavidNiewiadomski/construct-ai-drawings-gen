import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Building } from 'lucide-react';
import { TitleBlockData } from './ExportWizard';

interface TitleBlockStepProps {
  titleBlock?: TitleBlockData;
  onTitleBlockChange: (titleBlock: TitleBlockData) => void;
}

export function TitleBlockStep({
  titleBlock,
  onTitleBlockChange
}: TitleBlockStepProps) {
  const updateField = (field: keyof TitleBlockData, value: string) => {
    if (!titleBlock) return;
    onTitleBlockChange({
      ...titleBlock,
      [field]: value
    });
  };

  if (!titleBlock) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Title Block Information</h3>
        <p className="text-muted-foreground">
          Add professional drawing information to your title block.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="w-4 h-4" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={titleBlock.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                placeholder="Enter project name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="project-number">Project Number</Label>
              <Input
                id="project-number"
                value={titleBlock.projectNumber}
                onChange={(e) => updateField('projectNumber', e.target.value)}
                placeholder="e.g., 2024-001"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="company">Company/Firm</Label>
              <Input
                id="company"
                value={titleBlock.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Your company name"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Drawing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drawing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="drawing-title">Drawing Title *</Label>
              <Input
                id="drawing-title"
                value={titleBlock.drawingTitle}
                onChange={(e) => updateField('drawingTitle', e.target.value)}
                placeholder="e.g., Backing Layout Plan"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="drawing-number">Drawing Number</Label>
                <Input
                  id="drawing-number"
                  value={titleBlock.drawingNumber}
                  onChange={(e) => updateField('drawingNumber', e.target.value)}
                  placeholder="A-001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="revision">Revision</Label>
                <Input
                  id="revision"
                  value={titleBlock.revision}
                  onChange={(e) => updateField('revision', e.target.value)}
                  placeholder="A"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="scale">Scale</Label>
                <Input
                  id="scale"
                  value={titleBlock.scale}
                  onChange={(e) => updateField('scale', e.target.value)}
                  placeholder="1/4&quot; = 1'-0&quot;"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sheet-number">Sheet</Label>
                <Input
                  id="sheet-number"
                  value={titleBlock.sheetNumber}
                  onChange={(e) => updateField('sheetNumber', e.target.value)}
                  placeholder="1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="total-sheets">of</Label>
                <Input
                  id="total-sheets"
                  value={titleBlock.totalSheets}
                  onChange={(e) => updateField('totalSheets', e.target.value)}
                  placeholder="1"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signature Block */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signature Block</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="drawn-by">Drawn By</Label>
              <Input
                id="drawn-by"
                value={titleBlock.drawnBy}
                onChange={(e) => updateField('drawnBy', e.target.value)}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="checked-by">Checked By</Label>
              <Input
                id="checked-by"
                value={titleBlock.checkedBy}
                onChange={(e) => updateField('checkedBy', e.target.value)}
                placeholder="Reviewer name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={titleBlock.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Logo (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Logo
            </Button>
            {titleBlock.logoUrl && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>✓ Logo uploaded</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateField('logoUrl', '')}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Recommended: PNG or JPG, max 2MB, 300x100px for best results
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Title Block Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded p-4 bg-white text-black font-mono text-xs">
            <div className="border-b pb-2 mb-2">
              <div className="flex justify-between items-center">
                <div className="font-bold">{titleBlock.company || 'Company Name'}</div>
                <div className="text-right">
                  <div>Sheet {titleBlock.sheetNumber} of {titleBlock.totalSheets}</div>
                  <div>{titleBlock.drawingNumber} Rev. {titleBlock.revision}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-semibold">{titleBlock.projectName}</div>
                <div className="text-gray-600">Project: {titleBlock.projectNumber}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{titleBlock.drawingTitle}</div>
                <div className="text-gray-600">Scale: {titleBlock.scale}</div>
              </div>
              <div className="text-right text-xs">
                <div>Drawn: {titleBlock.drawnBy}</div>
                <div>Checked: {titleBlock.checkedBy}</div>
                <div>Date: {titleBlock.date}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}