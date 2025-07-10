import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  MoreVertical,
  Edit2,
  Copy,
  Star,
  StarOff,
  Trash2,
  FileText,
  Settings,
  Download,
  Upload
} from 'lucide-react';

export interface TitleBlockConfig {
  projectName: string;
  drawingTitle: string;
  drawingNumber: string;
  date: string;
  drawnBy: string;
  checkedBy: string;
  scale: string;
  logoUrl?: string;
  customFields: Array<{
    id: string;
    label: string;
    value: string;
    x: number;
    y: number;
  }>;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  config: {
    pageSize: string;
    orientation: 'portrait' | 'landscape';
    titleBlock: TitleBlockConfig;
    includeOptions: {
      originalDrawing: boolean;
      dimensions: boolean;
      schedule: boolean;
      legend: boolean;
      notes: boolean;
    };
  };
  isDefault: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

const defaultTemplates: ExportTemplate[] = [
  {
    id: '1',
    name: 'Standard Construction Set',
    description: 'Default template for construction drawings with full title block',
    thumbnail: '/placeholder.svg',
    config: {
      pageSize: 'ARCH D (24" x 36")',
      orientation: 'landscape',
      titleBlock: {
        projectName: 'Project Name',
        drawingTitle: 'Backing Plan',
        drawingNumber: 'A-001',
        date: new Date().toLocaleDateString(),
        drawnBy: 'Designer',
        checkedBy: 'Reviewer',
        scale: '1/4" = 1\'-0"',
        logoUrl: '',
        customFields: []
      },
      includeOptions: {
        originalDrawing: true,
        dimensions: true,
        schedule: true,
        legend: true,
        notes: true
      }
    },
    isDefault: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Simple Layout',
    description: 'Minimal template for quick exports without title block',
    thumbnail: '/placeholder.svg',
    config: {
      pageSize: 'ANSI D (22" x 34")',
      orientation: 'landscape',
      titleBlock: {
        projectName: '',
        drawingTitle: 'Backing Layout',
        drawingNumber: '',
        date: '',
        drawnBy: '',
        checkedBy: '',
        scale: '1/8" = 1\'-0"',
        customFields: []
      },
      includeOptions: {
        originalDrawing: true,
        dimensions: false,
        schedule: false,
        legend: true,
        notes: false
      }
    },
    isDefault: false,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Detailed Submittal',
    description: 'Comprehensive template for submittal packages with material schedule',
    thumbnail: '/placeholder.svg',
    config: {
      pageSize: 'ARCH E (30" x 42")',
      orientation: 'landscape',
      titleBlock: {
        projectName: 'Project Name',
        drawingTitle: 'Backing Details & Schedule',
        drawingNumber: 'S-001',
        date: new Date().toLocaleDateString(),
        drawnBy: 'Engineer',
        checkedBy: 'Principal',
        scale: '1/4" = 1\'-0"',
        logoUrl: '',
        customFields: [
          { id: '1', label: 'Submittal', value: 'REV 01', x: 70, y: 20 },
          { id: '2', label: 'Phase', value: 'CD', x: 70, y: 40 }
        ]
      },
      includeOptions: {
        originalDrawing: true,
        dimensions: true,
        schedule: true,
        legend: true,
        notes: true
      }
    },
    isDefault: false,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '4',
    name: 'Sketch Format',
    description: 'Quick sketch format for preliminary layouts',
    thumbnail: '/placeholder.svg',
    config: {
      pageSize: 'ANSI C (17" x 22")',
      orientation: 'portrait',
      titleBlock: {
        projectName: '',
        drawingTitle: 'Preliminary Backing Layout',
        drawingNumber: 'SK-01',
        date: new Date().toLocaleDateString(),
        drawnBy: '',
        checkedBy: '',
        scale: 'NTS',
        customFields: []
      },
      includeOptions: {
        originalDrawing: true,
        dimensions: false,
        schedule: false,
        legend: false,
        notes: true
      }
    },
    isDefault: false,
    createdAt: new Date('2024-02-15')
  }
];

export function TemplateManager() {
  const [templates, setTemplates] = useState<ExportTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEditTemplate = (templateId: string) => {
    toast({
      title: "Edit Template",
      description: "Template editor will open here.",
    });
    // TODO: Open template editor modal
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const duplicatedTemplate: ExportTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date()
    };

    setTemplates(prev => [...prev, duplicatedTemplate]);
    
    toast({
      title: "Template Duplicated",
      description: `Created copy of "${template.name}".`,
    });
  };

