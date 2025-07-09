import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Gauge, Eye, Languages, RefreshCw } from 'lucide-react';
import { AISettings } from '@/types';
import { settingsService } from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';

export function AIConfig() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const componentTypes = [
    { value: 'tv', label: 'Television', icon: '📺' },
    { value: 'grab_bar', label: 'Grab Bar', icon: '🦯' },
    { value: 'sink', label: 'Sink', icon: '🚿' },
    { value: 'equipment', label: 'Equipment', icon: '⚙️' },
    { value: 'cabinet', label: 'Cabinet', icon: '🗄️' },
    { value: 'fire_extinguisher', label: 'Fire Extinguisher', icon: '🧯' },
    { value: 'other', label: 'Other', icon: '📦' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getAISettings();
      setSettings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load AI settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      await settingsService.updateAISettings(settings);
      setHasChanges(false);
      toast({
        title: "Success",
        description: "AI settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save AI settings",
        variant: "destructive",
      });
    }
  };

  const handleResetDefaults = async () => {
    try {
      const defaultSettings = {
        confidenceThresholds: {
          tv: 0.8,
          grab_bar: 0.85,
          sink: 0.75,
          equipment: 0.7,
          cabinet: 0.8,
          other: 0.6,
        },
        enabledComponentTypes: ['tv', 'grab_bar', 'sink', 'equipment', 'cabinet'],
        autoProcess: true,
        batchSize: 10,
        qualityVsSpeed: 0.7,
        ocrLanguage: 'en',
        enhancementFilters: true,
      };
      
      setSettings(defaultSettings);
      setHasChanges(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset to defaults",
        variant: "destructive",
      });
    }
  };

  const updateSetting = (key: keyof AISettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const updateThreshold = (componentType: string, value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      confidenceThresholds: {
        ...settings.confidenceThresholds,
        [componentType]: value,
      },
    });
    setHasChanges(true);
  };

  const toggleComponentType = (componentType: string) => {
    if (!settings) return;
    const isEnabled = settings.enabledComponentTypes.includes(componentType);
    const updatedTypes = isEnabled
      ? settings.enabledComponentTypes.filter(type => type !== componentType)
      : [...settings.enabledComponentTypes, componentType];
    
    updateSetting('enabledComponentTypes', updatedTypes);
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Component Detection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure which components to detect and their confidence thresholds
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {componentTypes.map((component) => {
            const isEnabled = settings.enabledComponentTypes.includes(component.value);
            const threshold = settings.confidenceThresholds[component.value] || 0.7;
            
            return (
              <div key={component.value} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{component.icon}</span>
                    <div>
                      <Label className="text-sm font-medium">{component.label}</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => toggleComponentType(component.value)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={isEnabled ? "default" : "secondary"}>
                      {Math.round(threshold * 100)}% confidence
                    </Badge>
                  </div>
                </div>
                
                {isEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Confidence Threshold</span>
                      <span>{Math.round(threshold * 100)}%</span>
                    </div>
                    <Slider
                      value={[threshold]}
                      onValueChange={([value]) => updateThreshold(component.value, value)}
                      min={0.1}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low (10%)</span>
                      <span>High (100%)</span>
                    </div>
                  </div>
                )}
                
                <Separator />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Processing Preferences
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how AI processes your drawings
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-process on Upload</Label>
              <p className="text-xs text-muted-foreground">
                Automatically start AI detection when files are uploaded
              </p>
            </div>
            <Switch
              checked={settings.autoProcess}
              onCheckedChange={(checked) => updateSetting('autoProcess', checked)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Batch Size</Label>
            <p className="text-xs text-muted-foreground">
              Number of files to process simultaneously
            </p>
            <Slider
              value={[settings.batchSize]}
              onValueChange={([value]) => updateSetting('batchSize', value)}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 file</span>
              <span className="font-medium">{settings.batchSize} files</span>
              <span>20 files</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Quality vs Speed</Label>
            <p className="text-xs text-muted-foreground">
              Balance between detection accuracy and processing speed
            </p>
            <Slider
              value={[settings.qualityVsSpeed]}
              onValueChange={([value]) => updateSetting('qualityVsSpeed', value)}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Speed</span>
              <span className="font-medium">
                {settings.qualityVsSpeed < 0.3 ? 'Fast' : 
                 settings.qualityVsSpeed < 0.7 ? 'Balanced' : 'Quality'}
              </span>
              <span>Quality</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OCR Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            OCR Configuration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Optical Character Recognition settings for text extraction
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Primary Language</Label>
            <Select
              value={settings.ocrLanguage}
              onValueChange={(value) => updateSetting('ocrLanguage', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enhancement Filters</Label>
              <p className="text-xs text-muted-foreground">
                Apply image enhancement to improve text recognition
              </p>
            </div>
            <Switch
              checked={settings.enhancementFilters}
              onCheckedChange={(checked) => updateSetting('enhancementFilters', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2.3s</div>
              <p className="text-xs text-muted-foreground">Avg Process Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">Files Processed</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Model Performance</span>
              <span>Excellent</span>
            </div>
            <Progress value={94} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSaveSettings} disabled={!hasChanges}>
          Save Changes
        </Button>
        <Button variant="outline" onClick={handleResetDefaults}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      {hasChanges && (
        <div className="text-sm text-muted-foreground">
          You have unsaved changes. Click "Save Changes" to apply them.
        </div>
      )}
    </div>
  );
}