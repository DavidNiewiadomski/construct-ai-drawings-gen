import { useState, useEffect } from 'react';
import { CheckSquare, Square, FileText, Image, File, HardDrive, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useUploadStore, FileCard } from '@/stores/uploadStore';
import { formatFileSize } from '@/lib/utils';

interface FileSelectionStepProps {
  selectedFiles: FileCard[];
  onSelectedFilesChange: (files: FileCard[]) => void;
}

const FILE_TYPE_ICONS = {
  contract_drawing: FileText,
  shop_drawing: Image,
  submittal: File,
  specification: HardDrive,
  bim_model: Package,
};

const FILE_TYPE_LABELS = {
  contract_drawing: 'Contract Drawing',
  shop_drawing: 'Shop Drawing',
  submittal: 'Submittal',
  specification: 'Specification',
  bim_model: 'BIM Model',
};

const FILE_TYPE_COLORS = {
  contract_drawing: 'bg-blue-100 text-blue-800 border-blue-200',
  shop_drawing: 'bg-green-100 text-green-800 border-green-200',
  submittal: 'bg-purple-100 text-purple-800 border-purple-200',
  specification: 'bg-orange-100 text-orange-800 border-orange-200',
  bim_model: 'bg-pink-100 text-pink-800 border-pink-200',
};

export function FileSelectionStep({ selectedFiles, onSelectedFilesChange }: FileSelectionStepProps) {
  const { files } = useUploadStore();
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter only ready files for processing
  const availableFiles = files.filter(file => file.status === 'ready');
  
  useEffect(() => {
    // Update select all state
    if (availableFiles.length > 0) {
      setSelectAll(selectedFiles.length === availableFiles.length);
    }
  }, [selectedFiles.length, availableFiles.length]);

  const handleFileToggle = (file: FileCard) => {
    const isSelected = selectedFiles.some(f => f.id === file.id);
    
    if (isSelected) {
      onSelectedFilesChange(selectedFiles.filter(f => f.id !== file.id));
    } else {
      onSelectedFilesChange([...selectedFiles, file]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      onSelectedFilesChange([]);
    } else {
      onSelectedFilesChange(availableFiles);
    }
    setSelectAll(!selectAll);
  };

  const totalSelectedSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  if (availableFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Files Available
        </h3>
        <p className="text-muted-foreground mb-6">
          Upload and process some files first before using the AI wizard.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back to Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center space-x-2"
          >
            {selectAll ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span>{selectAll ? 'Deselect All' : 'Select All'}</span>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {selectedFiles.length} of {availableFiles.length} files selected
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            Total Size: {formatFileSize(totalSelectedSize)}
          </Badge>
          
          {selectedFiles.length > 0 && (
            <Badge variant="default">
              Ready to Process
            </Badge>
          )}
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableFiles.map((file) => {
          const isSelected = selectedFiles.some(f => f.id === file.id);
          const Icon = FILE_TYPE_ICONS[file.type];
          
          return (
            <Card
              key={file.id}
              className={`
                cursor-pointer transition-all duration-200 hover:shadow-md
                ${isSelected 
                  ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
                  : 'hover:shadow-sm border-2 border-transparent hover:border-muted-foreground/20'
                }
              `}
              onClick={() => handleFileToggle(file)}
            >
              <CardContent className="p-4">
                {/* Header with checkbox */}
                <div className="flex items-start justify-between mb-3">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleFileToggle(file)}
                    className="mt-1"
                  />
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${FILE_TYPE_COLORS[file.type]}`}
                  >
                    {FILE_TYPE_LABELS[file.type]}
                  </Badge>
                </div>

                {/* Thumbnail */}
                <div className="flex items-center justify-center h-24 mb-3 bg-muted/50 rounded-lg overflow-hidden">
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-foreground truncate" title={file.name}>
                    {file.name}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    {file.pages && (
                      <span>{file.pages} page{file.pages !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                {/* Processing Indicator */}
                {isSelected && (
                  <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/20">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs text-primary font-medium">
                        Selected for AI Processing
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <h4 className="font-semibold text-foreground mb-2">Processing Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Files:</span>
              <span className="ml-2 font-medium">{selectedFiles.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Size:</span>
              <span className="ml-2 font-medium">{formatFileSize(totalSelectedSize)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Est. Time:</span>
              <span className="ml-2 font-medium">{Math.ceil(selectedFiles.length * 0.5)} min</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className="ml-2 font-medium text-green-600">Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}