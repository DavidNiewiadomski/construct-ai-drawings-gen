import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen,
  Zap,
  Settings,
  Target,
  FileCheck
} from 'lucide-react';
import { SpecificationIntegrationService, SpecificationFile, SpecificationRequirement, BackingRule } from '@/services/specificationIntegrationService';
import { RequirementExtractor } from './RequirementExtractor';
import { SmartRulesEngine } from './SmartRulesEngine';

interface SpecificationIntegrationPanelProps {
  projectId: string;
  onRuleApplied?: (rule: BackingRule) => void;
}

export function SpecificationIntegrationPanel({ 
  projectId, 
  onRuleApplied 
}: SpecificationIntegrationPanelProps) {
  const [specifications, setSpecifications] = useState<SpecificationFile[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<SpecificationFile | null>(null);
  const [requirements, setRequirements] = useState<SpecificationRequirement[]>([]);
  const [backingRules, setBackingRules] = useState<BackingRule[]>([]);
  const [rulesSummary, setRulesSummary] = useState({
    total: 0,
    specification: 0,
    manual: 0,
    ai_generated: 0,
    standard: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load project specifications
  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      const [specs, rules, summary] = await Promise.all([
        SpecificationIntegrationService.getProjectSpecifications(projectId),
        SpecificationIntegrationService.getProjectBackingRules(projectId),
        SpecificationIntegrationService.getRulesSummary(projectId)
      ]);

      setSpecifications(specs);
      setBackingRules(rules);
      setRulesSummary(summary);

      if (specs.length > 0 && !selectedSpec) {
        setSelectedSpec(specs[0]);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load project specifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load requirements for selected specification
  useEffect(() => {
    if (selectedSpec) {
      loadSpecRequirements(selectedSpec.id);
    }
  }, [selectedSpec]);

  const loadSpecRequirements = async (fileId: string) => {
    try {
      const reqs = await SpecificationIntegrationService.getFileRequirements(fileId);
      setRequirements(reqs);
    } catch (error) {
      console.error('Error loading requirements:', error);
    }
  };

  const handleApplyRequirement = async (requirement: SpecificationRequirement) => {
    try {
      const rule = await SpecificationIntegrationService.applyRequirement(requirement, projectId);
      
      if (rule) {
        setBackingRules(prev => [...prev, rule]);
        setRequirements(prev => 
          prev.map(req => 
            req.id === requirement.id 
              ? { ...req, applied: true, applied_at: new Date().toISOString() }
              : req
          )
        );
        
        // Update summary
        setRulesSummary(prev => ({
          ...prev,
          total: prev.total + 1,
          specification: prev.specification + 1
        }));

        onRuleApplied?.(rule);
        
        toast({
          title: "Requirement Applied",
          description: `Created backing rule from ${requirement.spec_section}`,
        });
      }
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "Failed to apply the requirement.",
        variant: "destructive",
      });
    }
  };

  const getSourceBadge = (sourceType: string) => {
    const variants = {
      'specification': { variant: 'default' as const, icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
      'manual': { variant: 'secondary' as const, icon: Settings, color: 'bg-gray-100 text-gray-800' },
      'ai_generated': { variant: 'outline' as const, icon: Zap, color: 'bg-purple-100 text-purple-800' },
      'standard': { variant: 'outline' as const, icon: Target, color: 'bg-green-100 text-green-800' }
    };
    
    const config = variants[sourceType as keyof typeof variants] || variants.manual;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`text-xs ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {sourceType.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const appliedRequirements = requirements.filter(req => req.applied);
  const pendingRequirements = requirements.filter(req => !req.applied);

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Specification Integration
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Link specifications to backing requirements and rules
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">{specifications.length}</div>
              <div className="text-xs text-muted-foreground">Specifications</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Rules Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{rulesSummary.total}</div>
              <div className="text-xs text-muted-foreground">Total Rules</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{rulesSummary.specification}</div>
              <div className="text-xs text-muted-foreground">Spec-Driven</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600">{rulesSummary.manual}</div>
              <div className="text-xs text-muted-foreground">Manual</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">{rulesSummary.ai_generated}</div>
              <div className="text-xs text-muted-foreground">AI Generated</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{rulesSummary.standard}</div>
              <div className="text-xs text-muted-foreground">Standards</div>
            </div>
          </div>

          {rulesSummary.total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Rule Sources</span>
                <span>{Math.round((rulesSummary.specification / rulesSummary.total) * 100)}% Spec-Driven</span>
              </div>
              <Progress 
                value={(rulesSummary.specification / rulesSummary.total) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="specifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="rules">Backing Rules</TabsTrigger>
        </TabsList>

        {/* Specifications Tab */}
        <TabsContent value="specifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Specifications ({specifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {specifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No specifications found for this project.</p>
                  <p className="text-sm mt-1">
                    Upload specification files and mark them as specifications to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {specifications.map(spec => (
                    <div 
                      key={spec.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedSpec?.id === spec.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSpec(spec)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{spec.file_name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {spec.spec_sections.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {spec.spec_sections.slice(0, 3).map((section, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {section}
                                  </Badge>
                                ))}
                                {spec.spec_sections.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{spec.spec_sections.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              'No sections identified'
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Requirements:</span>
                            <span className="font-medium">{spec.requirements_count || 0}</span>
                          </div>
                          {spec.applied_count !== undefined && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-muted-foreground">Applied:</span>
                              <span className="font-medium text-green-600">{spec.applied_count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements">
          <div className="space-y-4">
            {selectedSpec && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Requirements from {selectedSpec.file_name}
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Total: {requirements.length}</span>
                    <span>Applied: {appliedRequirements.length}</span>
                    <span>Pending: {pendingRequirements.length}</span>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Requirements Display */}
            <div className="space-y-3">
              {requirements.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No requirements found for this specification.</p>
                    <p className="text-sm mt-1">
                      {selectedSpec ? 'Try processing the file to extract requirements.' : 'Select a specification file to view requirements.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                requirements.map(req => (
                  <Card key={req.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {req.spec_section}
                            </Badge>
                            <Badge variant={req.applied ? "default" : "secondary"} className="text-xs">
                              {req.applied ? "Applied" : "Pending"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(req.confidence * 100)}% confidence
                            </span>
                          </div>
                          
                          <div className="text-sm mb-2">{req.requirement_text}</div>
                          
                          {(req.component_type || req.backing_type) && (
                            <div className="flex items-center gap-2 text-xs">
                              {req.component_type && (
                                <Badge variant="outline">{req.component_type}</Badge>
                              )}
                              {req.backing_type && (
                                <Badge variant="outline">{req.backing_type}</Badge>
                              )}
                              {req.height_aff && (
                                <span>@ {req.height_aff}" AFF</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {!req.applied && (req.component_type && req.backing_type) && (
                            <Button
                              size="sm"
                              onClick={() => handleApplyRequirement(req)}
                            >
                              Apply Rule
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Backing Rules ({backingRules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backingRules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No backing rules defined yet.</p>
                  <p className="text-sm mt-1">
                    Apply requirements from specifications to create rules.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backingRules.map(rule => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{rule.component_type}</span>
                            <Badge variant="outline">{rule.backing_type}</Badge>
                            <span className="text-sm text-muted-foreground">@ {rule.height_aff}" AFF</span>
                          </div>
                          
                          {rule.source_reference && (
                            <div className="text-xs text-muted-foreground mb-1">
                              Reference: {rule.source_reference}
                            </div>
                          )}
                          
                          {rule.notes && (
                            <div className="text-sm text-muted-foreground">
                              {rule.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getSourceBadge(rule.source_type)}
                          <Badge variant="outline" className="text-xs">
                            Priority {rule.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}