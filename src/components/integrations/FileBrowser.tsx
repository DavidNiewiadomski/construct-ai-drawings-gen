import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Folder, 
  File, 
  Search, 
  Filter, 
  RefreshCw, 
  Download,
  ChevronRight,
  Home,
  Calendar,
  HardDrive,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Integration } from './IntegrationHub';
import { IntegrationService } from '@/services/integrationService';

export interface CloudFile {
  id: string;
  name: string;
  path: string;
  size: number;
  modified: Date;
  type: string;
  source: 'procore' | 'acc' | 'box' | 'sharepoint';
  externalId: string;
  selected: boolean;
  isFolder?: boolean;
}

interface FileFilter {
  fileTypes: string[];
  modifiedAfter: string | null;
  searchTerm: string;
  source: string | null;
}

interface CloudFileBrowserProps {
  integrations: Integration[];
}

export function CloudFileBrowser({ integrations }: CloudFileBrowserProps) {
  const [currentIntegration, setCurrentIntegration] = useState<Integration | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting] = useState(false);
  
  const [filter, setFilter] = useState<FileFilter>({
    fileTypes: ['PDF', 'DWG', 'DXF', 'RVT', 'IFC'],
    modifiedAfter: null,
    searchTerm: '',
    source: null
  });

  const { toast } = useToast();

  useEffect(() => {
    if (integrations.length > 0 && !currentIntegration) {
      setCurrentIntegration(integrations[0]);
    }
  }, [integrations, currentIntegration]);

  useEffect(() => {
    if (currentIntegration && currentProject && currentPath) {
      loadFiles();
    }
  }, [currentIntegration, currentProject, currentPath]);

  const loadFiles = async () => {
    if (!currentIntegration || !currentProject) return;
    
    try {
      setLoading(true);
      const result = await IntegrationService.listFiles(
        currentIntegration.id,
        currentProject,
        currentPath
      );
      setFiles(result);
      setSelectedFiles(new Set());
    } catch (error) {
      toast({
        title: "Failed to load files",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    setSelectedFiles(new Set());
  };

  const navigateToFolder = (file: CloudFile) => {
    if (file.isFolder) {
      const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      navigateToPath(newPath);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const allFileIds = files.filter(f => !f.isFolder).map(f => f.id);
    if (selectedFiles.size === allFileIds.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(allFileIds));
    }
  };

  const importSelectedFiles = async () => {
    if (!currentIntegration || selectedFiles.size === 0) return;
    
    try {
      setImporting(true);
      const filesToImport = files.filter(f => selectedFiles.has(f.id));
      
      let imported = 0;
      let failed = 0;
      
      for (const file of filesToImport) {
        try {
          await IntegrationService.importFile(currentIntegration.id, file.externalId, {
            fileType: detectFileType(file.name),
            metadata: {
              source: currentIntegration.name,
              originalPath: file.path,
              lastModified: file.modified
            }
          });
          imported++;
        } catch (error) {
          console.error(`Failed to import ${file.name}:`, error);
          failed++;
        }
      }
      
      setSelectedFiles(new Set());
      
      if (failed === 0) {
        toast({
          title: "Import successful",
          description: `Successfully imported ${imported} files`
        });
      } else {
        toast({
          title: "Import completed with errors",
          description: `Imported ${imported} files, ${failed} failed`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const detectFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      'pdf': 'contract_drawing',
      'dwg': 'contract_drawing',
      'dxf': 'contract_drawing',
      'rvt': 'bim_model',
      'ifc': 'bim_model',
      'doc': 'specification',
      'docx': 'specification',
      'xls': 'specification',
      'xlsx': 'specification'
    };
    return typeMap[ext || ''] || 'specification';
  };

  const getFileIcon = (filename: string, isFolder: boolean = false) => {
    if (isFolder) return <Folder className="h-4 w-4 text-blue-600" />;
    
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'pdf': '📄',
      'dwg': '📐',
      'dxf': '📐',
      'rvt': '🏗️',
      'ifc': '🏗️',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊'
    };
    
    return <span className="text-sm">{iconMap[ext || ''] || '📄'}</span>;
  };

  const filteredFiles = files.filter(file => {
    if (filter.searchTerm && !file.name.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filter.fileTypes.length > 0 && !file.isFolder) {
      const ext = file.name.split('.').pop()?.toUpperCase();
      if (!ext || !filter.fileTypes.includes(ext)) {
        return false;
      }
    }
    
    if (filter.modifiedAfter) {
      const filterDate = new Date(filter.modifiedAfter);
      if (file.modified < filterDate) {
        return false;
      }
    }
    
    return true;
  });

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  if (integrations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Connected Integrations</h3>
          <p className="text-muted-foreground">
            Connect to an integration first to browse and import files
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Integration and Project Selection */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Integration</label>
          <Select
            value={currentIntegration?.id || ''}
            onValueChange={(value) => {
              const integration = integrations.find(i => i.id === value);
              setCurrentIntegration(integration || null);
              setCurrentProject(null);
              setCurrentPath('/');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select integration..." />
            </SelectTrigger>
            <SelectContent>
              {integrations.map(integration => (
                <SelectItem key={integration.id} value={integration.id}>
                  {integration.name} - {integration.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {currentIntegration?.projects && (
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Project</label>
            <Select
              value={currentProject || ''}
              onValueChange={(value) => {
                setCurrentProject(value);
                setCurrentPath('/');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                {currentIntegration.projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {currentIntegration && currentProject && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  File Browser
                </CardTitle>
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <button
                    onClick={() => navigateToPath('/')}
                    className="hover:text-foreground flex items-center gap-1"
                  >
                    <Home className="h-3 w-3" />
                    Root
                  </button>
                  {breadcrumbs.map((segment, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      <button
                        onClick={() => navigateToPath('/' + breadcrumbs.slice(0, index + 1).join('/'))}
                        className="hover:text-foreground"
                      >
                        {segment}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadFiles}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={filter.searchTerm}
                      onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">File Types</label>
                  <div className="flex flex-wrap gap-1">
                    {['PDF', 'DWG', 'DXF', 'RVT', 'IFC', 'DOC', 'XLS'].map(type => (
                      <Badge
                        key={type}
                        variant={filter.fileTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setFilter(prev => ({
                            ...prev,
                            fileTypes: prev.fileTypes.includes(type)
                              ? prev.fileTypes.filter(t => t !== type)
                              : [...prev.fileTypes, type]
                          }));
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Modified After</label>
                  <Input
                    type="date"
                    value={filter.modifiedAfter || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, modifiedAfter: e.target.value || null }))}
                  />
                </div>
              </div>
            )}
            
            {/* File List Header */}
            <div className="flex items-center gap-3 px-3 py-2 border-b text-sm font-medium text-muted-foreground">
              <Checkbox
                checked={selectedFiles.size > 0 && selectedFiles.size === files.filter(f => !f.isFolder).length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="flex-1">Name</span>
              <span className="w-20">Size</span>
              <span className="w-32">Modified</span>
            </div>
            
            {/* File List */}
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading files...
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <File className="h-6 w-6 mx-auto mb-2" />
                  No files found
                </div>
              ) : (
                filteredFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded cursor-pointer"
                    onClick={() => file.isFolder && navigateToFolder(file)}
                  >
                    {!file.isFolder && (
                      <Checkbox
                        checked={selectedFiles.has(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    {file.isFolder && <div className="w-4" />}
                    
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(file.name, file.isFolder)}
                      <span className="truncate font-medium">{file.name}</span>
                      {file.isFolder && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    
                    <span className="w-20 text-sm text-muted-foreground">
                      {file.isFolder ? '' : formatFileSize(file.size)}
                    </span>
                    
                    <span className="w-32 text-sm text-muted-foreground">
                      {formatDate(file.modified)}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            {/* Import Footer */}
            {selectedFiles.size > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.size} files selected
                </span>
                <Button
                  onClick={importSelectedFiles}
                  disabled={importing}
                  className="flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Import Selected Files
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}