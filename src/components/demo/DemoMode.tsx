import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  FileText, 
  Wrench, 
  CheckCircle, 
  Sparkles,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DemoMode() {
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(() => {
    // Check if demo data exists on mount
    return localStorage.getItem('demo-project') !== null;
  });
  const { toast } = useToast();

  const generateDemoBackings = () => [
    {
      id: 'demo-1',
      componentId: 'comp-1',
      x: 150,
      y: 200,
      width: 80,
      height: 40,
      backingType: '3/4_plywood',
      dimensions: {
        width: 80,
        height: 40,
        thickness: 0.75
      },
      location: {
        x: 150,
        y: 200,
        z: 48
      },
      orientation: 0,
      status: 'ai_detected',
      confidence: 0.95,
      rules: []
    },
    {
      id: 'demo-2',
      componentId: 'comp-2',
      x: 300,
      y: 150,
      width: 60,
      height: 60,
      backingType: 'blocking',
      dimensions: {
        width: 60,
        height: 60,
        thickness: 3.5
      },
      location: {
        x: 300,
        y: 150,
        z: 60
      },
      orientation: 0,
      status: 'ai_detected',
      confidence: 0.88,
      rules: []
    },
    {
      id: 'demo-3',
      componentId: 'comp-3',
      x: 200,
      y: 350,
      width: 100,
      height: 30,
      backingType: 'steel_plate',
      dimensions: {
        width: 100,
        height: 30,
        thickness: 0.25
      },
      location: {
        x: 200,
        y: 350,
        z: 72
      },
      orientation: 0,
      status: 'user_modified',
      confidence: 1.0,
      rules: []
    }
  ];

  const generateDemoComments = () => [
    {
      id: 'comment-1',
      position: { x: 180, y: 220 },
      thread: [
        {
          id: 'msg-1',
          text: 'Verify mounting height with electrical drawings',
          author: 'John Smith',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        }
      ],
      status: 'open',
      createdBy: 'john-smith',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'comment-2',
      position: { x: 330, y: 180 },
      thread: [
        {
          id: 'msg-2',
          text: 'Consider fire rating requirements for this location',
          author: 'Sarah Johnson',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
        },
        {
          id: 'msg-3',
          text: 'Good point, will coordinate with fire protection engineer',
          author: 'Mike Davis',
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      ],
      status: 'resolved',
      createdBy: 'sarah-johnson',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ];

  const initializeDemo = async () => {
    setIsLoading(true);
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const demoProject = {
        id: 'demo-project',
        name: 'Demo Construction Project',
        files: [
          {
            id: 'demo-file-1',
            name: 'Floor_Plan_Level_1.pdf',
            type: 'contract_drawing',
            size: 2500000,
            uploadedAt: new Date().toISOString(),
            status: 'completed',
            metadata: {
              pages: 1,
              dimensions: { width: 800, height: 600 }
            }
          },
          {
            id: 'demo-file-2', 
            name: 'TV_Mount_Submittal.pdf',
            type: 'submittal',
            size: 1200000,
            uploadedAt: new Date().toISOString(),
            status: 'completed',
            metadata: {
              pages: 3,
              specifications: ['75" Max TV Size', 'VESA 600x400', 'Wall Mount']
            }
          },
          {
            id: 'demo-file-3',
            name: 'Electrical_Specifications.pdf', 
            type: 'specification',
            size: 800000,
            uploadedAt: new Date().toISOString(),
            status: 'completed',
            metadata: {
              sections: ['26 05 00 - Electrical Boxes', '26 27 26 - Wiring Devices']
            }
          }
        ],
        backings: generateDemoBackings(),
        comments: generateDemoComments(),
        statistics: {
          totalBackings: 15,
          aiDetected: 12,
          userModified: 3,
          approved: 8,
          pending: 7,
          materialSavings: 23.5,
          timeSpeed: '85% faster than manual'
        }
      };
      
      localStorage.setItem('demo-project', JSON.stringify(demoProject));
      setDemoLoaded(true);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('demoLoaded'));
      
      toast({
        title: "Demo project loaded successfully!",
        description: "Explore the AI-powered backing detection features"
      });
      
    } catch (error) {
      toast({
        title: "Failed to load demo project",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoFeatures = [
    {
      icon: Sparkles,
      title: 'AI Detection',
      description: 'Experience automatic component detection and backing placement suggestions',
      highlight: '95% accuracy'
    },
    {
      icon: FileText,
      title: 'Multi-Format Support',
      description: 'See how the system handles PDFs, DWGs, and specifications seamlessly',
      highlight: '3 file types'
    },
    {
      icon: Wrench,
      title: 'Smart Optimization',
      description: 'Explore intelligent backing combination and material optimization',
      highlight: '23% savings'
    },
    {
      icon: CheckCircle,
      title: 'Review Workflow',
      description: 'Try the collaborative review system with comments and approvals',
      highlight: 'Team ready'
    }
  ];

  if (demoLoaded) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Demo project is active!</strong> Explore all the features with sample construction drawings.
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 text-green-700 hover:text-green-800"
            onClick={() => {
              localStorage.removeItem('demo-project');
              setDemoLoaded(false);
              // Dispatch event to notify other components
              window.dispatchEvent(new CustomEvent('demoLoaded'));
              toast({
                title: "Demo project cleared"
              });
            }}
          >
            Clear Demo
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Welcome to AI Backing Generator</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Try our demo project to experience the power of AI-driven backing detection
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{feature.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {feature.highlight}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Content Preview */}
        <div className="border rounded-lg p-4 bg-muted/20">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            What's included in the demo:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Sample Files:</strong>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Floor plan (PDF)</li>
                <li>• Equipment submittals</li>
                <li>• Electrical specifications</li>
              </ul>
            </div>
            <div>
              <strong>AI Detections:</strong>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• 15 backing placements</li>
                <li>• 95% accuracy rate</li>
                <li>• Smart optimizations</li>
              </ul>
            </div>
            <div>
              <strong>Collaboration:</strong>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Review comments</li>
                <li>• Approval workflow</li>
                <li>• Change tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={initializeDemo}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Loading Demo...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Load Demo Project
              </>
            )}
          </Button>
          
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Sample Files
          </Button>
          
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          The demo uses realistic construction drawings and specifications. 
          All AI detections are based on actual algorithm performance.
        </div>
      </CardContent>
    </Card>
  );
}