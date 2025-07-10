import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Ruler,
  Grid3X3,
  Save,
  Monitor,
  RotateCcw,
  Check,
  Zap
} from 'lucide-react';

const preferencesSchema = z.object({
  units: z.enum(['imperial', 'metric']),
  gridSize: z.number().min(1).max(48),
  snapTolerance: z.number().min(1).max(20),
  autoSave: z.boolean(),
  autoSaveInterval: z.number().min(1).max(30),
  defaultView: z.enum(['fit', '25', '50', '100', '200']),
  theme: z.enum(['light', 'dark', 'system']),
  showTips: z.boolean(),
  confirmDelete: z.boolean(),
  showGrid: z.boolean(),
  enableSnap: z.boolean(),
  animateTransitions: z.boolean(),
});

type PreferencesData = z.infer<typeof preferencesSchema>;

const defaultPreferences: PreferencesData = {
  units: 'imperial',
  gridSize: 12,
  snapTolerance: 5,
  autoSave: true,
  autoSaveInterval: 5,
  defaultView: 'fit',
  theme: 'dark',
  showTips: true,
  confirmDelete: true,
  showGrid: true,
  enableSnap: true,
  animateTransitions: true,
};

export function Preferences() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const form = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: defaultPreferences,
  });

  const watchedValues = form.watch();

  // Load saved preferences on component mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const saved = localStorage.getItem('app-preferences');
        if (saved) {
          const preferences = JSON.parse(saved);
          form.reset({ ...defaultPreferences, ...preferences });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    loadPreferences();
  }, [form]);

  // Track changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: PreferencesData) => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('app-preferences', JSON.stringify(data));
      
      // Apply theme change immediately
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (data.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      setHasChanges(false);
      toast({
        title: "Preferences Saved",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    form.reset(defaultPreferences);
    setHasChanges(true);
    toast({
      title: "Preferences Reset",
      description: "All preferences have been reset to default values.",
    });
  };

  const getGridSizeLabel = (size: number) => {
    if (watchedValues.units === 'metric') {
      return `${(size * 2.54).toFixed(1)} cm`;
    }
    return `${size}"`;
  };

  const getToleranceLabel = (tolerance: number) => {
    return `${tolerance} pixels`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Preferences</h2>
          <p className="text-muted-foreground">
            Customize your application settings and workflow preferences
          </p>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="animate-fade-in">
            Unsaved changes
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Units & Measurements */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Units & Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement System</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select units" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="imperial">Imperial (feet/inches)</SelectItem>
                        <SelectItem value="metric">Metric (meters/centimeters)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose between imperial and metric units for measurements and dimensions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Drawing Settings */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Drawing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gridSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grid Size</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min={1}
                            max={48}
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            className="flex-1"
                          />
                          <Badge variant="outline">
                            {getGridSizeLabel(field.value)}
                          </Badge>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Spacing between grid lines (1-48 inches)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="snapTolerance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Snap Tolerance</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            className="flex-1"
                          />
                          <Badge variant="outline">
                            {getToleranceLabel(field.value)}
                          </Badge>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Distance for automatic snapping (1-20 pixels)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="defaultView"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default View</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Select default view" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fit">Fit to Screen</SelectItem>
                        <SelectItem value="25">25%</SelectItem>
                        <SelectItem value="50">50%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="200">200%</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default zoom level when opening drawings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="showGrid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Show Grid</FormLabel>
                        <FormDescription className="text-sm">
                          Display grid lines in the drawing area
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableSnap"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Snap</FormLabel>
                        <FormDescription className="text-sm">
                          Automatically snap to grid and objects
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Auto-Save Settings */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Auto-Save Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="autoSave"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Auto-Save</FormLabel>
                      <FormDescription>
                        Automatically save your work at regular intervals
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchedValues.autoSave && (
                <FormField
                  control={form.control}
                  name="autoSaveInterval"
                  render={({ field }) => (
                    <FormItem className="animate-fade-in">
                      <FormLabel>Save Interval</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Save every</span>
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">minutes</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How often to automatically save (1-30 minutes)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Interface Settings */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Interface Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred color theme
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="showTips"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Show Tips</FormLabel>
                        <FormDescription className="text-sm">
                          Display helpful tips and hints
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmDelete"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Confirm Deletions</FormLabel>
                        <FormDescription className="text-sm">
                          Ask for confirmation before deleting
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animateTransitions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Smooth Animations</FormLabel>
                        <FormDescription className="text-sm">
                          Enable smooth UI transitions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="hover-scale"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !hasChanges}
              className="hover-scale"
            >
              {isLoading ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}