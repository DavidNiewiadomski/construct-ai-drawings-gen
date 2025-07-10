import { UploadedFile } from '@/types';
import { CloudFile } from '@/components/integrations/FileBrowser';

interface TokenInfo {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

interface ConnectionResult {
  accountName: string;
  projects: any[];
}

interface SyncResult {
  filesImported: number;
  duration: number;
  errors: any[];
}

interface ImportOptions {
  fileType: string;
  metadata: {
    source: string;
    originalPath: string;
    lastModified: Date;
  };
}

export class IntegrationService {
  private static tokens: Map<string, TokenInfo> = new Map();
  private static connectedIntegrations: Map<string, any> = new Map();

  // Main integration methods
  static async connectIntegration(integrationId: string, connectionData: any): Promise<ConnectionResult> {
    switch (integrationId) {
      case 'procore':
        return this.connectProcore(connectionData);
      case 'acc':
        return this.connectACC(connectionData);
      default:
        throw new Error(`Unsupported integration: ${integrationId}`);
    }
  }

  static async disconnectIntegration(integrationId: string): Promise<void> {
    this.tokens.delete(integrationId);
    this.connectedIntegrations.delete(integrationId);
    
    // Remove from localStorage
    const stored = localStorage.getItem('connectedIntegrations');
    if (stored) {
      const integrations = JSON.parse(stored);
      delete integrations[integrationId];
      localStorage.setItem('connectedIntegrations', JSON.stringify(integrations));
    }
  }

  static async getConnectedIntegrations(): Promise<any[]> {
    const stored = localStorage.getItem('connectedIntegrations');
    if (!stored) return [];
    
    const integrations = JSON.parse(stored);
    return Object.values(integrations);
  }

  static async syncIntegration(integrationId: string): Promise<SyncResult> {
    const startTime = Date.now();
    let filesImported = 0;
    let errors: any[] = [];
    
    try {
      switch (integrationId) {
        case 'procore':
          const procoreResult = await this.syncProcore();
          filesImported = procoreResult.filesImported;
          errors = procoreResult.errors;
          break;
        case 'acc':
          const accResult = await this.syncACC();
          filesImported = accResult.filesImported;
          errors = accResult.errors;
          break;
        default:
          throw new Error(`Unsupported integration: ${integrationId}`);
      }
      
      return {
        filesImported,
        duration: Date.now() - startTime,
        errors
      };
    } catch (error) {
      return {
        filesImported,
        duration: Date.now() - startTime,
        errors: [...errors, { error: error.message }]
      };
    }
  }

  static async listFiles(integrationId: string, projectId: string, path: string): Promise<CloudFile[]> {
    switch (integrationId) {
      case 'procore':
        return this.getProcoreFiles(projectId, path);
      case 'acc':
        return this.getACCFiles(projectId, path);
      default:
        throw new Error(`Unsupported integration: ${integrationId}`);
    }
  }

  static async importFile(integrationId: string, externalId: string, options: ImportOptions): Promise<UploadedFile> {
    switch (integrationId) {
      case 'procore':
        return this.importProcoreFile(externalId, options);
      case 'acc':
        return this.importACCFile(externalId, options);
      default:
        throw new Error(`Unsupported integration: ${integrationId}`);
    }
  }

  // Procore specific methods
  private static async connectProcore(connectionData: any): Promise<ConnectionResult> {
    // Store connection data
    this.connectedIntegrations.set('procore', connectionData);
    
    // Save to localStorage
    const stored = localStorage.getItem('connectedIntegrations') || '{}';
    const integrations = JSON.parse(stored);
    integrations.procore = {
      id: 'procore',
      name: 'Procore',
      status: 'connected',
      accountName: connectionData.accountName,
      lastSync: new Date(),
      projects: connectionData.selectedProjects || []
    };
    localStorage.setItem('connectedIntegrations', JSON.stringify(integrations));
    
    return {
      accountName: connectionData.accountName,
      projects: connectionData.selectedProjects || []
    };
  }

