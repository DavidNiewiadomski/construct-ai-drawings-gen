import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WallDetection } from './WallDetection';
import { DoorDetection } from './DoorDetection';
import { ConflictDetection } from './ConflictDetection';
import { PlacementOptimizer } from './PlacementOptimizer';
import { Building2, DoorOpen, AlertTriangle, Zap } from 'lucide-react';
import { BackingPlacement, WallSegment, DetectionResults } from '@/types';

interface SmartDetectionProps {
  drawing?: any;
  backings: BackingPlacement[];
  walls: WallSegment[];
  onUpdate: (results: DetectionResults) => void;
}

export function SmartDetection({ drawing, backings, walls, onUpdate }: SmartDetectionProps) {
  const [detectionMode, setDetectionMode] = useState<'walls' | 'doors' | 'conflicts' | 'optimize'>('walls');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<DetectionResults | null>(null);

  const handleResultsUpdate = (newResults: DetectionResults) => {
    setResults(newResults);
    onUpdate(newResults);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart Detection & Optimization
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={detectionMode} onValueChange={(value) => setDetectionMode(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="walls" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Walls
            </TabsTrigger>
            <TabsTrigger value="doors" className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4" />
              Doors
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Conflicts
            </TabsTrigger>
            <TabsTrigger value="optimize" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Optimize
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="walls" className="space-y-4">
              <WallDetection 
                drawing={drawing}
                onWallsDetected={(walls) => handleResultsUpdate({ walls, type: 'walls' })}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </TabsContent>

            <TabsContent value="doors" className="space-y-4">
              <DoorDetection 
                drawing={drawing}
                walls={walls}
                onDoorsDetected={(doors) => handleResultsUpdate({ doors, type: 'doors' })}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </TabsContent>

            <TabsContent value="conflicts" className="space-y-4">
              <ConflictDetection 
                backings={backings}
                walls={walls}
                onConflictsDetected={(conflicts) => handleResultsUpdate({ conflicts, type: 'conflicts' })}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </TabsContent>

            <TabsContent value="optimize" className="space-y-4">
              <PlacementOptimizer 
                backings={backings}
                walls={walls}
                onOptimizationComplete={(optimizedBackings) => handleResultsUpdate({ optimizedBackings, type: 'optimization' })}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}