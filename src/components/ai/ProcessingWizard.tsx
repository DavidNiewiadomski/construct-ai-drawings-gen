import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileSelectionStep } from './FileSelectionStep';
import { ProcessingStep } from './ProcessingStep';
import { DetectionReviewStep } from './DetectionReviewStep';
import { BackingGenerationStep } from './BackingGenerationStep';
import { FinalReviewStep } from './FinalReviewStep';
import { FileCard } from '@/stores/uploadStore';
import { AIDetectedComponent, AIBackingRule, AIBackingPlacement } from '@/types';
import { useToast } from '@/hooks/use-toast';

const WIZARD_STEPS = [
  { 
    id: 1, 
    title: 'File Selection', 
    description: 'Choose files to process with AI',
    component: FileSelectionStep 
  },
  { 
    id: 2, 
    title: 'Processing', 
    description: 'AI analyzing your drawings',
    component: ProcessingStep 
  },
  { 
    id: 3, 
    title: 'Detection Review', 
    description: 'Review detected components',
    component: DetectionReviewStep 
  },
  { 
    id: 4, 
    title: 'Backing Generation', 
    description: 'Generate backing placements',
    component: BackingGenerationStep 
  },
  { 
    id: 5, 
    title: 'Final Review', 
    description: 'Review and approve results',
    component: FinalReviewStep 
  },
];

interface ProcessingWizardProps {
  onComplete: (data: {
    selectedFiles: FileCard[];
    detectedComponents: AIDetectedComponent[];
    backingPlacements: AIBackingPlacement[];
  }) => void;
  onCancel: () => void;
}

export function ProcessingWizard({ onComplete, onCancel }: ProcessingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<FileCard[]>([]);
  const [detectedComponents, setDetectedComponents] = useState<AIDetectedComponent[]>([]);
  const [backingRules, setBackingRules] = useState<AIBackingRule[]>([]);
  const [backingPlacements, setBackingPlacements] = useState<AIBackingPlacement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const currentStepData = WIZARD_STEPS.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const canProceed = () => {
    switch (currentStep) {
      case 1: // File Selection
        return selectedFiles.length > 0;
      case 2: // Processing
        return !isProcessing && detectedComponents.length > 0;
      case 3: // Detection Review
        return detectedComponents.some(c => c.confirmed);
      case 4: // Backing Generation
        return backingPlacements.length > 0;
      case 5: // Final Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete({
      selectedFiles,
      detectedComponents: detectedComponents.filter(c => c.confirmed),
      backingPlacements,
    });
  };

  const stepProgress = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                AI Processing Wizard
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentStepData?.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep} of {WIZARD_STEPS.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(stepProgress)}% Complete
              </span>
            </div>
            <Progress value={stepProgress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Step Navigation */}
      <div className="bg-card/30 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isAccessible = currentStep >= step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all
                        ${isActive 
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-110' 
                          : isCompleted 
                          ? 'border-green-500 bg-green-500 text-white'
                          : isAccessible
                          ? 'border-muted-foreground bg-background text-muted-foreground hover:border-primary cursor-pointer'
                          : 'border-muted bg-muted text-muted-foreground'
                        }
                      `}
                      onClick={() => isAccessible && setCurrentStep(step.id)}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="flex-1 mx-4 md:mx-8">
                      <div
                        className={`h-0.5 transition-colors ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-6 py-8">
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{currentStepData?.title}</span>
              <Badge variant="outline">{currentStep}/{WIZARD_STEPS.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {CurrentStepComponent && (
              <CurrentStepComponent
                // Step 1 props
                selectedFiles={selectedFiles}
                onSelectedFilesChange={setSelectedFiles}
                
                // Step 2 props
                isProcessing={isProcessing}
                onProcessingComplete={(components) => {
                  setDetectedComponents(components);
                  setIsProcessing(false);
                }}
                
                // Step 3 props
                detectedComponents={detectedComponents}
                onComponentsChange={setDetectedComponents}
                
                // Step 4 props
                detectedComponents={detectedComponents}
                onPlacementsGenerated={setBackingPlacements}
                
                // Step 5 props
                onViewInEditor={handleComplete}
                onRegenerate={() => setBackingPlacements([])}
                onExportReport={() => {}}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="text-center">
            <Badge variant="secondary" className="px-4 py-2">
              {currentStepData?.title}
            </Badge>
          </div>

          {currentStep < WIZARD_STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isProcessing}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Processing
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}