import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Edit, Play, AlertTriangle } from 'lucide-react';
import { ExtractedRequirement } from '@/types';

interface RequirementsListProps {
  requirements: ExtractedRequirement[];
  isLoading: boolean;
  onRequirementUpdate: (id: string, updates: Partial<ExtractedRequirement>) => void;
  onRequirementApply: (requirement: ExtractedRequirement) => void;
}

export function RequirementsList({ 
  requirements, 
  isLoading, 
  onRequirementUpdate, 
  onRequirementApply 
}: RequirementsListProps) {
  const [editingRequirement, setEditingRequirement] = useState<ExtractedRequirement | null>(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  const groupedRequirements = requirements.reduce((acc, req) => {
    if (!acc[req.section]) {
      acc[req.section] = [];
    }
    acc[req.section].push(req);
    return acc;
  }, {} as Record<string, ExtractedRequirement[]>);

  const handleEdit = (requirement: ExtractedRequirement) => {
    setEditingRequirement({ ...requirement });
  };

  const handleSaveEdit = () => {
    if (!editingRequirement) return;
    onRequirementUpdate(editingRequirement.id, editingRequirement);
    setEditingRequirement(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Parsing specification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Extracted Requirements</h3>
        <Badge variant="secondary">
          {requirements.length} found
        </Badge>
      </div>

      <ScrollArea className="h-[720px]">
        <div className="space-y-4">
          {Object.entries(groupedRequirements).map(([section, sectionRequirements]) => (
            <Card key={section}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {section}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sectionRequirements.map((requirement) => (
                  <div key={requirement.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium">{requirement.text}</p>
                        
                        {requirement.parsedValues && (
                          <div className="flex flex-wrap gap-2">
                            {requirement.parsedValues.componentType && (
                              <Badge variant="outline">
                                Type: {requirement.parsedValues.componentType}
                              </Badge>
                            )}
                            {requirement.parsedValues.backingType && (
                              <Badge variant="outline">
                                Backing: {requirement.parsedValues.backingType}
                              </Badge>
                            )}
                            {requirement.parsedValues.heightAFF && (
                              <Badge variant="outline">
                                Height: {requirement.parsedValues.heightAFF}"
                              </Badge>
                            )}
                            {requirement.parsedValues.dimensions && (
                              <Badge variant="outline">
                                Size: {requirement.parsedValues.dimensions}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Page {requirement.pageNumber}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(requirement.confidence)}`} />
                            <span>{getConfidenceLabel(requirement.confidence)} ({Math.round(requirement.confidence * 100)}%)</span>
                          </div>
                          {requirement.applied && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                <span>Applied</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 ml-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(requirement)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Requirement</DialogTitle>
                            </DialogHeader>
                            {editingRequirement && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="text">Requirement Text</Label>
                                  <Textarea
                                    id="text"
                                    value={editingRequirement.text}
                                    onChange={(e) => setEditingRequirement({
                                      ...editingRequirement,
                                      text: e.target.value
                                    })}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="componentType">Component Type</Label>
                                    <Select
                                      value={editingRequirement.parsedValues?.componentType || ''}
                                      onValueChange={(value) => setEditingRequirement({
                                        ...editingRequirement,
                                        parsedValues: {
                                          ...editingRequirement.parsedValues,
                                          componentType: value
                                        }
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="tv">TV</SelectItem>
                                        <SelectItem value="grab_bar">Grab Bar</SelectItem>
                                        <SelectItem value="equipment">Equipment</SelectItem>
                                        <SelectItem value="sink">Sink</SelectItem>
                                        <SelectItem value="cabinet">Cabinet</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="backingType">Backing Type</Label>
                                    <Select
                                      value={editingRequirement.parsedValues?.backingType || ''}
                                      onValueChange={(value) => setEditingRequirement({
                                        ...editingRequirement,
                                        parsedValues: {
                                          ...editingRequirement.parsedValues,
                                          backingType: value
                                        }
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select backing" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="2x4">2x4</SelectItem>
                                        <SelectItem value="2x6">2x6</SelectItem>
                                        <SelectItem value="2x8">2x8</SelectItem>
                                        <SelectItem value="2x10">2x10</SelectItem>
                                        <SelectItem value="3/4_plywood">3/4" Plywood</SelectItem>
                                        <SelectItem value="steel_plate">Steel Plate</SelectItem>
                                        <SelectItem value="blocking">Blocking</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="heightAFF">Height AFF (inches)</Label>
                                    <Input
                                      id="heightAFF"
                                      type="number"
                                      value={editingRequirement.parsedValues?.heightAFF || ''}
                                      onChange={(e) => setEditingRequirement({
                                        ...editingRequirement,
                                        parsedValues: {
                                          ...editingRequirement.parsedValues,
                                          heightAFF: parseFloat(e.target.value) || undefined
                                        }
                                      })}
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="dimensions">Dimensions</Label>
                                    <Input
                                      id="dimensions"
                                      value={editingRequirement.parsedValues?.dimensions || ''}
                                      onChange={(e) => setEditingRequirement({
                                        ...editingRequirement,
                                        parsedValues: {
                                          ...editingRequirement.parsedValues,
                                          dimensions: e.target.value
                                        }
                                      })}
                                    />
                                  </div>
                                </div>

                                <Button onClick={handleSaveEdit} className="w-full">
                                  Save Changes
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant={requirement.applied ? "secondary" : "default"}
                          size="sm"
                          onClick={() => onRequirementApply(requirement)}
                          disabled={requirement.applied}
                        >
                          {requirement.applied ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {requirement.confidence < 0.7 && (
                      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded p-2">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Low confidence - please review extracted values</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}