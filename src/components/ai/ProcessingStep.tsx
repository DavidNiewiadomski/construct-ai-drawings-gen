import { useEffect, useState } from 'react';
import { Brain, Zap, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DetectedComponent } from '@/types';
import { FileCard } from '@/stores/uploadStore';

interface ProcessingStepProps {
  selectedFiles: FileCard[];
  isProcessing: boolean;
  onProcessingComplete: (components: DetectedComponent[]) => void;
}

interface ProcessingStage {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
  duration: number; // in seconds
  status: 'pending' | 'active' | 'completed' | 'error';
}

const PROCESSING_STAGES: ProcessingStage[] = [
  {
    id: 'analysis',
    title: 'Document Analysis',
    description: 'Analyzing drawings and extracting visual elements',
    icon: Search,
    duration: 3,
    status: 'pending',
  },
  {
    id: 'detection',
    title: 'Component Detection',
    description: 'Identifying electrical components and fixtures',
    icon: Brain,
    duration: 4,
    status: 'pending',
  },
  {
    id: 'classification',
    title: 'Classification & Verification',
    description: 'Classifying components and verifying accuracy',
    icon: CheckCircle,
    duration: 2,
    status: 'pending',
  },
  {
    id: 'optimization',
    title: 'Results Optimization',
    description: 'Optimizing detection results and confidence scores',
    icon: Zap,
    duration: 1,
    status: 'pending',
  },
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
  onProcessingComplete 
}: ProcessingStepProps) {
  const [stages, setStages] = useState<ProcessingStage[]>(PROCESSING_STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (selectedFiles.length > 0 && !hasStarted) {
      setHasStarted(true);
      startProcessing();
    }
  }, [selectedFiles, hasStarted]);

  const startProcessing = async () => {
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    let elapsedTime = 0;

    for (let i = 0; i < stages.length; i++) {
      // Mark current stage as active
      setStages(prev => prev.map((stage, index) => ({
        ...stage,
        status: index === i ? 'active' : index < i ? 'completed' : 'pending'
      })));
      
      setCurrentStageIndex(i);
      
      const stageDuration = stages[i].duration;
      const startTime = Date.now();
      
      // Animate progress for current stage
      const progressInterval = setInterval(() => {
        const currentTime = Date.now();
        const stageElapsed = (currentTime - startTime) / 1000;
        const stageProgressValue = Math.min((stageElapsed / stageDuration) * 100, 100);
        
        setStageProgress(stageProgressValue);
        
        const totalElapsed = elapsedTime + stageElapsed;
        const overallProgressValue = Math.min((totalElapsed / totalDuration) * 100, 100);
        setOverallProgress(overallProgressValue);
        
        if (stageProgressValue >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);
      
      // Wait for stage duration
      await new Promise(resolve => setTimeout(resolve, stageDuration * 1000));
      
      clearInterval(progressInterval);
      elapsedTime += stageDuration;
      
      // Mark stage as completed
      setStages(prev => prev.map((stage, index) => ({
        ...stage,
        status: index <= i ? 'completed' : 'pending'
      })));
      
      setStageProgress(100);
    }
    
    // Generate mock components and complete processing
    const mockComponents = generateMockComponents(selectedFiles.length);
    onProcessingComplete(mockComponents);
  };

  const getStageStatusIcon = (stage: ProcessingStage) => {
    const Icon = stage.icon;
    
    switch (stage.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'active':
        return <Icon className="h-5 w-5 text-primary animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Icon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Processing {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
          </h3>
          <Badge variant="outline">
            {Math.round(overallProgress)}% Complete
          </Badge>
        </div>
        
        <Progress value={overallProgress} className="h-3" />
        
        <div className="text-sm text-muted-foreground">
          Estimated time remaining: {Math.max(0, Math.ceil((100 - overallProgress) * 0.1))} seconds
        </div>
      </div>

      {/* Processing Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <Card
            key={stage.id}
            className={`
              transition-all duration-300
              ${stage.status === 'active' 
                ? 'border-primary shadow-lg bg-primary/5' 
                : stage.status === 'completed'
                ? 'border-green-500 bg-green-50/50'
                : 'border-muted'
              }
            `}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getStageStatusIcon(stage)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground truncate">
                      {stage.title}
                    </h4>
                    <Badge 
                      variant={
                        stage.status === 'completed' ? 'default' :
                        stage.status === 'active' ? 'secondary' :
                        'outline'
                      }
                      className="ml-2"
                    >
                      {stage.status === 'completed' ? 'Done' :
                       stage.status === 'active' ? 'Processing' :
                       'Pending'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {stage.description}
                  </p>
                  
                  {stage.status === 'active' && (
                    <Progress value={stageProgress} className="h-2" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* File Processing Status */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-3">Files Being Processed</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded"
              >
                <span className="text-sm text-foreground truncate flex-1">
                  {file.name}
                </span>
                <div className="flex items-center space-x-2 ml-4">
                  <Badge variant="outline" className="text-xs">
                    {file.type.replace('_', ' ')}
                  </Badge>
                  {overallProgress > (index / selectedFiles.length) * 100 && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
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