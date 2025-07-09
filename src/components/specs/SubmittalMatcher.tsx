import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, X, Upload, FileText, Calculator } from 'lucide-react';
import { UploadedFile, ExtractedRequirement } from '@/types';

interface SubmittalMatch {
  id: string;
  submittalFile: UploadedFile;
  extractedData: {
    productName: string;
    weight: number;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    mountingType: string;
  };
  matchedRequirements: ExtractedRequirement[];
  suggestedBacking: {
    type: string;
    dimensions: string;
    reasoning: string;
  };
  confidence: number;
  issues: string[];
}

interface SubmittalMatcherProps {
  submittalFiles: UploadedFile[];
  requirements: ExtractedRequirement[];
  onBackingGenerated: (backing: any) => void;
}

export function SubmittalMatcher({ submittalFiles, requirements, onBackingGenerated }: SubmittalMatcherProps) {
  const [matches, setMatches] = useState<SubmittalMatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  useEffect(() => {
    if (submittalFiles.length > 0) {
      processSubmittals();
    }
  }, [submittalFiles, requirements]);

  const processSubmittals = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Mock processing - in real implementation, this would call AI service
    const newMatches: SubmittalMatch[] = [];
    
    for (let i = 0; i < submittalFiles.length; i++) {
      const file = submittalFiles[i];
      setProcessingProgress((i / submittalFiles.length) * 100);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const match = generateMockMatch(file, requirements);
      newMatches.push(match);
    }

    setMatches(newMatches);
    setIsProcessing(false);
    setProcessingProgress(100);
  };

  const generateMockMatch = (file: UploadedFile, reqs: ExtractedRequirement[]): SubmittalMatch => {
    const mockData = {
      'tv-mount-submittal.pdf': {
        productName: 'Ultra Mount Pro TV Wall Mount',
        weight: 15,
        dimensions: { width: 24, height: 16, depth: 3 },
        mountingType: 'wall-mounted',
        maxLoadWeight: 75,
      },
      'grab-bar-submittal.pdf': {
        productName: 'ADA Compliant Grab Bar 36"',
        weight: 8,
        dimensions: { width: 36, height: 1.5, depth: 3 },
        mountingType: 'wall-mounted',
        maxLoadWeight: 300,
      },
    };

    const data = mockData[file.filename as keyof typeof mockData] || {
      productName: 'Unknown Product',
      weight: 25,
      dimensions: { width: 20, height: 12, depth: 4 },
      mountingType: 'wall-mounted',
      maxLoadWeight: 50,
    };

    const matchedReqs = reqs.filter(req => 
      file.filename.includes('tv') && req.parsedValues?.componentType === 'tv' ||
      file.filename.includes('grab') && req.parsedValues?.componentType === 'grab_bar'
    );

    const suggestedBacking = determineBacking(data);
    const issues = findIssues(data, matchedReqs);

    return {
      id: file.id,
      submittalFile: file,
      extractedData: data,
      matchedRequirements: matchedReqs,
      suggestedBacking,
      confidence: issues.length === 0 ? 0.95 : 0.7,
      issues,
    };
  };

  const determineBacking = (data: any) => {
    if (data.maxLoadWeight > 75) {
      return {
        type: '2x8',
        dimensions: '32" x 16"',
        reasoning: 'Heavy load requires 2x8 blocking for adequate support',
      };
    } else if (data.maxLoadWeight > 30) {
      return {
        type: '2x6',
        dimensions: '24" x 12"',
        reasoning: 'Medium load suitable for 2x6 blocking',
      };
    } else {
      return {
        type: '2x4',
        dimensions: '16" x 8"',
        reasoning: 'Light load can use 2x4 blocking',
      };
    }
  };

  const findIssues = (data: any, matchedReqs: ExtractedRequirement[]) => {
    const issues: string[] = [];
    
    if (matchedReqs.length === 0) {
      issues.push('No matching specification requirements found');
    }
    
    if (data.weight > 100) {
      issues.push('Weight exceeds typical mounting limits - verify structural support');
    }
    
    if (data.dimensions.width > 48) {
      issues.push('Large dimensions may require additional blocking points');
    }
    
    return issues;
  };

  const handleApplyBacking = (match: SubmittalMatch) => {
    const backing = {
      componentType: match.extractedData.productName,
      backingType: match.suggestedBacking.type,
      dimensions: match.suggestedBacking.dimensions,
      reasoning: match.suggestedBacking.reasoning,
      source: `Submittal: ${match.submittalFile.filename}`,
    };
    
    onBackingGenerated(backing);
  };

  if (submittalFiles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Submittal Documents</h3>
        <p className="text-muted-foreground">
          Upload equipment submittals to automatically match with specifications.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm font-medium">Processing submittals...</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {match.submittalFile.filename}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={match.confidence > 0.8 ? "default" : "secondary"}>
                    {Math.round(match.confidence * 100)}% Match
                  </Badge>
                  {match.issues.length === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="extracted" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
                  <TabsTrigger value="matches">Spec Matches</TabsTrigger>
                  <TabsTrigger value="backing">Suggested Backing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="extracted" className="space-y-4">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Product Name</TableCell>
                        <TableCell>{match.extractedData.productName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Weight</TableCell>
                        <TableCell>{match.extractedData.weight} lbs</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Dimensions</TableCell>
                        <TableCell>
                          {match.extractedData.dimensions.width}" × {match.extractedData.dimensions.height}" × {match.extractedData.dimensions.depth}"
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Mounting Type</TableCell>
                        <TableCell>{match.extractedData.mountingType}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="matches" className="space-y-4">
                  {match.matchedRequirements.length > 0 ? (
                    <div className="space-y-3">
                      {match.matchedRequirements.map((req) => (
                        <div key={req.id} className="border rounded p-3">
                          <p className="text-sm font-medium">{req.section}</p>
                          <p className="text-sm text-muted-foreground">{req.text}</p>
                          {req.parsedValues && (
                            <div className="flex gap-2 mt-2">
                              {req.parsedValues.backingType && (
                                <Badge variant="outline">
                                  {req.parsedValues.backingType}
                                </Badge>
                              )}
                              {req.parsedValues.heightAFF && (
                                <Badge variant="outline">
                                  {req.parsedValues.heightAFF}" AFF
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No matching specification requirements found.
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="backing" className="space-y-4">
                  <div className="border rounded p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      <span className="font-medium">Recommended Backing</span>
                    </div>
                    
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Type</TableCell>
                          <TableCell>{match.suggestedBacking.type}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dimensions</TableCell>
                          <TableCell>{match.suggestedBacking.dimensions}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Reasoning</TableCell>
                          <TableCell>{match.suggestedBacking.reasoning}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    <Button 
                      onClick={() => handleApplyBacking(match)}
                      className="w-full"
                    >
                      Apply to Project
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              {match.issues.length > 0 && (
                <div className="mt-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Issues Found:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {match.issues.map((issue, index) => (
                            <li key={index} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}