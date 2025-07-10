import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Building,
  FileText,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProcoreConnector } from './ProcoreConnector';
import { ACCConnector } from './ACCConnector';
import { CloudFileBrowser } from './FileBrowser';
import { IntegrationService } from '@/services/integrationService';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: Date;
  accountName?: string;
  projects?: IntegrationProject[];
  filesImported?: number;
  error?: string;
}

export interface IntegrationProject {
  id: string;
  name: string;
  externalId: string;
  folders: IntegrationFolder[];
  lastModified: Date;
  fileCount: number;
}

export interface IntegrationFolder {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  subfolders?: IntegrationFolder[];
}

export function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'procore',
      name: 'Procore',
      description: 'Construction project management platform',
      icon: 'Building',
      status: 'disconnected'
    },
    {
      id: 'acc',
      name: 'Autodesk Construction Cloud',
      description: 'Design and construction collaboration platform',
      icon: 'Cloud',
      status: 'disconnected'
    },
    {
      id: 'box',
      name: 'Box',
      description: 'Cloud content management',
      icon: 'FileText',
      status: 'disconnected'
    },
    {
      id: 'sharepoint',
      name: 'SharePoint',
      description: 'Microsoft collaboration platform',
      icon: 'FileText',
      status: 'disconnected'
    }
  ]);
  
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConnector, setShowConnector] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const savedIntegrations = await IntegrationService.getConnectedIntegrations();
      setIntegrations(prev => prev.map(integration => {
        const saved = savedIntegrations.find(s => s.id === integration.id);
        return saved ? { ...integration, ...saved } : integration;
      }));
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const connectIntegration = async (integrationId: string, connectionData: any) => {
    try {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'syncing' as const }
          : integration
      ));

      const result = await IntegrationService.connectIntegration(integrationId, connectionData);
      
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { 
              ...integration, 
              status: 'connected' as const,
              accountName: result.accountName,
              projects: result.projects,
              lastSync: new Date()
            }
          : integration
      ));

      setShowConnector(null);
      toast({
        title: "Integration connected",
        description: `Successfully connected to ${result.accountName}`
      });
    } catch (error) {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'error' as const, error: error.message }
          : integration
      ));
      
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      await IntegrationService.disconnectIntegration(integrationId);
      
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { 
              ...integration, 
              status: 'disconnected' as const,
              accountName: undefined,
              projects: undefined,
              lastSync: undefined,
              error: undefined
            }
          : integration
      ));

      toast({
        title: "Integration disconnected",
        description: "Successfully disconnected from the integration"
      });
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const syncIntegration = async (integrationId: string) => {
    try {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'syncing' as const }
          : integration
      ));

      const result = await IntegrationService.syncIntegration(integrationId);
      
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { 
              ...integration, 
              status: 'connected' as const,
              lastSync: new Date(),
              filesImported: result.filesImported
            }
          : integration
      ));

      toast({
        title: "Sync complete",
        description: `Imported ${result.filesImported} files`
      });
    } catch (error) {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'error' as const, error: error.message }
          : integration
      ));
      
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    const variants = {
      connected: 'default',
      disconnected: 'secondary',
      error: 'destructive',
      syncing: 'default'
    } as const;

    const labels = {
      connected: 'Connected',
      disconnected: 'Not Connected',
      error: 'Error',
      syncing: 'Syncing...'
    };

    return (
      <Badge variant={variants[status]} className="ml-2">
        {labels[status]}
      </Badge>
    );
  };

  const renderConnector = () => {
    if (!showConnector) return null;

    switch (showConnector) {
      case 'procore':
        return (
          <ProcoreConnector
            onConnect={(data) => connectIntegration('procore', data)}
            onCancel={() => setShowConnector(null)}
          />
        );
      case 'acc':
        return (
          <ACCConnector
            onConnect={(data) => connectIntegration('acc', data)}
            onCancel={() => setShowConnector(null)}
          />
        );
      default:
        return null;
    }
  };

  const connectedIntegrations = integrations.filter(i => i.status === 'connected');

  return (
    <div className="integration-hub space-y-6">
      <div className="hub-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Cloud Integrations</h2>
            <p className="text-muted-foreground">
              Connect to your construction management platforms to import drawings directly
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Integrations</TabsTrigger>
          <TabsTrigger value="connected">Connected ({connectedIntegrations.length})</TabsTrigger>
          <TabsTrigger value="browse">Browse Files</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map(integration => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {integration.icon === 'Building' && <Building className="h-6 w-6 text-blue-600" />}
                      {integration.icon === 'Cloud' && <Cloud className="h-6 w-6 text-orange-600" />}
                      {integration.icon === 'FileText' && <FileText className="h-6 w-6 text-green-600" />}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                  {getStatusBadge(integration.status)}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {integration.status === 'connected' && integration.accountName && (
                    <div className="text-sm text-muted-foreground">
                      Connected as: <span className="font-medium">{integration.accountName}</span>
                    </div>
                  )}
                  
                  {integration.lastSync && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Last sync: {integration.lastSync.toLocaleString()}
                    </div>
                  )}
                  
                  {integration.filesImported !== undefined && (
                    <div className="text-sm text-muted-foreground">
                      Files imported: <span className="font-medium">{integration.filesImported}</span>
                    </div>
                  )}
                  
                  {integration.error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {integration.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex gap-2">
                    {integration.status === 'disconnected' ? (
                      <Button
                        onClick={() => setShowConnector(integration.id)}
                        className="flex-1"
                        disabled={!['procore', 'acc'].includes(integration.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => syncIntegration(integration.id)}
                          disabled={integration.status === 'syncing'}
                          className="flex-1"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${integration.status === 'syncing' ? 'animate-spin' : ''}`} />
                          Sync
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => disconnectIntegration(integration.id)}
                          className="flex-1"
                        >
                          Disconnect
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          {connectedIntegrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Connected Integrations</h3>
                <p className="text-muted-foreground mb-4">
                  Connect to your construction management platforms to get started
                </p>
                <Button onClick={() => setShowConnector('procore')}>
                  Connect Your First Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {connectedIntegrations.map(integration => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {integration.icon === 'Building' && <Building className="h-6 w-6 text-blue-600" />}
                        {integration.icon === 'Cloud' && <Cloud className="h-6 w-6 text-orange-600" />}
                        <div>
                          <CardTitle>{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{integration.accountName}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Projects</div>
                        <div className="text-muted-foreground">
                          {integration.projects?.length || 0}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Files Imported</div>
                        <div className="text-muted-foreground">
                          {integration.filesImported || 0}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Last Sync</div>
                        <div className="text-muted-foreground">
                          {integration.lastSync ? integration.lastSync.toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Status</div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {getStatusIcon(integration.status)}
                          <span className="capitalize">{integration.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          {connectedIntegrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Connected Integrations</h3>
                <p className="text-muted-foreground">
                  Connect to an integration first to browse and import files
                </p>
              </CardContent>
            </Card>
          ) : (
            <CloudFileBrowser integrations={connectedIntegrations} />
          )}
        </TabsContent>
      </Tabs>

      {/* Connector Modal */}
      {showConnector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {renderConnector()}
          </div>
        </div>
      )}
    </div>
  );
}