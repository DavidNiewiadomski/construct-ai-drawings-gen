import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, Copy, Star, StarOff, Download } from 'lucide-react';
import { TitleBlockConfig } from '@/types';
import { settingsService } from '@/services/settingsService';
import { TitleBlockEditor } from './TitleBlockEditor';
import { useToast } from '@/hooks/use-toast';

export function ExportTemplates() {
  const [templates, setTemplates] = useState<TitleBlockConfig[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TitleBlockConfig | null>(null);
  const [defaultTemplate, setDefaultTemplate] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadDefaultTemplate();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await settingsService.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  const loadDefaultTemplate = async () => {
    try {
      const settings = await settingsService.getSettings();
      // Assuming we add defaultTemplate to AppSettings
      setDefaultTemplate('Commercial Standard'); // Default fallback
    } catch (error) {
      console.error('Failed to load default template setting');
    }
  };

  const handleSaveTemplate = async (template: TitleBlockConfig) => {
    try {
      await settingsService.saveTemplate(template);
      await loadTemplates();
      setIsEditorOpen(false);
      setEditingTemplate(null);
      toast({
        title: "Success",
        description: "Template saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateName: string) => {
    if (templateName === defaultTemplate) {
      toast({
        title: "Error",
        description: "Cannot delete the default template",
        variant: "destructive",
      });
      return;
    }

    try {
      await settingsService.deleteTemplate(templateName);
      await loadTemplates();
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (templateName: string) => {
    try {
      // This would update the app settings with the default template
      setDefaultTemplate(templateName);
      toast({
        title: "Success",
        description: `${templateName} set as default template`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set default template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = (template: TitleBlockConfig) => {
    const duplicated: TitleBlockConfig = {
      ...template,
      template: `${template.template} (Copy)`,
    };
    setEditingTemplate(duplicated);
    setIsEditorOpen(true);
  };

  const handleExportTemplate = (template: TitleBlockConfig) => {
    const data = JSON.stringify(template, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.template.toLowerCase().replace(/\s+/g, '-')}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Title Block Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage templates for professional drawing exports
          </p>
        </div>
        
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate?.template ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            <TitleBlockEditor
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => {
                setIsEditorOpen(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.template} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {template.template}
                  {template.template === defaultTemplate && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </CardTitle>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingTemplate(template);
                        setIsEditorOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportTemplate(template)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    {template.template !== defaultTemplate ? (
                      <DropdownMenuItem onClick={() => handleSetDefault(template.template)}>
                        <Star className="h-4 w-4 mr-2" />
                        Set as Default
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem disabled>
                        <StarOff className="h-4 w-4 mr-2" />
                        Is Default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeleteTemplate(template.template)}
                      className="text-destructive"
                      disabled={template.template === defaultTemplate}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  Position: {template.position}
                </Badge>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Fields: {Object.keys(template.fields).length}</div>
                  {template.logoUrl && <div>Logo: Included</div>}
                </div>
              </div>

              {/* Template Preview */}
              <div className="border rounded p-3 bg-muted/30">
                <div className="text-xs space-y-1">
                  <div className="font-medium">Preview:</div>
                  {Object.entries(template.fields).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{value || '[Empty]'}</span>
                    </div>
                  ))}
                  {Object.keys(template.fields).length > 3 && (
                    <div className="text-muted-foreground">
                      +{Object.keys(template.fields).length - 3} more fields
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="text-xs text-muted-foreground">
                Last used: Never {/* This would come from usage tracking */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-3">
            <div className="mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No Templates</h3>
              <p className="text-sm text-muted-foreground">
                Create your first title block template to get started.
              </p>
            </div>
            <Button onClick={() => setIsEditorOpen(true)}>
              Create Template
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export All Templates
            </Button>
            <Button variant="outline" className="justify-start">
              <Copy className="h-4 w-4 mr-2" />
              Import Template
            </Button>
            <Button variant="outline" className="justify-start">
              <Star className="h-4 w-4 mr-2" />
              Browse Community Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}