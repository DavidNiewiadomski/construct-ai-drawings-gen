import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DetectionPanel } from '@/components/ai/DetectionPanel';
import { BackingRulesPanel } from '@/components/ai/BackingRulesPanel';
import { PlacementPreview } from '@/components/ai/PlacementPreview';
import { DetectedComponent, BackingRule, BackingPlacement, ProcessingStatus } from '@/types';
import { AIService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

const aiService = new AIService();

const PROCESSING_STEPS = [
  { id: 1, title: 'Detection Results', icon: CheckCircle, description: 'AI component detection and review' },
  { id: 2, title: 'Backing Rules', icon: Settings, description: 'Configure backing requirements' },
  { id: 3, title: 'Generated Placements', icon: BarChart3, description: 'Preview and approve placements' },
];

export default function Process() {
  const [currentStep, setCurrentStep] = useState(1);
  const [components, setComponents] = useState<DetectedComponent[]>([]);
  const [rules, setRules] = useState<BackingRule[]>([]);
  const [backings, setBackings] = useState<BackingPlacement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load backing rules
      const loadedRules = await aiService.getBackingRules();
      setRules(loadedRules);

      // Simulate loading components (would come from previous upload step)
      const mockFileIds = ['file-1', 'file-2'];
      const detectedComponents = await aiService.detectComponents(mockFileIds);
      setComponents(detectedComponents);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Failed to load detection results or backing rules.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlacements = async () => {
    setIsGenerating(true);
    try {
      const generatedBackings = await aiService.generatePlacements(components, rules);
      setBackings(generatedBackings);
      
      toast({
        title: 'Placements generated',
        description: `Generated ${generatedBackings.length} backing placements.`,
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Failed to generate backing placements. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2 && backings.length === 0) {
      // Generate placements when moving to step 3
      await generatePlacements();
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProceedToEditor = () => {
    // Save current state and navigate to main editor
    localStorage.setItem('generatedBackings', JSON.stringify(backings));
    navigate('/', { state: { backings } });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return components.length > 0;
      case 2:
        return rules.length > 0;
      case 3:
        return backings.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                AI Processing Pipeline
              </h1>
              <p className="text-muted-foreground mt-1">
                Process your drawings and generate backing placements with AI
              </p>
            </div>
            
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          {PROCESSING_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
                      ${isActive 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground bg-background text-muted-foreground'
                      }
                    `}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                
                {index < PROCESSING_STEPS.length - 1 && (
                  <div className="flex-1 mx-8">
                    <div
                      className={`h-0.5 transition-colors ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-muted-foreground/30'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <DetectionPanel
              components={components}
              onComponentsChange={setComponents}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && (
            <BackingRulesPanel
              rules={rules}
              onRulesChange={setRules}
            />
          )}

          {currentStep === 3 && (
            <PlacementPreview
              components={components}
              backings={backings}
              rules={rules}
              onBackingsChange={setBackings}
              onProceedToEditor={handleProceedToEditor}
              isGenerating={isGenerating}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < 3 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading || isGenerating}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              Step {currentStep} of {PROCESSING_STEPS.length}
            </Badge>
            
            <div className="text-sm text-muted-foreground">
              {currentStep === 1 && `${components.length} components detected`}
              {currentStep === 2 && `${rules.length} rules configured`}
              {currentStep === 3 && `${backings.length} placements generated`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}