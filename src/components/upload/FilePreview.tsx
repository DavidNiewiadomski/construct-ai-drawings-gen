import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, Image, Box, File, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface FilePreviewProps {
  file: File | { name: string; url: string; type: string; size: number };
  type: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model';
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  uploadProgress?: number;
  pages?: number;
  error?: string;
}

export function FilePreview({ file, type, status, uploadProgress = 0, pages, error }: FilePreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [thumbnailError, setThumbnailError] = useState(false);
  
  const getFileIcon = () => {
    const ext = file.name.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-400" />;
      case 'dwg':
      case 'dxf':
        return <Image className="h-8 w-8 text-blue-400" />;
      case 'ifc':
      case 'rvt':
        return <Box className="h-8 w-8 text-purple-400" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'uploading':
        return <Badge variant="secondary">Uploading ({uploadProgress}%)</Badge>;
      case 'processing':
        return <Badge variant="outline">Processing</Badge>;
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getTypeBadge = () => {
    const typeLabels = {
      contract_drawing: 'Contract',
      shop_drawing: 'Shop',
      submittal: 'Submittal',
      specification: 'Spec',
      bim_model: 'BIM'
    };
    return <Badge variant="outline">{typeLabels[type]}</Badge>;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPDF = file.name.toLowerCase().endsWith('.pdf');
  const fileUrl = 'url' in file ? file.url : URL.createObjectURL(file);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const renderThumbnail = () => {
    if (isPDF && !thumbnailError) {
      return (
        <div className="w-full h-32 bg-muted rounded flex items-center justify-center overflow-hidden">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setThumbnailError(true)}
            className="max-w-full max-h-full"
          >
            <Page
              pageNumber={1}
              width={120}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      );
    }

    return (
      <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
        {getFileIcon()}
      </div>
    );
  };

  const renderFullPreview = () => {
    if (isPDF) {
      return (
        <div className="max-h-[80vh] overflow-auto">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center"
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={Math.min(800, window.innerWidth - 100)}
                className="mb-4 shadow-lg"
              />
            ))}
          </Document>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          {getFileIcon()}
          <p className="mt-2 text-sm text-muted-foreground">
            Preview not available for this file type
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Thumbnail */}
          {renderThumbnail()}
          
          {/* File info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                  {pages && ` • ${pages} pages`}
                  {numPages > 0 && ` • ${numPages} pages`}
                </p>
              </div>
            </div>
            
            {/* Status and type badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              {getTypeBadge()}
            </div>
            
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Upload progress */}
            {status === 'uploading' && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            
            {/* Preview button */}
            {status === 'ready' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="mt-4">
                    {renderFullPreview()}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}