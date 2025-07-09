import { useState } from 'react';
import { Plus, Edit2, Trash2, Download, Upload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BackingRule } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface BackingRulesPanelProps {
  rules: BackingRule[];
  onRulesChange: (rules: BackingRule[]) => void;
}

const COMPONENT_TYPES = [
  { value: 'tv', label: 'TV Mount' },
  { value: 'fire_extinguisher', label: 'Fire Extinguisher' },
  { value: 'sink', label: 'Sink' },
  { value: 'grab_bar', label: 'Grab Bar' },
  { value: 'cabinet', label: 'Cabinet' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
];

const BACKING_TYPES = [
  '2x4', '2x6', '2x8', '2x10', '3/4_plywood', 'steel_plate', 'blocking'
];

export function BackingRulesPanel({ rules, onRulesChange }: BackingRulesPanelProps) {
  const [editingRule, setEditingRule] = useState<BackingRule | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleSaveRule = (rule: BackingRule) => {
    const existingIndex = rules.findIndex(r => r.id === rule.id);
    let updatedRules;
    
    if (existingIndex >= 0) {
      updatedRules = rules.map((r, i) => i === existingIndex ? rule : r);
    } else {
      updatedRules = [...rules, rule];
    }
    
    onRulesChange(updatedRules);
    setShowDialog(false);
    setEditingRule(null);
    
    toast({
      title: existingIndex >= 0 ? 'Rule updated' : 'Rule added',
      description: 'Backing rule has been saved successfully.',
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = rules.filter(r => r.id !== ruleId);
    onRulesChange(updatedRules);
    
    toast({
      title: 'Rule deleted',
      description: 'Backing rule has been removed.',
    });
  };

  const handleAddRule = () => {
    setEditingRule({
      id: crypto.randomUUID(),
      componentType: 'tv',
      condition: {},
      backing: {
        type: '2x6',
        width: 48,
        height: 24,
        heightAFF: 60,
      },
      notes: '',
    });
    setShowDialog(true);
  };

  const handleEditRule = (rule: BackingRule) => {
    setEditingRule({ ...rule });
    setShowDialog(true);
  };

  const formatCondition = (condition: BackingRule['condition']): string => {
    const parts = [];
    
    if (condition.weightMin !== undefined || condition.weightMax !== undefined) {
      if (condition.weightMin !== undefined && condition.weightMax !== undefined) {
        parts.push(`${condition.weightMin}-${condition.weightMax} lbs`);
      } else if (condition.weightMin !== undefined) {
        parts.push(`≥${condition.weightMin} lbs`);
      } else if (condition.weightMax !== undefined) {
        parts.push(`≤${condition.weightMax} lbs`);
      }
    }
    
    if (condition.sizeMin !== undefined || condition.sizeMax !== undefined) {
      if (condition.sizeMin !== undefined && condition.sizeMax !== undefined) {
        parts.push(`${condition.sizeMin}-${condition.sizeMax}"`);
      } else if (condition.sizeMin !== undefined) {
        parts.push(`≥${condition.sizeMin}"`);
      } else if (condition.sizeMax !== undefined) {
        parts.push(`≤${condition.sizeMax}"`);
      }
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Any';
  };

  const getComponentLabel = (type: string): string => {
    const component = COMPONENT_TYPES.find(c => c.value === type);
    return component?.label || type;
  };

  const formatBackingType = (type: string): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const exportRules = () => {
    const csv = [
      ['Component Type', 'Weight Range', 'Size Range', 'Backing Required', 'Width', 'Height', 'Height AFF', 'Notes'],
      ...rules.map(rule => [
        getComponentLabel(rule.componentType),
        formatCondition({ weightMin: rule.condition.weightMin, weightMax: rule.condition.weightMax }),
        formatCondition({ sizeMin: rule.condition.sizeMin, sizeMax: rule.condition.sizeMax }),
        formatBackingType(rule.backing.type),
        rule.backing.width.toString(),
        rule.backing.height.toString(),
        rule.backing.heightAFF.toString(),
        rule.notes || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backing-rules.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary" />
            Backing Rules
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportRules}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button size="sm" onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component Type</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Backing Required</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Height AFF</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    {getComponentLabel(rule.componentType)}
                  </TableCell>
                  <TableCell>
                    {formatCondition(rule.condition)}
                  </TableCell>
                  <TableCell>
                    {formatBackingType(rule.backing.type)}
                  </TableCell>
                  <TableCell>
                    {rule.backing.width}" × {rule.backing.height}"
                  </TableCell>
                  <TableCell>
                    {rule.backing.heightAFF}"
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {rule.notes}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRule(rule)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {rules.length === 0 && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Rules Defined</h3>
            <p className="text-muted-foreground mb-4">
              Add backing rules to automatically generate placements for detected components.
            </p>
            <Button onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Rule
            </Button>
          </div>
        )}
      </CardContent>

      {/* Rule Editor Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRule?.id ? 'Edit Backing Rule' : 'Add Backing Rule'}
            </DialogTitle>
          </DialogHeader>

          {editingRule && (
            <RuleEditor
              rule={editingRule}
              onSave={handleSaveRule}
              onCancel={() => {
                setShowDialog(false);
                setEditingRule(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface RuleEditorProps {
  rule: BackingRule;
  onSave: (rule: BackingRule) => void;
  onCancel: () => void;
}

function RuleEditor({ rule, onSave, onCancel }: RuleEditorProps) {
  const [localRule, setLocalRule] = useState<BackingRule>({ ...rule });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localRule);
  };

  const updateCondition = (field: string, value: number | undefined) => {
    setLocalRule({
      ...localRule,
      condition: {
        ...localRule.condition,
        [field]: value,
      },
    });
  };

  const updateBacking = (field: string, value: string | number) => {
    setLocalRule({
      ...localRule,
      backing: {
        ...localRule.backing,
        [field]: value,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Component Type</Label>
          <Select
            value={localRule.componentType}
            onValueChange={(value) => setLocalRule({ ...localRule, componentType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPONENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Backing Type</Label>
          <Select
            value={localRule.backing.type}
            onValueChange={(value) => updateBacking('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BACKING_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Conditions (optional)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Min Weight (lbs)</Label>
            <Input
              type="number"
              value={localRule.condition.weightMin || ''}
              onChange={(e) => updateCondition('weightMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0"
            />
          </div>
          <div>
            <Label className="text-xs">Max Weight (lbs)</Label>
            <Input
              type="number"
              value={localRule.condition.weightMax || ''}
              onChange={(e) => updateCondition('weightMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="100"
            />
          </div>
          <div>
            <Label className="text-xs">Min Size (inches)</Label>
            <Input
              type="number"
              value={localRule.condition.sizeMin || ''}
              onChange={(e) => updateCondition('sizeMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="24"
            />
          </div>
          <div>
            <Label className="text-xs">Max Size (inches)</Label>
            <Input
              type="number"
              value={localRule.condition.sizeMax || ''}
              onChange={(e) => updateCondition('sizeMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="60"
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Backing Dimensions</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Width (inches)</Label>
            <Input
              type="number"
              value={localRule.backing.width}
              onChange={(e) => updateBacking('width', parseInt(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <Label className="text-xs">Height (inches)</Label>
            <Input
              type="number"
              value={localRule.backing.height}
              onChange={(e) => updateBacking('height', parseInt(e.target.value) || 0)}
              required
            />
          </div>
          <div>
            <Label className="text-xs">Height Above Floor (inches)</Label>
            <Input
              type="number"
              value={localRule.backing.heightAFF}
              onChange={(e) => updateBacking('heightAFF', parseInt(e.target.value) || 0)}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          value={localRule.notes || ''}
          onChange={(e) => setLocalRule({ ...localRule, notes: e.target.value })}
          placeholder="Additional notes or specifications..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Rule
        </Button>
      </div>
    </form>
  );
}