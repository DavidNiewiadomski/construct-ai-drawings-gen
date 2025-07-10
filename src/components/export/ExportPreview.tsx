import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Loader2,
  FileText,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFExportService } from '@/services/pdfExportService';
import type { ExportSettings } from './ExportWizard';

interface ExportPreviewProps {
  settings: ExportSettings;
  backings?: any[];
  onExport?: () => Promise<void>;
  isExporting?: boolean;
  className?: string;
}

interface PreviewPage {
  id: string;
  title: string;
  content: string; // Base64 PDF or image data
  pageNumber: number;
}

export function ExportPreview({ 
  settings, 
  backings = [], 
  onExport,
  isExporting = false,
  className 
}: ExportPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Generate preview when settings change
  useEffect(() => {
    generatePreview();
  }, [settings]);

  const generatePreview = async () => {
    if (!settings.format) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Mock preview generation for different formats
      if (settings.format.id === 'pdf') {
        await generatePDFPreview();
      } else if (settings.format.id === 'dwg') {
        await generateDWGPreview();
      } else if (settings.format.id === 'csv') {
        await generateCSVPreview();
      }
    } catch (err) {
      console.error('Preview generation failed:', err);
      setError('Failed to generate preview. Please check your settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFPreview = async () => {
    // Convert settings to export config
    const config = {
      orientation: settings.orientation || 'landscape',
      pageSize: settings.pageSize || { width: 17, height: 22 },
      scale: settings.scale?.ratio || 1/48,
      includeOriginal: true,
      includeDimensions: settings.includeDimensions || false,
      includeSchedule: true,
      titleBlock: {
        logoUrl: settings.titleBlock?.logoUrl,
        fields: [
          { id: 'project', label: 'Project', value: settings.titleBlock?.projectName || '', x: 10, y: 20 },
          { id: 'title', label: 'Title', value: settings.titleBlock?.drawingTitle || '', x: 10, y: 40 },
          { id: 'number', label: 'Number', value: settings.titleBlock?.drawingNumber || '', x: 60, y: 20 },
          { id: 'date', label: 'Date', value: settings.titleBlock?.date || '', x: 60, y: 40 },
          { id: 'drawn', label: 'Drawn By', value: settings.titleBlock?.drawnBy || '', x: 10, y: 60 },
          { id: 'checked', label: 'Checked By', value: settings.titleBlock?.checkedBy || '', x: 60, y: 60 },
          { id: 'scale', label: 'Scale', value: settings.scale?.name || '', x: 10, y: 80 }
        ]
      },
      backings: backings.map((backing, index) => ({
        id: backing.id || `backing-${index}`,
        type: backing.type || '2x4',
        x: backing.x || 0,
        y: backing.y || 0,
        width: backing.width || 1,
        height: backing.height || 1,
        heightAFF: backing.heightAFF || 96,
        status: backing.status || 'ai_generated'
      })),
      materialSchedule: generateMaterialSchedule()
    };

    // Generate actual PDF for preview
    try {
      const pdfBlob = await PDFExportService.generatePDF(config);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // For now, create a single page preview
      // In a real implementation, you might use PDF.js to render pages
      setPages([{
        id: 'page-1',
        title: `${settings.titleBlock?.drawingTitle || 'Drawing'} - Page 1`,
        content: pdfUrl,
        pageNumber: 1
      }]);
    } catch (error) {
      console.error('PDF preview generation failed:', error);
      // Create mock preview
      setPages([{
        id: 'page-1',
        title: `${settings.titleBlock?.drawingTitle || 'Drawing'} - Page 1`,
        content: 'mock-pdf-preview',
        pageNumber: 1
      }]);
    }
  };

  const generateDWGPreview = async () => {
    // Mock DWG preview
    setPages([{
      id: 'dwg-1',
      title: 'AutoCAD Drawing Export',
      content: 'dwg-preview',
      pageNumber: 1
    }]);
  };

  const generateCSVPreview = async () => {
    // Mock CSV preview
    const csvContent = generateMaterialSchedule()
      .map(item => `${item.type},${item.count},${item.totalLength || ''},${item.totalArea || ''}`)
      .join('\n');
    
    setPages([{
      id: 'csv-1',
      title: 'Material Schedule Export',
      content: `Material Type,Quantity,Length,Area\n${csvContent}`,
      pageNumber: 1
    }]);
  };

  const generateMaterialSchedule = () => {
    const schedule = new Map();
    
    backings.forEach(backing => {
      const type = backing.type || '2x4';
      if (!schedule.has(type)) {
        schedule.set(type, { count: 0, totalLength: 0, totalArea: 0 });
      }
      
      const entry = schedule.get(type);
      entry.count += 1;
      entry.totalLength += backing.width || 1;
      entry.totalArea += (backing.width || 1) * (backing.height || 1);
    });
    
    return Array.from(schedule.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      totalLength: data.totalLength,
      totalArea: data.totalArea
    }));
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handlePrevPage = () => {
    setCurrentPageIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPageIndex(prev => Math.min(prev + 1, pages.length - 1));
  };

  const currentPage = pages[currentPageIndex];

  const renderPreviewContent = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Generating preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-destructive">
          <FileText className="w-8 h-8 mb-4" />
          <p>{error}</p>
          <Button variant="outline" onClick={generatePreview} className="mt-4">
            Retry
          </Button>
        </div>
      );
    }

    if (!currentPage) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <FileText className="w-8 h-8 mb-4" />
          <p>No preview available</p>
        </div>
      );
    }

    // Render based on format
    if (settings.format?.id === 'pdf') {
      return (
        <div 
          className="flex items-center justify-center h-full bg-gray-100 rounded"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
        >
          {currentPage.content.startsWith('blob:') ? (
            <iframe
              src={currentPage.content}
              className="w-full h-full border-0 rounded shadow-lg"
              title={currentPage.title}
            />
          ) : (
            <div className="bg-white shadow-lg rounded p-8 max-w-2xl">
              <div className="border-2 border-gray-300 p-6 min-h-[400px]">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">{settings.titleBlock?.drawingTitle}</h2>
                  <p className="text-sm text-muted-foreground">
                    {settings.pageSize?.name} • {settings.scale?.name}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <strong>Project:</strong> {settings.titleBlock?.projectName}
                  </div>
                  <div>
                    <strong>Drawing #:</strong> {settings.titleBlock?.drawingNumber}
                  </div>
                  <div>
                    <strong>Date:</strong> {settings.titleBlock?.date}
                  </div>
                  <div>
                    <strong>Scale:</strong> {settings.scale?.name}
                  </div>
                </div>
                
                <div className="border border-gray-200 p-4 mb-4 bg-gray-50">
                  <p className="text-center text-muted-foreground">
                    Drawing content with {backings.length} backing(s) will appear here
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Drawn by: {settings.titleBlock?.drawnBy}</p>
                  <p>Checked by: {settings.titleBlock?.checkedBy}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (settings.format?.id === 'csv') {
      return (
        <div 
          className="h-full bg-white rounded border overflow-auto"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
        >
          <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
            {currentPage.content}
          </pre>
        </div>
      );
    }

    if (settings.format?.id === 'dwg') {
      return (
        <div 
          className="flex items-center justify-center h-full bg-gray-100 rounded"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
        >
          <div className="bg-white shadow-lg rounded p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">AutoCAD DWG Export</h3>
            <p className="text-muted-foreground mb-4">
              {backings.length} backing elements will be exported
            </p>
            <Badge variant="outline">Ready for AutoCAD</Badge>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">Export Preview</h3>
          <p className="text-sm text-muted-foreground">
            {settings.format?.name} • {settings.pageSize?.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border rounded">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.25}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="px-2 text-sm font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Page Navigation */}
          {pages.length > 1 && (
            <div className="flex items-center gap-1 border rounded">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-2 text-sm">
                {currentPageIndex + 1} / {pages.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPageIndex === pages.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div 
        ref={previewRef}
        className="flex-1 overflow-auto p-4"
      >
        {renderPreviewContent()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {currentPage && (
            <span>{currentPage.title}</span>
          )}
        </div>
        
        <Button
          onClick={onExport}
          disabled={isExporting || isGenerating || !!error}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export {settings.format?.name}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}