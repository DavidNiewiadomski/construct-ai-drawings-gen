import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  FileText,
  Settings,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormatSelectionStep } from './FormatSelectionStep';
import { PageSetupStep } from './PageSetupStep';
import { TitleBlockStep } from './TitleBlockStep';
import { ExportPreviewStep } from './ExportPreviewStep';

export interface ExportFormat {
  id: 'pdf' | 'dwg' | 'csv';
  name: string;
  icon: string;
  description: string;
  requiresPageSetup?: boolean;
  requiresTitleBlock?: boolean;
}

export interface PageSize {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface Scale {
  id: string;
  name: string;
  ratio?: number;
}

export interface TitleBlockData {
  projectName: string;
  projectNumber: string;
  drawingTitle: string;
  drawingNumber: string;
  scale: string;
  date: string;
  drawnBy: string;
  checkedBy: string;
  revision: string;
  sheetNumber: string;
  totalSheets: string;
  company: string;
  logoUrl?: string;
}

export interface ExportSettings {
  format: ExportFormat;
  pageSize: PageSize;
  scale: Scale;
  orientation: 'portrait' | 'landscape';
  titleBlock: TitleBlockData;
  includeGrid: boolean;
  includeDimensions: boolean;
  includeBackings: boolean;
  quality: 'draft' | 'standard' | 'high';
  colorMode: 'color' | 'grayscale' | 'blackwhite';
}

interface ExportWizardProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onExport?: (settings: ExportSettings) => Promise<void>;
  children?: React.ReactNode;
  backings?: any[];
  projectName?: string;
}

const exportFormats: ExportFormat[] = [
  { 
    id: 'pdf', 
    name: 'PDF Drawing Set', 
    icon: '📄', 
    description: 'Professional PDF with title block',
    requiresPageSetup: true,
    requiresTitleBlock: true
  },
  { 
    id: 'dwg', 
    name: 'AutoCAD DWG', 
    icon: '📐', 
    description: 'For editing in AutoCAD',
    requiresPageSetup: false,
    requiresTitleBlock: false
  },
  { 
    id: 'csv', 
    name: 'Material Schedule', 
    icon: '📊', 
    description: 'Backing list for Excel',
    requiresPageSetup: false,
    requiresTitleBlock: false
  }
];

const pageSizes: PageSize[] = [
  { id: 'ANSI_A', name: '8.5" x 11"', width: 8.5, height: 11 },
  { id: 'ANSI_B', name: '11" x 17"', width: 11, height: 17 },
  { id: 'ANSI_C', name: '17" x 22"', width: 17, height: 22 },
  { id: 'ANSI_D', name: '22" x 34"', width: 22, height: 34 },
  { id: 'ARCH_D', name: '24" x 36"', width: 24, height: 36 }
];

const scales: Scale[] = [
  { id: 'fit', name: 'Fit to Page' },
  { id: '1/8', name: '1/8" = 1\'-0"', ratio: 1/96 },
  { id: '1/4', name: '1/4" = 1\'-0"', ratio: 1/48 },
  { id: '1/2', name: '1/2" = 1\'-0"', ratio: 1/24 },
  { id: '3/4', name: '3/4" = 1\'-0"', ratio: 1/16 },
  { id: '1', name: '1" = 1\'-0"', ratio: 1/12 },
  { id: 'custom', name: 'Custom Scale' }
];

export function ExportWizard({ 
  isOpen, 
  onOpenChange, 
  onExport,
  children,
  backings = [],
  projectName = 'Untitled Project'
}: ExportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSettings, setExportSettings] = useState<Partial<ExportSettings>>({
    format: exportFormats[0],
    pageSize: pageSizes[2], // Default to ANSI_C
    scale: scales[2], // Default to 1/4" = 1'-0"
    orientation: 'landscape',
    includeGrid: false,
    includeDimensions: true,
    includeBackings: true,
    quality: 'standard',
    colorMode: 'color',
    titleBlock: {
      projectName,
      projectNumber: '',
      drawingTitle: 'Backing Layout Plan',
      drawingNumber: 'A-001',
      scale: '1/4" = 1\'-0"',
      date: new Date().toLocaleDateString(),
      drawnBy: '',
      checkedBy: '',
      revision: 'A',
      sheetNumber: '1',
      totalSheets: '1',
      company: ''
    }
  });

  const steps = [
    { 
      id: 'format', 
      title: 'Export Format', 
      icon: FileText,
      description: 'Choose your export format'
    },
    { 
      id: 'setup', 
      title: 'Page Setup', 
      icon: Settings,
      description: 'Configure page size and scale'
    },
    { 
      id: 'titleblock', 
      title: 'Title Block', 
      icon: Palette,
      description: 'Add drawing information'
    },
    { 
      id: 'preview', 
      title: 'Preview & Export', 
      icon: CheckCircle,
      description: 'Review and export'
    }
  ];

  // Filter steps based on selected format
  const activeSteps = steps.filter((step, index) => {
    if (!exportSettings.format) return true;
    
    if (step.id === 'setup' && !exportSettings.format.requiresPageSetup) return false;
    if (step.id === 'titleblock' && !exportSettings.format.requiresTitleBlock) return false;
    
    return true;
  });

  const progress = ((currentStep + 1) / activeSteps.length) * 100;

  const updateSettings = (updates: Partial<ExportSettings>) => {
    setExportSettings(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExport = async () => {
    if (!onExport || !exportSettings.format) return;
    
    try {
      setIsExporting(true);
      await onExport(exportSettings as ExportSettings);
      onOpenChange?.(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderStepContent = () => {
    const activeStep = activeSteps[currentStep];
    
    switch (activeStep?.id) {
      case 'format':
        return (
          <FormatSelectionStep
            formats={exportFormats}
            selectedFormat={exportSettings.format}
            onFormatSelect={(format) => updateSettings({ format })}
          />
        );
      case 'setup':
        return (
          <PageSetupStep
            pageSizes={pageSizes}
            scales={scales}
            settings={exportSettings}
            onSettingsChange={updateSettings}
          />
        );
      case 'titleblock':
        return (
          <TitleBlockStep
            titleBlock={exportSettings.titleBlock}
            onTitleBlockChange={(titleBlock) => updateSettings({ titleBlock })}
          />
        );
      case 'preview':
        return (
          <ExportPreviewStep
            settings={exportSettings as ExportSettings}
            backings={backings}
            onExport={handleExport}
            isExporting={isExporting}
          />
        );
      default:
        return null;
    }
  };

  const canProceed = () => {
    const activeStep = activeSteps[currentStep];
    
    switch (activeStep?.id) {
      case 'format':
        return !!exportSettings.format;
      case 'setup':
        return !!(exportSettings.pageSize && exportSettings.scale);
      case 'titleblock':
        return !!(exportSettings.titleBlock?.projectName && exportSettings.titleBlock?.drawingTitle);
      default:
        return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Drawing
          </DialogTitle>
        </DialogHeader>

        {/* Progress and Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activeSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                        isActive && "border-primary bg-primary text-primary-foreground",
                        isCompleted && "border-green-500 bg-green-500 text-white",
                        !isActive && !isCompleted && "border-muted-foreground/30"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className={cn(
                        "text-sm font-medium",
                        isActive && "text-primary",
                        isCompleted && "text-green-600"
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                    {index < activeSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {activeSteps.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto py-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            
            {currentStep === activeSteps.length - 1 ? (
              <Button 
                onClick={handleExport}
                disabled={!canProceed() || isExporting}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}