import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportQueue } from '@/components/export/ExportQueue';
import { ExportProgressIndicator } from '@/components/export/ExportProgressIndicator';
import { useExportQueue } from '@/hooks/useExportQueue';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';

export function ExportDemo() {
  const { addJob, isLoading } = useExportQueue();

  const handleExportPDF = async () => {
    await addJob('pdf', {
      orientation: 'landscape',
      pageSize: { width: 17, height: 22 },
      scale: { ratio: 1/48 },
      includeOriginal: true,
      includeDimensions: true,
      includeSchedule: true,
      titleBlock: {
        projectName: 'Sample Project',
        drawingTitle: 'Backing Layout Plan',
        drawingNumber: 'A-001',
        date: new Date().toLocaleDateString()
      },
      backings: []
    }, 'backing-layout-plan.pdf');
  };

  const handleExportCSV = async () => {
    await addJob('csv', {
      backings: [
        {
          id: '1',
          type: '2x4',
          x: 10,
          y: 20,
          width: 48,
          height: 16,
          heightAFF: 96,
          status: 'ai_generated'
        }
      ]
    }, 'material-schedule.csv');
  };

  const handleExportDWG = async () => {
    await addJob('dwg', {
      backings: [],
      settings: { format: 'AutoCAD 2020' }
    }, 'backing-layout.dwg');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Progress Indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Export Demo</h2>
        <ExportProgressIndicator />
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleExportPDF}
              disabled={isLoading}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              <FileText className="w-6 h-6" />
              <span>Export PDF</span>
            </Button>
            
            <Button
              onClick={handleExportCSV}
              disabled={isLoading}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              <FileSpreadsheet className="w-6 h-6" />
              <span>Export CSV</span>
            </Button>
            
            <Button
              onClick={handleExportDWG}
              disabled={isLoading}
              className="h-20 flex-col gap-2"
              variant="outline"
            >
              <File className="w-6 h-6" />
              <span>Export DWG</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Queue */}
      <ExportQueue />
    </div>
  );
}