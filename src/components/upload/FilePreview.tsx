import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, Image, Box, File, Eye, AlertCircle, MoreVertical, Download, Trash2, Edit3, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js`;

interface FilePreviewProps {
  file: File | { name: string; url: string; type: string; size: number };
  type: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model';
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  uploadProgress?: number;
  pages?: number;
  error?: string;
  onTypeChange?: (newType: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model') => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

export function FilePreview({ file, type, status, uploadProgress = 0, pages, error, onTypeChange, onDelete, onDownload }: FilePreviewProps) {
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

  const getStatusIndicator = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Analyzing...</span>
          </div>
        );
      case 'ready':
        return (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">Ready</span>
          </div>
        );
      case 'failed':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Failed</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{error || 'Upload failed'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  const typeLabels = {
    contract_drawing: 'Contract Drawing',
    shop_drawing: 'Shop Drawing',
    submittal: 'Submittal',
    specification: 'Specification',
    bim_model: 'BIM Model'
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
          
          {/* File info header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium truncate cursor-help">
                      {file.name}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{file.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{formatFileSize(file.size)}</span>
                {(pages || numPages > 0) && (
                  <>
                    <span>•</span>
                    <span>{pages || numPages} pages</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Actions menu */}
            {status === 'ready' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Eye className="h-4 w-4 mr-2" />
                        View full document
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <div className="mt-4">
                        {renderFullPreview()}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenuItem disabled>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Change type
                  </DropdownMenuItem>
                  {onDownload && (
                    <DropdownMenuItem onClick={onDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download original
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Type selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">File Type</label>
            <Select 
              value={type} 
              onValueChange={onTypeChange}
              disabled={status !== 'ready'}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract_drawing">Contract Drawing</SelectItem>
                <SelectItem value="shop_drawing">Shop Drawing</SelectItem>
                <SelectItem value="submittal">Submittal</SelectItem>
                <SelectItem value="specification">Specification</SelectItem>
                <SelectItem value="bim_model">BIM Model</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center justify-between">
            {getStatusIndicator()}
          </div>
          
          {/* Upload progress */}
          {status === 'uploading' && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}