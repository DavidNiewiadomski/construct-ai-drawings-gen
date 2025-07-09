import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings2, Database, FileText, Brain, Info } from 'lucide-react';
import { StandardsLibrary } from '@/components/settings/StandardsLibrary';
import { ExportTemplates } from '@/components/settings/ExportTemplates';
import { AIConfig } from '@/components/settings/AIConfig';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings2 className="h-8 w-8" />
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Configure backing standards, export templates, and AI detection settings.
            </p>
          </div>

          <Tabs defaultValue="standards" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="standards" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Backing Standards
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Export Templates
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Configuration
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standards" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Backing Standards Library
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your backing requirements and installation standards.
                  </p>
                </CardHeader>
                <CardContent>
                  <StandardsLibrary />
                </CardContent>
              </Card>
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

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Configuration
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure AI detection settings and processing preferences.
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