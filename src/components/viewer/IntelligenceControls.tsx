import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Settings2, Zap } from 'lucide-react';

interface IntelligenceControlsProps {
  settings: {
    showWalls: boolean;
    showDoorSwings: boolean;
    showConflicts: boolean;
    showMeasurements: boolean;
    showSnapGuides: boolean;
    wallOffset: number;
    snapDistance: number;
    autoDetect: boolean;
  };
  onSettingsChange: (settings: any) => void;
  onDetectWalls: () => void;
  onDetectDoors: () => void;
  onDetectConflicts: () => void;
  onOptimize: () => void;
  isProcessing: boolean;
}

export function IntelligenceControls({
  settings,
  onSettingsChange,
  onDetectWalls,
  onDetectDoors,
  onDetectConflicts,
  onOptimize,
  isProcessing
}: IntelligenceControlsProps) {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Intelligence Controls
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Detection Actions */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Detection
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDetectWalls}
              disabled={isProcessing}
              className="text-xs"
            >
              🏗️ Walls
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDetectDoors}
              disabled={isProcessing}
              className="text-xs"
            >
              🚪 Doors
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDetectConflicts}
              disabled={isProcessing}
              className="text-xs"
            >
              ⚠️ Conflicts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOptimize}
              disabled={isProcessing}
              className="text-xs"
            >
              ✨ Optimize
            </Button>
          </div>
        </div>

        {/* Visual Overlays */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Overlays
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-walls" className="text-sm">
                Wall overlay
              </Label>
              <Switch
                id="show-walls"
                checked={settings.showWalls}
                onCheckedChange={(checked) => updateSetting('showWalls', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-doors" className="text-sm">
                Door swings
              </Label>
              <Switch
                id="show-doors"
                checked={settings.showDoorSwings}
                onCheckedChange={(checked) => updateSetting('showDoorSwings', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-conflicts" className="text-sm">
                Conflict highlighting
              </Label>
              <Switch
                id="show-conflicts"
                checked={settings.showConflicts}
                onCheckedChange={(checked) => updateSetting('showConflicts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-measurements" className="text-sm">
                Distance measurements
              </Label>
              <Switch
                id="show-measurements"
                checked={settings.showMeasurements}
                onCheckedChange={(checked) => updateSetting('showMeasurements', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-snap-guides" className="text-sm">
                Snap guides
              </Label>
              <Switch
                id="show-snap-guides"
                checked={settings.showSnapGuides}
                onCheckedChange={(checked) => updateSetting('showSnapGuides', checked)}
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h4 className="font-medium">Settings</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">
                Wall offset: {settings.wallOffset}"
              </Label>
              <Slider
                value={[settings.wallOffset]}
                onValueChange={([value]) => updateSetting('wallOffset', value)}
                min={0}
                max={12}
                step={0.5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">
                Snap distance: {settings.snapDistance}"
              </Label>
              <Slider
                value={[settings.snapDistance]}
                onValueChange={([value]) => updateSetting('snapDistance', value)}
                min={6}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Auto-detect */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-detect" className="text-sm">
              Auto-detect changes
            </Label>
            <Switch
              id="auto-detect"
              checked={settings.autoDetect}
              onCheckedChange={(checked) => updateSetting('autoDetect', checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Automatically detect conflicts when backings are modified
          </p>
        </div>
      </CardContent>
    </Card>
  );
}