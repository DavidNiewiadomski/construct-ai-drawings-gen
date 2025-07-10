import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Ruler, FileText, Settings as SettingsIcon, Info } from 'lucide-react';
import { BackingStandardsLibrary } from '@/components/settings/BackingStandardsLibrary';
import { ExportTemplates } from '@/components/settings/ExportTemplates';
import { AIConfig } from '@/components/settings/AIConfig';

const settingsTabs = [
  { id: 'standards', label: 'Backing Standards', icon: '📏' },
  { id: 'templates', label: 'Export Templates', icon: '📄' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'about', label: 'About', icon: 'ℹ️' }
];

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="h-8 w-8" />
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Configure backing standards, export templates, preferences, and system information.
            </p>
          </div>

          <Tabs defaultValue="standards" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              {settingsTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="standards" className="space-y-6">
              <BackingStandardsLibrary />
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Export Templates
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage title block templates for professional drawing exports.
                  </p>
                </CardHeader>
                <CardContent>
                  <ExportTemplates />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure application preferences and behavior settings.
                  </p>
                </CardHeader>
                <CardContent>
                  <AIConfig />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    About Backing Finder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Version Information</h3>
                    <p className="text-sm text-muted-foreground mb-1">Version: 1.0.0</p>
                    <p className="text-sm text-muted-foreground mb-1">Build: 2024.01.15</p>
                    <p className="text-sm text-muted-foreground">Environment: Production</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• AI-powered component detection in construction drawings</li>
                      <li>• Automated backing placement generation</li>
                      <li>• Professional drawing exports (PDF, DWG)</li>
                      <li>• Specification parsing and requirement extraction</li>
                      <li>• Customizable backing standards library</li>
                      <li>• Material schedule generation</li>
                      <li>• Collision detection and resolution</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      For technical support or feature requests, please contact:
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> support@backingfinder.com
                    </p>
                    <p className="text-sm">
                      <strong>Documentation:</strong> docs.backingfinder.com
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">License</h3>
                    <p className="text-sm text-muted-foreground">
                      This software is licensed for commercial use. All rights reserved.
                      See the End User License Agreement for complete terms and conditions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}