import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Compass, 
  Ruler, 
  MapPin, 
  FileText, 
  GitBranch,
  Plus,
  X,
  RotateCw
} from 'lucide-react';
import { ProfessionalDrawingElements } from '@/types';

interface ProfessionalElementsStepProps {
  elements: Partial<ProfessionalDrawingElements>;
  onElementsChange: (elements: Partial<ProfessionalDrawingElements>) => void;
  backings?: any[];
}

export function ProfessionalElementsStep({ 
  elements, 
  onElementsChange,
  backings = []
}: ProfessionalElementsStepProps) {
  
  const updateElement = <K extends keyof ProfessionalDrawingElements>(
    key: K, 
    updates: Partial<ProfessionalDrawingElements[K]>
  ) => {
    onElementsChange({
      ...elements,
      [key]: {
        ...elements[key],
        ...updates
      }
    });
  };

  const getBackingTypes = () => {
    const types = new Map();
    backings.forEach(backing => {
      const existing = types.get(backing.type) || { count: 0, color: '#8b5cf6' };
      types.set(backing.type, { 
        ...existing, 
        count: existing.count + 1,
        description: getBackingDescription(backing.type)
      });
    });
    return Array.from(types.entries()).map(([type, data]) => ({
      type,
      color: getBackingColor(type),
      description: data.description,
      count: data.count
    }));
  };

  const getBackingDescription = (type: string) => {
    const descriptions = {
      '2x4': 'Standard framing lumber',
      '2x6': 'Standard framing lumber',
      '2x8': 'Standard framing lumber',
      '2x10': 'Standard framing lumber',
      '3/4_plywood': '3/4" plywood backing',
      'steel_plate': 'Steel reinforcement plate',
      'blocking': 'Miscellaneous blocking'
    };
    return descriptions[type as keyof typeof descriptions] || 'Custom backing';
  };

  const getBackingColor = (type: string) => {
    const colors = {
      '2x4': '#8b5cf6',
      '2x6': '#3b82f6',
      '2x8': '#10b981',
      '2x10': '#f59e0b',
      '3/4_plywood': '#ef4444',
      'steel_plate': '#6b7280',
      'blocking': '#f97316'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const addNote = () => {
    const currentNotes = elements.generalNotes?.notes || [];
    updateElement('generalNotes', {
      notes: [...currentNotes, 'New general note']
    });
  };

  const updateNote = (index: number, value: string) => {
    const currentNotes = elements.generalNotes?.notes || [];
    const newNotes = [...currentNotes];
    newNotes[index] = value;
    updateElement('generalNotes', { notes: newNotes });
  };

  const removeNote = (index: number) => {
    const currentNotes = elements.generalNotes?.notes || [];
    updateElement('generalNotes', {
      notes: currentNotes.filter((_, i) => i !== index)
    });
  };

  const addRevision = () => {
    const currentRevisions = elements.revisionTable?.revisions || [];
    updateElement('revisionTable', {
      revisions: [...currentRevisions, {
        number: String.fromCharCode(65 + currentRevisions.length), // A, B, C...
        date: new Date().toLocaleDateString(),
        description: 'Initial release',
        by: ''
      }]
    });
  };

  const updateRevision = (index: number, field: string, value: string) => {
    const currentRevisions = elements.revisionTable?.revisions || [];
    const newRevisions = [...currentRevisions];
    newRevisions[index] = { ...newRevisions[index], [field]: value };
    updateElement('revisionTable', { revisions: newRevisions });
  };

  const removeRevision = (index: number) => {
    const currentRevisions = elements.revisionTable?.revisions || [];
    updateElement('revisionTable', {
      revisions: currentRevisions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Professional Drawing Elements</h3>
        <p className="text-sm text-muted-foreground">
          Add professional elements to make your drawings construction-ready
        </p>
      </div>

      {/* North Arrow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Compass className="w-4 h-4" />
            North Arrow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="north-arrow">Include north arrow</Label>
            <Switch
              id="north-arrow"
              checked={elements.northArrow?.enabled || false}
              onCheckedChange={(checked) => 
                updateElement('northArrow', { 
                  enabled: checked,
                  position: elements.northArrow?.position || { x: 1, y: 1 },
                  rotation: elements.northArrow?.rotation || 0,
                  scale: elements.northArrow?.scale || 1
                })
              }
            />
          </div>
          
          {elements.northArrow?.enabled && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <Label htmlFor="north-rotation">Rotation (degrees)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="north-rotation"
                    type="number"
                    min="-180"
                    max="180"
                    value={elements.northArrow.rotation || 0}
                    onChange={(e) => updateElement('northArrow', { rotation: Number(e.target.value) })}
                  />
                  <RotateCw className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <Label htmlFor="north-scale">Scale</Label>
                <Input
                  id="north-scale"
                  type="number"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={elements.northArrow.scale || 1}
                  onChange={(e) => updateElement('northArrow', { scale: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scale Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="w-4 h-4" />
            Graphic Scale Bar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="scale-bar">Include graphic scale</Label>
            <Switch
              id="scale-bar"
              checked={elements.scaleBar?.enabled || false}
              onCheckedChange={(checked) => 
                updateElement('scaleBar', { 
                  enabled: checked,
                  position: elements.scaleBar?.position || { x: 1, y: 8 },
                  scale: elements.scaleBar?.scale || 48, // 1/4" = 1'
                  units: elements.scaleBar?.units || 'imperial'
                })
              }
            />
          </div>
          
          {elements.scaleBar?.enabled && (
            <div className="pt-2 border-t">
              <Label htmlFor="scale-units">Units</Label>
              <select
                id="scale-units"
                className="w-full mt-1 p-2 border rounded-md"
                value={elements.scaleBar.units || 'imperial'}
                onChange={(e) => updateElement('scaleBar', { 
                  units: e.target.value as 'imperial' | 'metric' 
                })}
              >
                <option value="imperial">Imperial (feet/inches)</option>
                <option value="metric">Metric (meters)</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backing Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4" />
            Backing Legend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="backing-legend">Include backing legend</Label>
            <Switch
              id="backing-legend"
              checked={elements.legend?.enabled || false}
              onCheckedChange={(checked) => 
                updateElement('legend', { 
                  enabled: checked,
                  position: elements.legend?.position || { x: 1, y: 2 },
                  backingTypes: getBackingTypes()
                })
              }
            />
          </div>
          
          {elements.legend?.enabled && (
            <div className="pt-2 border-t">
              <Label>Legend items ({getBackingTypes().length} backing types found)</Label>
              <div className="mt-2 space-y-1">
                {getBackingTypes().map((backing, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 border rounded"
                      style={{ backgroundColor: backing.color }}
                    />
                    <Badge variant="outline">{backing.type}</Badge>
                    <span className="text-muted-foreground">{backing.description}</span>
                    <span className="ml-auto text-xs">({backing.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* General Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            General Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="general-notes">Include general notes</Label>
            <Switch
              id="general-notes"
              checked={elements.generalNotes?.enabled || false}
              onCheckedChange={(checked) => 
                updateElement('generalNotes', { 
                  enabled: checked,
                  position: elements.generalNotes?.position || { x: 1, y: 4 },
                  notes: elements.generalNotes?.notes || [
                    'All backing shall be installed per manufacturer specifications',
                    'Verify all dimensions in field before installation',
                    'Coordinate with other trades for conflicts'
                  ],
                  title: 'GENERAL NOTES'
                })
              }
            />
          </div>
          
          {elements.generalNotes?.enabled && (
            <div className="space-y-3 pt-2 border-t">
              <div>
                <Label htmlFor="notes-title">Title</Label>
                <Input
                  id="notes-title"
                  value={elements.generalNotes.title || 'GENERAL NOTES'}
                  onChange={(e) => updateElement('generalNotes', { title: e.target.value })}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Notes</Label>
                  <Button size="sm" variant="outline" onClick={addNote}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Note
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {(elements.generalNotes.notes || []).map((note, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm font-medium mt-2">{index + 1}.</span>
                      <Textarea
                        value={note}
                        onChange={(e) => updateNote(index, e.target.value)}
                        className="flex-1 min-h-[60px]"
                        placeholder="Enter note text..."
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeNote(index)}
                        className="mt-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revision Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="w-4 h-4" />
            Revision Table
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="revision-table">Include revision table</Label>
            <Switch
              id="revision-table"
              checked={elements.revisionTable?.enabled || false}
              onCheckedChange={(checked) => 
                updateElement('revisionTable', { 
                  enabled: checked,
                  position: elements.revisionTable?.position || { x: 18, y: 1 },
                  revisions: elements.revisionTable?.revisions || []
                })
              }
            />
          </div>
          
          {elements.revisionTable?.enabled && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>Revisions</Label>
                <Button size="sm" variant="outline" onClick={addRevision}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Revision
                </Button>
              </div>
              
              <div className="space-y-3">
                {(elements.revisionTable.revisions || []).map((revision, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                    <div>
                      <Label className="text-xs">Rev</Label>
                      <Input
                        value={revision.number}
                        onChange={(e) => updateRevision(index, 'number', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={revision.date}
                        onChange={(e) => updateRevision(index, 'date', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">By</Label>
                      <Input
                        value={revision.by}
                        onChange={(e) => updateRevision(index, 'by', e.target.value)}
                        className="h-8"
                        placeholder="Initials"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRevision(index)}
                        className="h-8"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="col-span-4">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={revision.description}
                        onChange={(e) => updateRevision(index, 'description', e.target.value)}
                        className="h-8"
                        placeholder="Revision description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}