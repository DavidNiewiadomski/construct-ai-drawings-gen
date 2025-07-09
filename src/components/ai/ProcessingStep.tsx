import { useEffect, useState } from 'react';
import { Brain, FileText, Search, Zap, CheckCircle, AlertCircle, X, Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetectedComponent } from '@/types';
import { FileCard } from '@/stores/uploadStore';

interface ProcessingStepProps {
  selectedFiles: FileCard[];
  isProcessing: boolean;
  onProcessingComplete: (components: DetectedComponent[]) => void;
  onCancel?: () => void;
}

const processingStages = [
  { 
    name: 'Preparing Files', 
    duration: 2000,
    icon: FileText,
    messages: [
      'Loading drawing files...',
      'Validating file formats...',
      'Optimizing for processing...'
    ]
  },
  { 
    name: 'Extracting Text (OCR)', 
    duration: 3000,
    icon: Search,
    messages: [
      'Scanning drawings for text...',
      'Processing annotations...',
      'Extracting component labels...'
    ]
  },
  { 
    name: 'Detecting Components', 
    duration: 4000,
    icon: Brain,
    messages: [
      'Found 12 potential components...',
      'Analyzing electrical fixtures...',
      'Identifying mounting points...',
      'Classifying component types...'
    ]
  },
  { 
    name: 'Analyzing Specifications', 
    duration: 3000,
    icon: Zap,
    messages: [
      'Analyzing mounting requirements...',
      'Cross-referencing specifications...',
      'Calculating load requirements...'
    ]
  },
  { 
    name: 'Generating Placements', 
    duration: 2000,
    icon: CheckCircle,
    messages: [
      'Generating backing placements...',
      'Optimizing material usage...',
      'Finalizing results...'
    ]
  }
];

// Mock detected components for demo
const generateMockComponents = (fileCount: number): DetectedComponent[] => {
  const componentTypes = [
    'Outlet', 'Switch', 'Light Fixture', 'Panel', 'Junction Box',
    'Receptacle', 'Disconnect', 'Motor', 'Transformer', 'Conduit Run'
  ];
  
  const components: DetectedComponent[] = [];
  
  for (let i = 0; i < fileCount * 8; i++) {
    components.push({
      id: `comp-${i + 1}`,
      type: componentTypes[Math.floor(Math.random() * componentTypes.length)],
      confidence: 0.75 + Math.random() * 0.25,
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 800
      },
      bounds: {
        x: Math.random() * 1000,
        y: Math.random() * 800,
        width: 20 + Math.random() * 40,
        height: 20 + Math.random() * 40
      },
      drawingId: `file-${Math.floor(i / 8) + 1}`,
      confirmed: false,
      needsBacking: Math.random() > 0.3,
      properties: {
        voltage: ['120V', '240V', '480V'][Math.floor(Math.random() * 3)],
        amperage: [15, 20, 30, 50][Math.floor(Math.random() * 4)],
        phase: Math.random() > 0.5 ? 'single' : 'three',
      }
    });
  }
  
  return components;
};

export function ProcessingStep({ 
  selectedFiles, 
  isProcessing, 
  onProcessingComplete,
  onCancel 
}: ProcessingStepProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const totalDuration = processingStages.reduce((sum, stage) => sum + stage.duration, 0);

  useEffect(() => {
    if (selectedFiles.length > 0 && !hasStarted) {
      setHasStarted(true);
      startProcessing();
    }
  }, [selectedFiles, hasStarted]);

  const startProcessing = async () => {
    let elapsedTime = 0;

    for (let i = 0; i < processingStages.length; i++) {
      const stage = processingStages[i];
      setCurrentStageIndex(i);
      setStageProgress(0);
      
      const startTime = Date.now();
      
      // Cycle through messages for this stage
      const messageInterval = setInterval(() => {
        const randomMessage = stage.messages[Math.floor(Math.random() * stage.messages.length)];
        setCurrentMessage(randomMessage);
      }, 800);
      
      // Animate progress for current stage
      const progressInterval = setInterval(() => {
        const currentTime = Date.now();
        const stageElapsed = (currentTime - startTime);
        const stageProgressValue = Math.min((stageElapsed / stage.duration) * 100, 100);
        
        setStageProgress(stageProgressValue);
        
        const totalElapsed = elapsedTime + stageElapsed;
        const overallProgressValue = Math.min((totalElapsed / totalDuration) * 100, 100);
        setOverallProgress(overallProgressValue);
        
        if (stageProgressValue >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
        }
      }, 50);
      
      // Wait for stage duration
      await new Promise(resolve => setTimeout(resolve, stage.duration));
      
      // Mark stage as completed
      setCompletedStages(prev => [...prev, i]);
      elapsedTime += stage.duration;
    }
    
    // Generate mock components and complete processing
    const mockComponents = generateMockComponents(selectedFiles.length);
    setCurrentMessage(`Processing complete! Generated ${mockComponents.length} components.`);
    onProcessingComplete(mockComponents);
  };

  const getStageIcon = (stageIndex: number) => {
    const stage = processingStages[stageIndex];
    const Icon = stage.icon;
    
    if (completedStages.includes(stageIndex)) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (currentStageIndex === stageIndex) {
      return <Icon className="h-5 w-5 text-primary animate-pulse" />;
    } else {
      return <Icon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Cancel Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            AI Processing in Progress
          </h3>
          <p className="text-sm text-muted-foreground">
            Processing {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} with advanced AI algorithms
          </p>
        </div>
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="text-destructive hover:bg-destructive/10">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <Badge variant="outline">
                {Math.round(overallProgress)}% Complete
              </Badge>
            </div>
            
            <Progress value={overallProgress} className="h-3" />
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Stage {currentStageIndex + 1} of {processingStages.length}</span>
              <span>Est. {Math.max(0, Math.ceil((100 - overallProgress) * 0.15))}s remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Stage */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Loader className="h-6 w-6 text-primary animate-spin" />
              <div>
                <h4 className="font-semibold text-foreground">
                  {processingStages[currentStageIndex]?.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {currentMessage}
                </p>
              </div>
            </div>
            
            <Progress value={stageProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stage Checklist */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium text-foreground mb-4">Processing Stages</h4>
          <div className="space-y-3">
            {processingStages.map((stage, index) => (
              <div
                key={index}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg transition-all
                  ${currentStageIndex === index 
                    ? 'bg-primary/10 border border-primary/20' 
                    : completedStages.includes(index)
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-muted/30'
                  }
                `}
              >
                {getStageIcon(index)}
                <div className="flex-1">
                  <span className={`
                    text-sm font-medium
                    ${completedStages.includes(index) 
                      ? 'text-green-700' 
                      : currentStageIndex === index 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                    }
                  `}>
                    {stage.name}
                  </span>
                </div>
                
                {currentStageIndex === index && (
                  <Badge variant="secondary" className="text-xs">
                    In Progress
                  </Badge>
                )}
                
                {completedStages.includes(index) && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    Complete
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Processing Status */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium text-foreground mb-4">Files</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded"
              >
                <span className="text-sm text-foreground truncate flex-1">
                  {file.name}
                </span>
                <div className="flex items-center space-x-2 ml-4">
                  <Badge variant="outline" className="text-xs">
                    {file.type.replace('_', ' ')}
                  </Badge>
                  {overallProgress > (index / selectedFiles.length) * 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Loader className="h-4 w-4 text-muted-foreground animate-spin" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}