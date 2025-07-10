import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Plus,
  Zap,
  FileText,
  Settings,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackingRule {
  id: string;
  componentType: string;
  backingType: string;
  heightAFF: number;
  source: 'specification' | 'manual' | 'ai_generated';
  specReference?: string;
  priority: number;
  conditions?: {
    weightMin?: number;
    weightMax?: number;
    widthMin?: number;
    widthMax?: number;
    custom?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RuleConflict {
  id: string;
  type: 'backing_mismatch' | 'weight_overlap' | 'height_conflict' | 'duplicate_rule';
  rules: BackingRule[];
  message: string;
  severity: 'error' | 'warning' | 'info';
  autoResolvable: boolean;
}

interface ExtractedRequirement {
  id: string;
  specSection: string;
  pageNumber: number;
  text: string;
  parsedData: {
    componentType?: string;
    backingType?: string;
    dimensions?: { width: number; height: number };
    heightAFF?: number;
    weight?: number;
    notes?: string;
  };
  confidence: number;
  applied: boolean;
}

interface SmartRulesEngineProps {
  requirements: ExtractedRequirement[];
  onRulesGenerated?: (rules: BackingRule[]) => void;
  onRuleApplied?: (rule: BackingRule) => void;
  existingRules?: BackingRule[];
}

interface ConflictResolverProps {
  conflict: RuleConflict;
  onResolve: (resolution: 'keep_first' | 'keep_second' | 'merge' | 'manual') => void;
}

interface RuleRowProps {
  rule: BackingRule;
  onEdit: (updates: Partial<BackingRule>) => void;
  onDelete: () => void;
}

const COMPONENT_TYPES = [
  { value: 'tv', label: 'TV/Display' },
  { value: 'fire_extinguisher', label: 'Fire Extinguisher' },
  { value: 'grab_bar', label: 'Grab Bar' },
  { value: 'sink', label: 'Sink' },
  { value: 'cabinet', label: 'Cabinet' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' }
];

const BACKING_TYPES = [
  { value: '2x4', label: '2x4 Lumber' },
  { value: '2x6', label: '2x6 Lumber' },
  { value: '2x8', label: '2x8 Lumber' },
  { value: '2x10', label: '2x10 Lumber' },
  { value: '3/4_plywood', label: '3/4\" Plywood' },
  { value: '1/2_plywood', label: '1/2\" Plywood' },
  { value: 'steel_plate', label: 'Steel Plate' },
  { value: 'blocking', label: 'Blocking' }
];

function ConflictResolver({ conflict, onResolve }: ConflictResolverProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Alert className={cn("mb-4", getSeverityColor(conflict.severity))}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(conflict.severity)}
        <div className="flex-1">
          <AlertTitle className="text-sm font-medium">
            Conflict Detected: {conflict.type.replace('_', ' ').toUpperCase()}
          </AlertTitle>
          <AlertDescription className="text-xs mt-1 mb-3">
            {conflict.message}
          </AlertDescription>
          
          <div className="space-y-2 mb-3">
            {conflict.rules.map((rule, index) => (
              <div key={rule.id} className="text-xs bg-white/80 p-2 rounded border">
                <div className="font-medium">Rule {index + 1}:</div>
                <div className="text-muted-foreground">
                  {rule.componentType} → {rule.backingType} @ {rule.heightAFF}" AFF
                  {rule.specReference && ` (${rule.specReference})`}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => onResolve('keep_first')}>
              Keep First
            </Button>
            <Button size="sm" variant="outline" onClick={() => onResolve('keep_second')}>
              Keep Second
            </Button>
            {conflict.autoResolvable && (
              <Button size="sm" onClick={() => onResolve('merge')}>
                Auto Merge
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => onResolve('manual')}>
              Manual Review
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}

function RuleRow({ rule, onEdit, onDelete }: RuleRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(rule);

  const handleSave = () => {
    onEdit({ ...editData, updatedAt: new Date().toISOString() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(rule);
    setIsEditing(false);
  };

  const getSourceBadge = (source: string) => {
    const variants = {
      'specification': 'default',
      'manual': 'secondary',
      'ai_generated': 'outline'
    } as const;
    
    const labels = {
      'specification': 'Spec',
      'manual': 'Manual',
      'ai_generated': 'AI'
    };
    
    return (
      <Badge variant={variants[source as keyof typeof variants]} className="text-xs">
        {labels[source as keyof typeof labels]}
      </Badge>
    );
  };

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>
          <Select
            value={editData.componentType}
            onValueChange={(value) => setEditData({ ...editData, componentType: value })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPONENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <Input
              placeholder="Min weight"
              type="number"
              value={editData.conditions?.weightMin || ''}
              onChange={(e) => setEditData({
                ...editData,
                conditions: {
                  ...editData.conditions,
                  weightMin: e.target.value ? parseInt(e.target.value) : undefined
                }
              })}
              className="h-8"
            />
            <Input
              placeholder="Max weight"
              type="number"
              value={editData.conditions?.weightMax || ''}
              onChange={(e) => setEditData({
                ...editData,
                conditions: {
                  ...editData.conditions,
                  weightMax: e.target.value ? parseInt(e.target.value) : undefined
                }
              })}
              className="h-8"
            />
          </div>
        </TableCell>
        <TableCell>
          <Select
            value={editData.backingType}
            onValueChange={(value) => setEditData({ ...editData, backingType: value })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BACKING_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Input
            type="number"
            value={editData.heightAFF}
            onChange={(e) => setEditData({ ...editData, heightAFF: parseInt(e.target.value) || 48 })}
            className="h-8 w-20"
          />
        </TableCell>
        <TableCell>
          {getSourceBadge(editData.source)}
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button size="sm" onClick={handleSave}>
              <CheckCircle2 className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <Target className="w-3 h-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {COMPONENT_TYPES.find(t => t.value === rule.componentType)?.label || rule.componentType}
      </TableCell>
      <TableCell>
        {rule.conditions ? (
          <div className="text-sm space-y-1">
            {rule.conditions.weightMin && (
              <div>Weight: {rule.conditions.weightMin}+ lbs</div>
            )}
            {rule.conditions.weightMax && (
              <div>Max: {rule.conditions.weightMax} lbs</div>
            )}
            {rule.conditions.custom && (
              <div className="text-muted-foreground">{rule.conditions.custom}</div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Any</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {BACKING_TYPES.find(t => t.value === rule.backingType)?.label || rule.backingType}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-mono">{rule.heightAFF}"</span>
      </TableCell>
      <TableCell>
        {getSourceBadge(rule.source)}
        {rule.specReference && (
          <div className="text-xs text-muted-foreground mt-1">
            {rule.specReference}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function SmartRulesEngine({ 
  requirements, 
  onRulesGenerated, 
  onRuleApplied,
  existingRules = []
}: SmartRulesEngineProps) {
  const [rules, setRules] = useState<BackingRule[]>(existingRules);
  const [conflicts, setConflicts] = useState<RuleConflict[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateId = useCallback(() => {
    return `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const detectConflicts = useCallback((newRules: BackingRule[]): RuleConflict[] => {
    const conflicts: RuleConflict[] = [];
    const allRules = [...rules, ...newRules];

    // Check for backing mismatches
    for (let i = 0; i < allRules.length; i++) {
      for (let j = i + 1; j < allRules.length; j++) {
        const rule1 = allRules[i];
        const rule2 = allRules[j];

        if (rule1.componentType === rule2.componentType) {
          // Same component type with different backing
          if (rule1.backingType !== rule2.backingType) {
            conflicts.push({
              id: `conflict-${Date.now()}-${i}-${j}`,
              type: 'backing_mismatch',
              rules: [rule1, rule2],
              message: `Different backing types specified for ${rule1.componentType}`,
              severity: 'warning',
              autoResolvable: false
            });
          }

          // Same component with different heights
          if (Math.abs(rule1.heightAFF - rule2.heightAFF) > 6) {
            conflicts.push({
              id: `conflict-height-${Date.now()}-${i}-${j}`,
              type: 'height_conflict',
              rules: [rule1, rule2],
              message: `Significant height difference for ${rule1.componentType} (${rule1.heightAFF}" vs ${rule2.heightAFF}")`,
              severity: 'info',
              autoResolvable: true
            });
          }
        }
      }
    }

    return conflicts;
  }, [rules]);

  const generateRules = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      const newRules: BackingRule[] = [];
      const now = new Date().toISOString();

      // Process applied requirements
      const appliedRequirements = requirements.filter(req => 
        req.applied && req.parsedData.componentType && req.parsedData.backingType
      );

      appliedRequirements.forEach(req => {
        // Check if rule already exists
        const existing = rules.find(r => 
          r.componentType === req.parsedData.componentType &&
          r.backingType === req.parsedData.backingType &&
          Math.abs(r.heightAFF - (req.parsedData.heightAFF || 48)) <= 3
        );

        if (!existing) {
          const rule: BackingRule = {
            id: generateId(),
            componentType: req.parsedData.componentType!,
            backingType: req.parsedData.backingType!,
            heightAFF: req.parsedData.heightAFF || 48,
            source: 'specification',
            specReference: req.specSection,
            priority: 1,
            conditions: req.parsedData.weight ? {
              weightMin: Math.max(0, req.parsedData.weight - 10),
              weightMax: req.parsedData.weight + 20
            } : undefined,
            notes: req.parsedData.notes,
            createdAt: now,
            updatedAt: now
          };

          newRules.push(rule);
        }
      });

      // Detect conflicts
      const newConflicts = detectConflicts(newRules);
      setConflicts(newConflicts);

      if (newRules.length > 0) {
        setRules(prev => [...prev, ...newRules]);
        onRulesGenerated?.(newRules);
        
        toast({
          title: "Rules Generated",
          description: `Generated ${newRules.length} new backing rules from specifications.`,
        });
      } else {
        toast({
          title: "No New Rules",
          description: "No new rules were generated. All requirements may already have corresponding rules.",
        });
      }

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate rules from specifications.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [requirements, rules, generateId, detectConflicts, onRulesGenerated, toast]);

  const resolveConflict = useCallback((conflictId: string, resolution: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    switch (resolution) {
      case 'keep_first':
        setRules(prev => prev.filter(r => r.id !== conflict.rules[1].id));
        break;
      case 'keep_second':
        setRules(prev => prev.filter(r => r.id !== conflict.rules[0].id));
        break;
      case 'merge':
        // Auto-merge logic for compatible conflicts
        if (conflict.type === 'height_conflict') {
          const avgHeight = Math.round(
            conflict.rules.reduce((sum, rule) => sum + rule.heightAFF, 0) / conflict.rules.length
          );
          setRules(prev => prev.map(r => 
            conflict.rules.some(cr => cr.id === r.id) 
              ? { ...r, heightAFF: avgHeight, updatedAt: new Date().toISOString() }
              : r
          ));
        }
        break;
      case 'manual':
        // Keep both rules for manual review
        break;
    }

    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    
    toast({
      title: "Conflict Resolved",
      description: `Applied ${resolution.replace('_', ' ')} resolution.`,
    });
  }, [conflicts, toast]);

  const updateRule = useCallback((ruleId: string, updates: Partial<BackingRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  }, []);

  const deleteRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule Deleted",
      description: "The backing rule has been removed.",
    });
  }, [toast]);

  const addManualRule = useCallback(() => {
    const now = new Date().toISOString();
    const newRule: BackingRule = {
      id: generateId(),
      componentType: 'other',
      backingType: '2x6',
      heightAFF: 48,
      source: 'manual',
      priority: 1,
      createdAt: now,
      updatedAt: now
    };

    setRules(prev => [...prev, newRule]);
  }, [generateId]);

  const appliedRequirementsCount = requirements.filter(req => req.applied).length;
  const rulesFromSpecsCount = rules.filter(rule => rule.source === 'specification').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Smart Rules Engine
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Total Rules: {rules.length}</span>
                <span>From Specs: {rulesFromSpecsCount}</span>
                <span>Applied Requirements: {appliedRequirementsCount}</span>
                {conflicts.length > 0 && (
                  <span className="text-red-600">Conflicts: {conflicts.length}</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={addManualRule}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
              <Button
                onClick={generateRules}
                disabled={isGenerating || appliedRequirementsCount === 0}
                size="sm"
              >
                {isGenerating ? (
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Generate Rules
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Conflicts Detected ({conflicts.length})
          </h3>
          {conflicts.map(conflict => (
            <ConflictResolver
              key={conflict.id}
              conflict={conflict}
              onResolve={(resolution) => resolveConflict(conflict.id, resolution)}
            />
          ))}
        </div>
      )}

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Backing Rules ({rules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No backing rules defined yet.</p>
              <p className="text-sm mt-1">
                Generate rules from applied requirements or add them manually.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Backing</TableHead>
                  <TableHead>Height AFF</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map(rule => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onEdit={(updates) => updateRule(rule.id, updates)}
                    onDelete={() => deleteRule(rule.id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
