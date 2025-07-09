import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Upload } from 'lucide-react';
import { specService } from '@/services/specService';
import { ExtractedRequirement, UploadedFile } from '@/types';
import { RequirementsList } from './RequirementsList';
import { SpecHighlighter } from './SpecHighlighter';

interface SpecificationParserProps {
  files: UploadedFile[];
  onRequirementApply: (requirement: ExtractedRequirement) => void;
}

export function SpecificationParser({ files, onRequirementApply }: SpecificationParserProps) {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [requirements, setRequirements] = useState<ExtractedRequirement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const specFiles = files.filter(file => file.fileType === 'specification');

  useEffect(() => {
    if (selectedFile) {
      loadRequirements(selectedFile.id);
    }
  }, [selectedFile]);

  const loadRequirements = async (fileId: string) => {
    setIsLoading(true);
    try {
      const reqs = await specService.parseSpecification(fileId);
      setRequirements(reqs);
    } catch (error) {
      console.error('Failed to load requirements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedFile || !searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await specService.searchSpecification(selectedFile.id, searchQuery);
      // Convert search results to requirements
      const newRequirements = results.map(result => ({
        id: result.id,
        fileId: selectedFile.id,
        section: 'Search Result',
        text: result.text,
        pageNumber: result.pageNumber,
        boundingBox: result.boundingBox,
        confidence: 0.7,
        applied: false,
      }));
      setRequirements(prev => [...prev, ...newRequirements]);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequirementUpdate = async (id: string, updates: Partial<ExtractedRequirement>) => {
    try {
      await specService.updateRequirement(id, updates);
      setRequirements(prev => 
        prev.map(req => req.id === id ? { ...req, ...updates } : req)
      );
    } catch (error) {
      console.error('Failed to update requirement:', error);
    }
  };

  const handleApplyRequirement = async (requirement: ExtractedRequirement) => {
    try {
      await specService.updateRequirement(requirement.id, { applied: true });
      setRequirements(prev => 
        prev.map(req => req.id === requirement.id ? { ...req, applied: true } : req)
      );
      onRequirementApply(requirement);
    } catch (error) {
      console.error('Failed to apply requirement:', error);
    }
  };

  if (specFiles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Specifications Found</h3>
        <p className="text-muted-foreground">
          Upload specification documents to extract backing requirements.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-[800px]">
      {/* Left Panel - PDF Viewer */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="font-medium">Specification Documents</h3>
          </div>

          <Tabs value={selectedFile?.id || ''} onValueChange={(value) => {
            const file = specFiles.find(f => f.id === value);
            setSelectedFile(file || null);
          }}>
            <TabsList className="grid w-full grid-cols-1">
              {specFiles.map(file => (
                <TabsTrigger key={file.id} value={file.id} className="text-sm">
                  {file.filename}
                </TabsTrigger>
              ))}
            </TabsList>

            {specFiles.map(file => (
              <TabsContent key={file.id} value={file.id} className="mt-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for backing requirements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isLoading}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="border rounded-md h-[600px] overflow-hidden">
                    <SpecHighlighter
                      fileUrl={file.fileUrl}
                      requirements={requirements}
                      onRequirementCreate={(requirement) => {
                        setRequirements(prev => [...prev, requirement]);
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>

      {/* Right Panel - Requirements */}
      <Card className="p-4">
        <RequirementsList
          requirements={requirements}
          isLoading={isLoading}
          onRequirementUpdate={handleRequirementUpdate}
          onRequirementApply={handleApplyRequirement}
        />
      </Card>
    </div>
  );
}