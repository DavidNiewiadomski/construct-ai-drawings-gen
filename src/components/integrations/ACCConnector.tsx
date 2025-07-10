import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  Shield, 
  CheckCircle, 
  FolderTree,
  ExternalLink,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ACCHub {
  id: string;
  name: string;
  region: string;
}

interface ACCProject {
  id: string;
  name: string;
  hubId: string;
  status: string;
  rootFolderId: string;
}

interface ACCFolder {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string;
  children?: ACCFolder[];
}

interface ACCConnectorProps {
  onConnect: (data: any) => void;
  onCancel: () => void;
}

export function ACCConnector({ onConnect, onCancel }: ACCConnectorProps) {
  const [step, setStep] = useState<'auth' | 'hubs' | 'projects' | 'folders' | 'complete'>('auth');
  const [authToken, setAuthToken] = useState('');
  const [hubs, setHubs] = useState<ACCHub[]>([]);
  const [selectedHub, setSelectedHub] = useState<string>('');
  const [projects, setProjects] = useState<ACCProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [folders, setFolders] = useState<ACCFolder[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();

  const authenticateACC = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would redirect to Autodesk OAuth
      const authUrl = `https://developer.api.autodesk.com/authentication/v1/authorize?` +
        `response_type=code&` +
        `client_id=demo_client_id&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/integrations/acc/callback')}&` +
        `scope=data:read%20data:write%20account:read`;
      
      // For demo purposes, simulate successful auth
      setTimeout(() => {
        setAuthToken('demo_access_token');
        setStep('hubs');
        loadHubs();
      }, 2000);
      
    } catch (error) {
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const loadHubs = async () => {
    try {
      setProgress(25);
      
      // Simulate API call to get hubs
      setTimeout(() => {
        setHubs([
          {
            id: 'hub1',
            name: 'Construction Company Hub',
            region: 'US'
          },
          {
            id: 'hub2',
            name: 'Design Team Hub',
            region: 'US'
          }
        ]);
        setProgress(50);
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      setError('Failed to load hubs. Please try again.');
      setLoading(false);
    }
  };

  const loadProjects = async (hubId: string) => {
    try {
      setLoading(true);
      setProgress(50);
      
      // Simulate API call to get projects
      setTimeout(() => {
        setProjects([
          {
            id: 'proj1',
            name: 'Downtown Office Complex',
            hubId: hubId,
            status: 'active',
            rootFolderId: 'folder_root_1'
          },
          {
            id: 'proj2',
            name: 'Residential Development',
            hubId: hubId,
            status: 'active',
            rootFolderId: 'folder_root_2'
          },
          {
            id: 'proj3',
            name: 'Shopping Center Renovation',
            hubId: hubId,
            status: 'archived',
            rootFolderId: 'folder_root_3'
          }
        ]);
        setProgress(75);
        setStep('projects');
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      setError('Failed to load projects. Please try again.');
      setLoading(false);
    }
  };

  const loadProjectFolders = async (projectId: string) => {
    try {
      setLoading(true);
      setProgress(75);
      
      // Simulate API call to get folder structure
      setTimeout(() => {
        setFolders([
          {
            id: 'folder1',
            name: 'Architectural',
            type: 'folder',
            parentId: 'root',
            children: [
              { id: 'folder1_1', name: 'Floor Plans', type: 'folder', parentId: 'folder1' },
              { id: 'folder1_2', name: 'Elevations', type: 'folder', parentId: 'folder1' },
              { id: 'folder1_3', name: 'Sections', type: 'folder', parentId: 'folder1' }
            ]
          },
          {
            id: 'folder2',
            name: 'Structural',
            type: 'folder',
            parentId: 'root',
            children: [
              { id: 'folder2_1', name: 'Foundation Plans', type: 'folder', parentId: 'folder2' },
              { id: 'folder2_2', name: 'Framing Plans', type: 'folder', parentId: 'folder2' }
            ]
          },
          {
            id: 'folder3',
            name: 'MEP',
            type: 'folder',
            parentId: 'root',
            children: [
              { id: 'folder3_1', name: 'Electrical', type: 'folder', parentId: 'folder3' },
              { id: 'folder3_2', name: 'Mechanical', type: 'folder', parentId: 'folder3' },
              { id: 'folder3_3', name: 'Plumbing', type: 'folder', parentId: 'folder3' }
            ]
          },
          {
            id: 'folder4',
            name: 'Submittals',
            type: 'folder',
            parentId: 'root',
            children: [
              { id: 'folder4_1', name: 'Equipment', type: 'folder', parentId: 'folder4' },
              { id: 'folder4_2', name: 'Materials', type: 'folder', parentId: 'folder4' }
            ]
          }
        ]);
        setProgress(100);
        setStep('folders');
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      setError('Failed to load project folders. Please try again.');
      setLoading(false);
    }
  };

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const completeSetup = () => {
    const selectedHubData = hubs.find(h => h.id === selectedHub);
    const selectedProjectData = projects.find(p => p.id === selectedProject);
    
    const connectionData = {
      authToken,
      hub: selectedHubData,
      project: selectedProjectData,
      selectedFolders,
      accountName: selectedHubData?.name || 'Unknown Hub'
    };
    
    onConnect(connectionData);
  };

  const renderFolderTree = (folder: ACCFolder, level: number = 0) => (
    <div key={folder.id} className={`space-y-1 ${level > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
        <input
          type="checkbox"
          checked={selectedFolders.includes(folder.id)}
          onChange={() => toggleFolderSelection(folder.id)}
          className="rounded"
        />
        <FolderTree className="h-4 w-4 text-blue-600" />
        <span className="text-sm">{folder.name}</span>
      </div>
      {folder.children?.map(child => renderFolderTree(child, level + 1))}
    </div>
  );

  return (
    <div className="acc-connector space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cloud className="h-8 w-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold">Connect to Autodesk Construction Cloud</h2>
            <p className="text-muted-foreground">Access your ACC projects and drawings</p>
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
          <span>{Math.round(((['auth', 'hubs', 'projects', 'folders'].indexOf(step) + 1) / 4) * 100)}%</span>
        </div>
        <Progress value={((['auth', 'hubs', 'projects', 'folders'].indexOf(step) + 1) / 4) * 100} />
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
              Authenticate with Autodesk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Sign in to your Autodesk account to access Construction Cloud projects
              </p>
              <Button 
                onClick={authenticateACC} 
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
                    Connect with Autodesk
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hubs Step */}
      {step === 'hubs' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Hub</CardTitle>
            <p className="text-muted-foreground">
              Choose the Autodesk hub containing your projects
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">Loading hubs...</p>
              </div>
            ) : (
              <>
                <Select value={selectedHub} onValueChange={setSelectedHub}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a hub..." />
                  </SelectTrigger>
                  <SelectContent>
                    {hubs.map(hub => (
                      <SelectItem key={hub.id} value={hub.id}>
                        {hub.name} ({hub.region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => loadProjects(selectedHub)}
                  disabled={!selectedHub}
                  className="w-full"
                >
                  Continue
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects Step */}
      {step === 'projects' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
            <p className="text-muted-foreground">
              Choose the project to sync with your account
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">Loading projects...</p>
              </div>
            ) : (
              <>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('hubs')} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={() => loadProjectFolders(selectedProject)}
                    disabled={!selectedProject}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Folders Step */}
      {step === 'folders' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Folders to Sync</CardTitle>
            <p className="text-muted-foreground">
              Choose which folders to import files from
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">Loading folder structure...</p>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto border rounded-lg p-3">
                  {folders.map(folder => renderFolderTree(folder))}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('projects')} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={completeSetup}
                    disabled={selectedFolders.length === 0}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Setup ({selectedFolders.length} folders)
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}