  private static async syncProcore(): Promise<{ filesImported: number; errors: any[] }> {
    // Demo implementation - in real app, this would call Procore API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          filesImported: Math.floor(Math.random() * 10) + 5,
          errors: []
        });
      }, 2000);
    });
  }

  private static async getProcoreFiles(projectId: string, folder: string): Promise<CloudFile[]> {
    // Demo implementation - generate mock files
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFiles: CloudFile[] = [
          {
            id: 'proc-folder-1',
            name: 'Architectural Drawings',
            path: '/Architectural Drawings',
            size: 0,
            modified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            type: 'folder',
            source: 'procore',
            externalId: 'folder-arch',
            selected: false,
            isFolder: true
          },
          {
            id: 'proc-folder-2',
            name: 'Structural Plans',
            path: '/Structural Plans',
            size: 0,
            modified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            type: 'folder',
            source: 'procore',
            externalId: 'folder-struct',
            selected: false,
            isFolder: true
          },
          {
            id: 'proc-file-1',
            name: 'Floor_Plan_Level_1.pdf',
            path: '/Floor_Plan_Level_1.pdf',
            size: 2847592,
            modified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            type: 'pdf',
            source: 'procore',
            externalId: 'doc-floor-1',
            selected: false,
            isFolder: false
          },
          {
            id: 'proc-file-2',
            name: 'Electrical_Layout.dwg',
            path: '/Electrical_Layout.dwg',
            size: 1234567,
            modified: new Date(Date.now() - 5 * 60 * 60 * 1000),
            type: 'dwg',
            source: 'procore',
            externalId: 'doc-elec-1',
            selected: false,
            isFolder: false
          },
          {
            id: 'proc-file-3',
            name: 'TV_Mount_Submittal.pdf',
            path: '/TV_Mount_Submittal.pdf',
            size: 890123,
            modified: new Date(Date.now() - 2 * 60 * 60 * 1000),
            type: 'pdf',
            source: 'procore',
            externalId: 'doc-submittal-1',
            selected: false,
            isFolder: false
          }
        ];
        
        resolve(mockFiles);
      }, 1000);
    });
  }

  private static async importProcoreFile(externalId: string, options: ImportOptions): Promise<UploadedFile> {
    // Demo implementation - simulate file import
    return new Promise((resolve) => {
      setTimeout(() => {
        const uploadedFile: UploadedFile = {
          id: crypto.randomUUID(),
          filename: `imported_${externalId}.pdf`,
          fileType: options.fileType as any,
          fileUrl: '/placeholder.svg', // Demo URL
          fileSize: Math.floor(Math.random() * 5000000) + 1000000,
          uploadDate: new Date().toISOString(),
          status: 'ready',
          metadata: {
            pageCount: Math.floor(Math.random() * 10) + 1,
            dimensions: { width: 2200, height: 1700 },
            scale: '1/4" = 1\'-0"',
            ...options.metadata
          }
        };
        
        resolve(uploadedFile);
      }, 1500);
    });
  }

  // ACC specific methods
  private static async connectACC(connectionData: any): Promise<ConnectionResult> {
    // Store connection data
    this.connectedIntegrations.set('acc', connectionData);
    
    // Save to localStorage
    const stored = localStorage.getItem('connectedIntegrations') || '{}';
    const integrations = JSON.parse(stored);
    integrations.acc = {
      id: 'acc',
      name: 'Autodesk Construction Cloud',
      status: 'connected',
      accountName: connectionData.accountName,
      lastSync: new Date(),
      projects: connectionData.project ? [connectionData.project] : []
    };
    localStorage.setItem('connectedIntegrations', JSON.stringify(integrations));
    
    return {
      accountName: connectionData.accountName,
      projects: connectionData.project ? [connectionData.project] : []
    };
  }

  private static async syncACC(): Promise<{ filesImported: number; errors: any[] }> {
    // Demo implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          filesImported: Math.floor(Math.random() * 8) + 3,
          errors: []
        });
      }, 2500);
    });
  }

  private static async getACCFiles(projectId: string, folderId: string): Promise<CloudFile[]> {
    // Demo implementation - generate mock ACC files
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockFiles: CloudFile[] = [
          {
            id: 'acc-folder-1',
            name: 'Design Documents',
            path: '/Design Documents',
            size: 0,
            modified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            type: 'folder',
            source: 'acc',
            externalId: 'acc-folder-design',
            selected: false,
            isFolder: true
          },
          {
            id: 'acc-folder-2',
            name: 'Model Files',
            path: '/Model Files',
            size: 0,
            modified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            type: 'folder',
            source: 'acc',
            externalId: 'acc-folder-models',
            selected: false,
            isFolder: true
          },
          {
            id: 'acc-file-1',
            name: 'Building_Model.rvt',
            path: '/Building_Model.rvt',
            size: 45678901,
            modified: new Date(Date.now() - 3 * 60 * 60 * 1000),
            type: 'rvt',
            source: 'acc',
            externalId: 'acc-model-building',
            selected: false,
            isFolder: false
          },
          {
            id: 'acc-file-2',
            name: 'Coordination_Model.ifc',
            path: '/Coordination_Model.ifc',
            size: 23456789,
            modified: new Date(Date.now() - 6 * 60 * 60 * 1000),
            type: 'ifc',
            source: 'acc',
            externalId: 'acc-coord-model',
            selected: false,
            isFolder: false
          },
          {
            id: 'acc-file-3',
            name: 'Site_Plan.pdf',
            path: '/Site_Plan.pdf',
            size: 3456789,
            modified: new Date(Date.now() - 4 * 60 * 60 * 1000),
            type: 'pdf',
            source: 'acc',
            externalId: 'acc-site-plan',
            selected: false,
            isFolder: false
          }
        ];
        
        resolve(mockFiles);
      }, 1200);
    });
  }

  private static async importACCFile(externalId: string, options: ImportOptions): Promise<UploadedFile> {
    // Demo implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const uploadedFile: UploadedFile = {
          id: crypto.randomUUID(),
          filename: `acc_import_${externalId}.pdf`,
          fileType: options.fileType as any,
          fileUrl: '/placeholder.svg', // Demo URL
          fileSize: Math.floor(Math.random() * 10000000) + 2000000,
          uploadDate: new Date().toISOString(),
          status: 'ready',
          metadata: {
            pageCount: Math.floor(Math.random() * 15) + 1,
            dimensions: { width: 2400, height: 1800 },
            scale: '1/8" = 1\'-0"',
            ...options.metadata
          }
        };
        
        resolve(uploadedFile);
      }, 2000);
    });
  }

  // Utility methods
  private static async refreshToken(integrationId: string): Promise<void> {
    const tokenInfo = this.tokens.get(integrationId);
    if (!tokenInfo?.refresh_token) {
      throw new Error(`No refresh token available for ${integrationId}`);
    }
    
    // Implementation would depend on specific OAuth flow
    // This is a placeholder for the refresh logic
  }

  static async setupWebhooks(integrationId: string, projectId: string, events: string[]): Promise<void> {
    // Demo implementation - in real app would set up webhooks with the external service
    console.log(`Setting up webhooks for ${integrationId} project ${projectId} with events:`, events);
  }
}