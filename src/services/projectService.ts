import { UploadedFile, BackingPlacement, AppSettings } from '@/types';

export interface ProjectSettings extends AppSettings {
  // Additional project-specific settings
  projectNumber?: string;
  client?: string;
  description?: string;
  scale?: string;
  drawingSet?: string;
  lastViewedFile?: string;
  viewSettings?: {
    zoom: number;
    pan: { x: number; y: number };
    currentPage: number;
  };
  backingStandards?: {
    defaultMaterial: string;
    spacing: {
      horizontal: number;
      vertical: number;
    };
    heightAFF: number;
  };
}

export interface Project {
  id: string;
  name: string;
  files: UploadedFile[];
  backings: BackingPlacement[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
  version: number; // For future compatibility
  metadata?: {
    totalBackings: number;
    lastActivity: string;
    fileCount: number;
    tags?: string[];
  };
}

export class ProjectService {
  private static readonly STORAGE_KEY = 'backing-projects';
  private static readonly VERSION = 1;

  /**
   * Save a project to localStorage
   */
  static async saveProject(project: Omit<Project, 'updatedAt' | 'version'>): Promise<Project> {
    try {
      const updatedProject: Project = {
        ...project,
        updatedAt: new Date(),
        version: this.VERSION,
        metadata: {
          totalBackings: project.backings.length,
          lastActivity: new Date().toISOString(),
          fileCount: project.files.length,
          ...project.metadata
        }
      };

      const projects = await this.listProjects();
      const index = projects.findIndex(p => p.id === project.id);
      
      if (index >= 0) {
        projects[index] = updatedProject;
      } else {
        projects.push(updatedProject);
      }
      
      // Sort by last updated
      projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      
      return updatedProject;
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project. Please check if you have enough storage space.');
    }
  }

  /**
   * Load a project by ID
   */
  static async loadProject(id: string): Promise<Project | null> {
    try {
      const projects = await this.listProjects();
      const project = projects.find(p => p.id === id);
      
      if (project) {
        // Ensure dates are properly converted
        return {
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw new Error('Failed to load project.');
    }
  }

  /**
   * List all projects
   */
  static async listProjects(): Promise<Project[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const projects = JSON.parse(stored) as Project[];
      
      // Convert date strings back to Date objects and validate
      return projects
        .filter(p => p && p.id && p.name) // Basic validation
        .map(project => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          version: project.version || 1
        }))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Failed to list projects:', error);
      return [];
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string): Promise<void> {
    try {
      const projects = await this.listProjects();
      const filtered = projects.filter(p => p.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error('Failed to delete project.');
    }
  }

  /**
   * Create a new project with default settings
   */
  static async createProject(name: string, description?: string): Promise<Project> {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      files: [],
      backings: [],
      settings: this.getDefaultSettings(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: this.VERSION,
      metadata: {
        totalBackings: 0,
        lastActivity: new Date().toISOString(),
        fileCount: 0
      }
    };

    if (description) {
      project.settings.description = description;
    }

    return await this.saveProject(project);
  }

  /**
   * Duplicate a project
   */
  static async duplicateProject(sourceId: string, newName?: string): Promise<Project | null> {
    try {
      const sourceProject = await this.loadProject(sourceId);
      if (!sourceProject) return null;

      const duplicatedProject: Project = {
        ...sourceProject,
        id: crypto.randomUUID(),
        name: newName || `${sourceProject.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Reset file references (they would need to be re-uploaded)
        files: [],
        metadata: {
          ...sourceProject.metadata,
          lastActivity: new Date().toISOString(),
          fileCount: 0
        }
      };

      return await this.saveProject(duplicatedProject);
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      throw new Error('Failed to duplicate project.');
    }
  }

  /**
   * Export project as JSON
   */
  static async exportProject(id: string): Promise<string> {
    try {
      const project = await this.loadProject(id);
      if (!project) throw new Error('Project not found');

      return JSON.stringify(project, null, 2);
    } catch (error) {
      console.error('Failed to export project:', error);
      throw new Error('Failed to export project.');
    }
  }

  /**
   * Import project from JSON
   */
  static async importProject(jsonData: string, newName?: string): Promise<Project> {
    try {
      const projectData = JSON.parse(jsonData) as Project;
      
      // Validate required fields
      if (!projectData.name || !projectData.settings) {
        throw new Error('Invalid project data');
      }

      const importedProject: Project = {
        ...projectData,
        id: crypto.randomUUID(), // Generate new ID
        name: newName || `${projectData.name} (Imported)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: this.VERSION,
        // Reset files as they would need to be re-uploaded
        files: [],
        metadata: {
          ...projectData.metadata,
          lastActivity: new Date().toISOString(),
          fileCount: 0
        }
      };

      return await this.saveProject(importedProject);
    } catch (error) {
      console.error('Failed to import project:', error);
      throw new Error('Failed to import project. Please check the file format.');
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { used: number; available: number; projects: number } {
    try {
      const projects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      const used = new Blob([localStorage.getItem(this.STORAGE_KEY) || '']).size;
      
      // Estimate available storage (5MB typical limit for localStorage)
      const maxStorage = 5 * 1024 * 1024; // 5MB
      
      return {
        used,
        available: Math.max(0, maxStorage - used),
        projects: projects.length
      };
    } catch (error) {
      return { used: 0, available: 0, projects: 0 };
    }
  }

  /**
   * Clean up old or corrupted projects
   */
  static async cleanup(): Promise<{ removed: number; errors: string[] }> {
    try {
      const projects = await this.listProjects();
      const errors: string[] = [];
      let removed = 0;

      const validProjects = projects.filter(project => {
        try {
          // Basic validation
          if (!project.id || !project.name || !project.settings) {
            removed++;
            return false;
          }
          return true;
        } catch (error) {
          errors.push(`Project ${project.id || 'unknown'}: ${error}`);
          removed++;
          return false;
        }
      });

      if (removed > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validProjects));
      }

      return { removed, errors };
    } catch (error) {
      console.error('Failed to cleanup projects:', error);
      return { removed: 0, errors: ['Failed to cleanup projects'] };
    }
  }

  /**
   * Get default project settings
   */
  private static getDefaultSettings(): ProjectSettings {
    return {
      defaultStandards: 'commercial',
      units: 'imperial',
      gridSize: 24,
      snapTolerance: 10,
      autoSave: true,
      theme: 'light',
      scale: '1/4" = 1\'',
      backingStandards: {
        defaultMaterial: '2x6',
        spacing: {
          horizontal: 16,
          vertical: 16
        },
        heightAFF: 42
      },
      viewSettings: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        currentPage: 0
      }
    };
  }
}