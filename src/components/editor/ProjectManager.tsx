import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  MoreHorizontal,
  Calendar,
  Package,
  Eye,
  Copy,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { ProjectService, Project } from '@/services/projectService';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProjectManagerProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onProjectLoad?: (project: Project) => void;
  currentProjectId?: string;
  children?: React.ReactNode;
}

interface ProjectThumbnailProps {
  project: Project;
  className?: string;
}

// Simple SVG thumbnail generator for project preview
function ProjectThumbnail({ project, className }: ProjectThumbnailProps) {
  const backings = project.backings.slice(0, 20); // Limit for performance
  
  if (backings.length === 0) {
    return (
      <div className={cn("bg-muted flex items-center justify-center rounded border", className)}>
        <Package className="w-8 h-8 text-muted-foreground/50" />
      </div>
    );
  }

  // Calculate bounds
  const bounds = backings.reduce((acc, backing) => ({
    minX: Math.min(acc.minX, backing.location.x),
    maxX: Math.max(acc.maxX, backing.location.x + backing.dimensions.width),
    minY: Math.min(acc.minY, backing.location.y),
    maxY: Math.max(acc.maxY, backing.location.y + backing.dimensions.height)
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity
  });

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const scale = Math.min(80 / width, 60 / height, 1);

  return (
    <div className={cn("bg-background border rounded overflow-hidden", className)}>
      <svg
        width="80"
        height="60"
        viewBox={`${bounds.minX - 10} ${bounds.minY - 10} ${width + 20} ${height + 20}`}
        className="w-full h-full"
      >
        <rect 
          x={bounds.minX - 10} 
          y={bounds.minY - 10} 
          width={width + 20} 
          height={height + 20} 
          fill="#f8fafc" 
        />
        {backings.map((backing, index) => (
          <rect
            key={index}
            x={backing.location.x}
            y={backing.location.y}
            width={backing.dimensions.width}
            height={backing.dimensions.height}
            fill={getBackingColor(backing.backingType)}
            stroke="#64748b"
            strokeWidth="0.5"
            opacity="0.8"
          />
        ))}
      </svg>
    </div>
  );
}

function getBackingColor(type: string): string {
  const colors: Record<string, string> = {
    '2x4': '#8b5cf6',
    '2x6': '#3b82f6', 
    '2x8': '#10b981',
    '2x10': '#f59e0b',
    '3/4_plywood': '#ef4444',
    'steel_plate': '#6b7280',
    'blocking': '#f97316'
  };
  return colors[type] || '#64748b';
}

export function ProjectManager({ 
  isOpen, 
  onOpenChange, 
  onProjectLoad,
  currentProjectId,
  children 
}: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Load projects on mount and when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectList = await ProjectService.listProjects();
      setProjects(projectList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const project = await ProjectService.createProject(
        newProjectName.trim(),
        newProjectDescription.trim() || undefined
      );
      
      setProjects(prev => [project, ...prev]);
      setShowNewProjectDialog(false);
      setNewProjectName('');
      setNewProjectDescription('');
      
      toast({
        title: "Project Created",
        description: `"${project.name}" has been created`
      });

      // Auto-load the new project
      onProjectLoad?.(project);
      onOpenChange?.(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const project = await ProjectService.loadProject(projectId);
      if (project) {
        onProjectLoad?.(project);
        onOpenChange?.(false);
        toast({
          title: "Project Loaded",
          description: `"${project.name}" has been loaded`
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to load project",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await ProjectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setDeleteConfirm(null);
      
      toast({
        title: "Project Deleted",
        description: "Project has been permanently deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project", 
        variant: "destructive"
      });
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      const originalProject = projects.find(p => p.id === projectId);
      if (!originalProject) return;

      const duplicated = await ProjectService.duplicateProject(projectId);
      if (duplicated) {
        setProjects(prev => [duplicated, ...prev]);
        toast({
          title: "Project Duplicated",
          description: `"${duplicated.name}" has been created`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate project",
        variant: "destructive"
      });
    }
  };

  const handleExportProject = async (projectId: string) => {
    try {
      const projectData = await ProjectService.exportProject(projectId);
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Project Exported",
          description: "Project backup file downloaded"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export project",
        variant: "destructive"
      });
    }
  };

  const storageInfo = ProjectService.getStorageInfo();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline">
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Project Manager
              </span>
              <Button 
                onClick={() => setShowNewProjectDialog(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Projects Found</h3>
                <p className="text-muted-foreground mb-6">Create your first project to get started</p>
                <Button onClick={() => setShowNewProjectDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={cn(
                      "border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow",
                      currentProjectId === project.id && "ring-2 ring-primary"
                    )}
                  >
                    {/* Thumbnail and Title */}
                    <div className="flex gap-3">
                      <ProjectThumbnail project={project} className="flex-shrink-0 w-20 h-15" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate" title={project.name}>
                          {project.name}
                        </h3>
                        {project.settings.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.settings.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        <span>{project.backings.length} backings</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadProject(project.id)}
                        disabled={currentProjectId === project.id}
                      >
                        {currentProjectId === project.id ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Current
                          </>
                        ) : (
                          'Load'
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicateProject(project.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportProject(project.id)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteConfirm(project.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storage Info */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{storageInfo.projects} projects • {(storageInfo.used / 1024).toFixed(1)} KB used</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Upload className="w-3 h-3 mr-1" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowNewProjectDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleNewProject}
              disabled={!newProjectName.trim()}
            >
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
              All project data, including backings and settings, will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && handleDeleteProject(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}