  const handleSetAsDefault = (templateId: string) => {
    setTemplates(prev => prev.map(template => ({
      ...template,
      isDefault: template.id === templateId
    })));

    const templateName = templates.find(t => t.id === templateId)?.name;
    toast({
      title: "Default Template Updated",
      description: `"${templateName}" is now the default template.`,
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    if (template.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the default template. Set another template as default first.",
        variant: "destructive"
      });
      return;
    }

    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: `"${template.name}" has been deleted.`,
    });
  };

  const handleCreateNewTemplate = () => {
    toast({
      title: "Create Template",
      description: "Template creation wizard will open here.",
    });
    // TODO: Open template creation wizard
  };

  const handleExportTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-template.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Template Exported",
      description: `"${template.name}" template has been exported.`,
    });
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTemplate = JSON.parse(e.target?.result as string);
        const newTemplate: ExportTemplate = {
          ...importedTemplate,
          id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isDefault: false,
          createdAt: new Date()
        };

        setTemplates(prev => [...prev, newTemplate]);
        toast({
          title: "Template Imported",
          description: `"${newTemplate.name}" template has been imported.`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid template file. Please upload a valid JSON template.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const getIncludeOptionsSummary = (options: ExportTemplate['config']['includeOptions']) => {
    const enabled = Object.entries(options).filter(([_, value]) => value).length;
    const total = Object.keys(options).length;
    return `${enabled}/${total} options`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Templates
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your drawing export templates and title block configurations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <label>
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportTemplate}
                  className="hidden"
                />
              </label>
            </Button>
            <Button size="sm" onClick={handleCreateNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`template-card transition-all duration-200 hover-scale hover:shadow-md cursor-pointer ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="animate-fade-in">
                      <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportTemplate(template.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!template.isDefault ? (
                        <DropdownMenuItem onClick={() => handleSetAsDefault(template.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled>
                          <StarOff className="h-4 w-4 mr-2" />
                          Already Default
                        </DropdownMenuItem>
                      )}
                      {!template.isDefault && (
                        <>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Template Thumbnail */}
                <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-xs">
                      {template.config.pageSize}
                    </div>
                    <div className="text-xs">
                      {template.config.orientation}
                    </div>
                  </div>
                </div>

                {/* Template Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Page Size:</span>
                    <span className="font-medium">{template.config.pageSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orientation:</span>
                    <span className="font-medium capitalize">{template.config.orientation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Includes:</span>
                    <span className="font-medium">{getIncludeOptionsSummary(template.config.includeOptions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{template.createdAt.toLocaleDateString()}</span>
                  </div>
                  {template.lastUsed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Used:</span>
                      <span className="font-medium">{template.lastUsed.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Include Options Pills */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {Object.entries(template.config.includeOptions)
                    .filter(([_, enabled]) => enabled)
                    .map(([option, _]) => (
                      <Badge key={option} variant="secondary" className="text-xs">
                        {option.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Template Card */}
          <Card 
            className="template-card add-new border-dashed border-2 transition-all duration-200 hover-scale hover:border-primary cursor-pointer"
            onClick={handleCreateNewTemplate}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Create New Template</h3>
              <p className="text-sm text-muted-foreground">
                Start with a blank template or duplicate an existing one
              </p>
            </CardContent>
          </Card>
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first export template to get started
            </p>
            <Button onClick={handleCreateNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}