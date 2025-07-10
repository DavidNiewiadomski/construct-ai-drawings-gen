import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  Shield, 
  CheckCircle, 
  FileText, 
  Settings,
  ExternalLink,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProcoreProject {
  id: string;
  name: string;
  company: string;
  active: boolean;
  permissions: string[];
}

interface SyncSettings {
  autoSync: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  folders: string[];
  fileTypes: string[];
}

interface ProcoreConnectorProps {
  onConnect: (data: any) => void;
  onCancel: () => void;
}

export function ProcoreConnector({ onConnect, onCancel }: ProcoreConnectorProps) {
  const [step, setStep] = useState<'auth' | 'permissions' | 'projects' | 'settings' | 'complete'>('auth');
  const [authCode, setAuthCode] = useState('');
  const [company, setCompany] = useState<any>(null);
  const [projects, setProjects] = useState<ProcoreProject[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSync: true,
    syncFrequency: 'daily',
    folders: ['Drawings', 'Submittals', 'Specifications'],
    fileTypes: ['PDF', 'DWG', 'DXF']
  });

  const { toast } = useToast();

  const authenticateProcore = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would redirect to Procore OAuth
      const authUrl = `https://login.procore.com/oauth/authorize?` +
        `client_id=demo_client_id&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/integrations/procore/callback')}`;
      
      // For demo purposes, simulate successful auth
      setTimeout(() => {
        setAuthCode('demo_auth_code');
        setStep('permissions');
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setProgress(25);
      
      // Simulate API call to get company info
      setTimeout(() => {
        setCompany({
          id: '123',
          name: 'Demo Construction Company',
          logo: null
        });
        setProgress(50);
      }, 1000);
      
      // Simulate API call to get projects
      setTimeout(() => {
        setProjects([
          {
            id: '1',
            name: 'Downtown Office Complex',
            company: 'Demo Construction Company',
            active: true,
            permissions: ['documents:read', 'submittals:read']
          },
          {
            id: '2',
            name: 'Residential Tower A',
            company: 'Demo Construction Company',
            active: true,
            permissions: ['documents:read', 'submittals:read', 'drawings:read']
          },
          {
            id: '3',
            name: 'Shopping Center Renovation',
            company: 'Demo Construction Company',
            active: false,
            permissions: ['documents:read']
          }
        ]);
        setProgress(100);
        setStep('projects');
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      setError('Failed to load projects. Please try again.');
      setLoading(false);
    }
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSettingsUpdate = (key: keyof SyncSettings, value: any) => {
    setSyncSettings(prev => ({ ...prev, [key]: value }));
  };

  const completeSetup = () => {
    const connectionData = {
      authCode,
      company,
      selectedProjects,
      syncSettings,
      accountName: company?.name || 'Unknown Company'
    };
    
    onConnect(connectionData);
  };

  const availableFolders = ['Drawings', 'Submittals', 'Specifications', 'RFIs', 'Shop Drawings', 'Change Orders'];
  const availableFileTypes = ['PDF', 'DWG', 'DXF', 'RVT', 'IFC', 'DOC', 'XLS'];

  return (
    <div className="procore-connector space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Connect to Procore</h2>
            <p className="text-muted-foreground">Integrate with your Procore projects</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Setup Progress</span>
          <span>{Math.round(((['auth', 'permissions', 'projects', 'settings'].indexOf(step) + 1) / 4) * 100)}%</span>
        </div>
        <Progress value={((['auth', 'permissions', 'projects', 'settings'].indexOf(step) + 1) / 4) * 100} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Authentication Step */}
      {step === 'auth' && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Authenticate with Procore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Sign in to your Procore account to access your projects and documents
              </p>
              <Button 
                onClick={authenticateProcore} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Connect with Procore
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Step */}
      {step === 'permissions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Required Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We need access to the following Procore modules:
            </p>
            <div className="space-y-3">
              {[
                { name: 'Documents', description: 'View project drawings and specifications', icon: FileText },
                { name: 'Submittals', description: 'Access equipment submittals and product data', icon: FileText },
                { name: 'Project Information', description: 'Read basic project details and structure', icon: Building }
              ].map((permission, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">{permission.name}</div>
                    <div className="text-sm text-muted-foreground">{permission.description}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {loading ? (
              <div className="text-center">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">Loading your Procore data...</p>
              </div>
            ) : (
              <Button onClick={loadProjects} className="w-full">
                Grant Permissions & Continue
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects Step */}
      {step === 'projects' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Projects</CardTitle>
            <p className="text-muted-foreground">
              Choose which Procore projects to sync with your account
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {company && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {projects.length} projects available
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {projects.map(project => (
                <div key={project.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={() => handleProjectToggle(project.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{project.name}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.active ? 'default' : 'secondary'}>
                        {project.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {project.permissions.length} permissions
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('permissions')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep('settings')} 
                disabled={selectedProjects.length === 0}
                className="flex-1"
              >
                Continue ({selectedProjects.length} selected)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Step */}
      {step === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sync Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Automatic Sync</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically import new files when they're added to Procore
                  </div>
                </div>
                <Checkbox
                  checked={syncSettings.autoSync}
                  onCheckedChange={(checked) => handleSettingsUpdate('autoSync', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Sync Frequency</label>
                <Select
                  value={syncSettings.syncFrequency}
                  onValueChange={(value) => handleSettingsUpdate('syncFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <label className="font-medium">Folders to Sync</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFolders.map(folder => (
                    <div key={folder} className="flex items-center gap-2">
                      <Checkbox
                        checked={syncSettings.folders.includes(folder)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSettingsUpdate('folders', [...syncSettings.folders, folder]);
                          } else {
                            handleSettingsUpdate('folders', syncSettings.folders.filter(f => f !== folder));
                          }
                        }}
                      />
                      <label className="text-sm">{folder}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="font-medium">File Types</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableFileTypes.map(type => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        checked={syncSettings.fileTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleSettingsUpdate('fileTypes', [...syncSettings.fileTypes, type]);
                          } else {
                            handleSettingsUpdate('fileTypes', syncSettings.fileTypes.filter(t => t !== type));
                          }
                        }}
                      />
                      <label className="text-sm">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('projects')} className="flex-1">
                Back
              </Button>
              <Button onClick={completeSetup} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}