import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  HelpCircle, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  BookOpen,
  Video,
  Keyboard,
  MessageCircleQuestion
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  content: React.ReactNode;
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  startTutorial?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AI Backing Generator',
    description: 'Let\'s get you started with generating backing drawings',
    content: (
      <div className="space-y-4">
        <p>This tool helps you automatically generate backing placement recommendations from construction drawings.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">1</div>
            <span>Upload drawings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">2</div>
            <span>AI detects components</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">3</div>
            <span>Review & edit</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">4</div>
            <span>Export drawings</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'upload',
    title: 'Upload Your Drawings',
    description: 'Start by uploading PDF plans or BIM models',
    target: '.upload-zone',
    content: (
      <div className="space-y-4">
        <p>Drag and drop files or click to browse. Supported formats:</p>
        <div className="grid grid-cols-2 gap-2">
          <Badge variant="secondary">PDF Plans</Badge>
          <Badge variant="secondary">IFC Models</Badge>
          <Badge variant="secondary">DWG Files</Badge>
          <Badge variant="secondary">Submittals</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Files are processed with AI to detect mounting components automatically.
        </p>
      </div>
    )
  },
  {
    id: 'detection',
    title: 'Review AI Detections',
    description: 'Check detected components and backing rules',
    content: (
      <div className="space-y-4">
        <p>The AI has analyzed your drawings and detected:</p>
        <ul className="space-y-2">
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>TV mounts, displays, equipment</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Electrical boxes and panels</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Heavy fixtures and equipment</span>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Click on any detection to modify the backing requirements.
        </p>
      </div>
    )
  },
  {
    id: 'editing',
    title: 'Edit Backing Placements',
    description: 'Adjust positions, sizes, and specifications',
    content: (
      <div className="space-y-4">
        <p>Use the editing tools to refine backing placements:</p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Click</kbd>
            <span>Select backing</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Drag</kbd>
            <span>Move position</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Corners</kbd>
            <span>Resize backing</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Double-click</kbd>
            <span>Edit properties</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'export',
    title: 'Export Final Drawings',
    description: 'Generate construction-ready backing drawings',
    content: (
      <div className="space-y-4">
        <p>Export your completed backing drawings:</p>
        <div className="grid grid-cols-1 gap-2">
          <div className="p-3 border rounded-lg">
            <div className="font-medium">PDF Drawing Set</div>
            <div className="text-sm text-muted-foreground">Complete plans with dimensions</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="font-medium">Material List</div>
            <div className="text-sm text-muted-foreground">Lumber quantities and specifications</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="font-medium">Installation Notes</div>
            <div className="text-sm text-muted-foreground">Mounting guidelines and requirements</div>
          </div>
        </div>
      </div>
    )
  }
];

const keyboardShortcuts = [
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'Ctrl+O', description: 'Open files' },
  { key: 'Ctrl+S', description: 'Save project' },
  { key: 'Ctrl+E', description: 'Export drawings' },
  { key: 'Ctrl+Z', description: 'Undo' },
  { key: 'Ctrl+Y', description: 'Redo' },
  { key: 'Space', description: 'Pan mode (hold)' },
  { key: 'Delete', description: 'Delete selected' },
  { key: 'Escape', description: 'Cancel operation' },
  { key: '+/-', description: 'Zoom in/out' },
  { key: 'F', description: 'Fit to view' },
  { key: 'R', description: 'Rotate view' }
];

const faqItems = [
  {
    question: 'What file formats are supported?',
    answer: 'We support PDF floor plans, DWG/DXF CAD files, IFC BIM models, and construction submittals.'
  },
  {
    question: 'How accurate is the AI detection?',
    answer: 'Our AI achieves 90%+ accuracy on standard construction drawings. Always review detections before finalizing.'
  },
  {
    question: 'Can I customize backing standards?',
    answer: 'Yes! Access Settings to configure backing rules, lumber sizes, and mounting requirements for your standards.'
  },
  {
    question: 'How do I handle special mounting conditions?',
    answer: 'Use the manual backing placement tools for custom requirements, then save patterns for future use.'
  },
  {
    question: 'Can multiple people work on the same project?',
    answer: 'Yes, the platform supports real-time collaboration with comments, approvals, and change tracking.'
  }
];

export function HelpSystem({ isOpen, onClose, startTutorial = false }: HelpSystemProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [tutorialActive, setTutorialActive] = useState(startTutorial);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (startTutorial) {
      setTutorialActive(true);
      setCurrentStep(0);
    }
  }, [startTutorial]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setTutorialActive(false);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTutorialFlow = () => {
    setTutorialActive(true);
    setCurrentStep(0);
  };

  if (tutorialActive) {
    const step = tutorialSteps[currentStep];
    const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

    return (
      <Dialog open={true} onOpenChange={() => setTutorialActive(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{step.title}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTutorialActive(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="mt-2" />
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {tutorialSteps.length}
            </p>
          </DialogHeader>
          
          <div className="py-6">
            <p className="text-muted-foreground mb-4">{step.description}</p>
            {step.content}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button onClick={nextStep}>
              {currentStep === tutorialSteps.length - 1 ? 'Complete' : 'Next'}
              {currentStep < tutorialSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help & Documentation
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tutorial" className="flex items-center">
              <Play className="h-4 w-4 mr-2" />
              Tutorial
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center">
              <Keyboard className="h-4 w-4 mr-2" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center">
              <MessageCircleQuestion className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The AI Backing Drawing Generator streamlines the process of creating 
                  construction backing plans from architectural drawings.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Features</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• AI-powered component detection</li>
                      <li>• Automated backing placement</li>
                      <li>• Real-time collaboration</li>
                      <li>• Standards compliance checking</li>
                      <li>• Material quantity takeoffs</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Supported Files</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• PDF floor plans</li>
                      <li>• AutoCAD DWG/DXF files</li>
                      <li>• IFC BIM models</li>
                      <li>• Equipment submittals</li>
                      <li>• Specification documents</li>
                    </ul>
                  </div>
                </div>

                <Button onClick={startTutorialFlow} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Interactive Tutorial
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorialSteps.map((step, index) => (
                <Card key={step.id} className="cursor-pointer hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            
            <Button onClick={startTutorialFlow} className="w-full" size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Full Tutorial
            </Button>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}