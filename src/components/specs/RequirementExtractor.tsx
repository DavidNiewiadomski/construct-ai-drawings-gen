import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText } from 'lucide-react';
import { RequirementCard } from './RequirementCard';

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

interface RequirementExtractorProps {
  specifications?: any[];
  onRequirementApplied?: (requirement: ExtractedRequirement) => void;
  onRequirementsChanged?: (requirements: ExtractedRequirement[]) => void;
}

export function RequirementExtractor({ 
  specifications = [], 
  onRequirementApplied,
  onRequirementsChanged 
}: RequirementExtractorProps) {
  const [requirements, setRequirements] = useState<ExtractedRequirement[]>([]);
  const [selectedText, setSelectedText] = useState('');

  // Parse selected text for backing requirements
  const parseRequirement = useCallback((text: string): ExtractedRequirement['parsedData'] => {
    const parsed: ExtractedRequirement['parsedData'] = {};
    
    // Extract backing type
    const backingPatterns = [
      { pattern: /(\d+x\d+)\s*(lumber|wood|stud)/i, type: (match: RegExpMatchArray) => match[1] },
      { pattern: /(3\/4|1\/2)["']?\s*(plywood|ply)/i, type: (match: RegExpMatchArray) => `${match[1]}_plywood` },
      { pattern: /(\d+)\s*gauge\s*steel/i, type: () => 'steel_plate' },
      { pattern: /blocking/i, type: () => 'blocking' }
    ];

    for (const { pattern, type } of backingPatterns) {
      const match = text.match(pattern);
      if (match) {
        parsed.backingType = type(match);
        break;
      }
    }
    
    // Extract height AFF
    const heightMatch = text.match(/(\d+)["']?\s*(AFF|above\s*finished\s*floor)/i);
    if (heightMatch) {
      parsed.heightAFF = parseInt(heightMatch[1]);
    }
    
    // Extract weight
    const weightMatch = text.match(/(\d+)\s*(lbs?|pounds?)/i);
    if (weightMatch) {
      parsed.weight = parseInt(weightMatch[1]);
    }

    // Extract dimensions
    const dimensionMatch = text.match(/(\d+)["']?\s*x\s*(\d+)["']?/i);
    if (dimensionMatch) {
      parsed.dimensions = {
        width: parseInt(dimensionMatch[1]),
        height: parseInt(dimensionMatch[2])
      };
    }
    
    // Detect component type from context
    const componentTypes = {
      'tv': ['television', 'tv', 'display', 'monitor', 'flat panel'],
      'fire_extinguisher': ['fire extinguisher', 'extinguisher', 'FE'],
      'grab_bar': ['grab bar', 'handrail', 'rail', 'safety bar'],
      'sink': ['sink', 'lavatory', 'basin', 'washbasin'],
      'cabinet': ['cabinet', 'millwork', 'casework', 'cabinetry'],
      'equipment': ['equipment', 'mechanical', 'electrical', 'device']
    };
    
    for (const [type, keywords] of Object.entries(componentTypes)) {
      if (keywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()))) {
        parsed.componentType = type;
        break;
      }
    }
    
    return parsed;
  }, []);

  const addRequirement = useCallback((text: string, pageNumber: number, specSection: string) => {
    const parsedData = parseRequirement(text);
    
    // Calculate confidence score
    let confidence = 0.3; // Base confidence
    if (parsedData.backingType) confidence += 0.3;
    if (parsedData.componentType) confidence += 0.2;
    if (parsedData.heightAFF) confidence += 0.1;
    if (parsedData.weight) confidence += 0.1;
    
    const newRequirement: ExtractedRequirement = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      specSection,
      pageNumber,
      text: text.trim(),
      parsedData,
      confidence: Math.min(confidence, 1.0),
      applied: false
    };

    setRequirements(prev => {
      const updated = [...prev, newRequirement];
      onRequirementsChanged?.(updated);
      return updated;
    });
  }, [parseRequirement, onRequirementsChanged]);

  const updateRequirement = useCallback((id: string, updates: Partial<ExtractedRequirement['parsedData']>) => {
    setRequirements(prev => {
      const updated = prev.map(req => 
        req.id === id 
          ? { ...req, parsedData: { ...req.parsedData, ...updates } }
          : req
      );
      onRequirementsChanged?.(updated);
      return updated;
    });
  }, [onRequirementsChanged]);

  const applyRequirement = useCallback((id: string) => {
    setRequirements(prev => {
      const updated = prev.map(req => 
        req.id === id ? { ...req, applied: true } : req
      );
      const appliedReq = updated.find(req => req.id === id);
      if (appliedReq) {
        onRequirementApplied?.(appliedReq);
      }
      onRequirementsChanged?.(updated);
      return updated;
    });
  }, [onRequirementApplied, onRequirementsChanged]);

  const deleteRequirement = useCallback((id: string) => {
    setRequirements(prev => {
      const updated = prev.filter(req => req.id !== id);
      onRequirementsChanged?.(updated);
      return updated;
    });
  }, [onRequirementsChanged]);

  const clearAllRequirements = useCallback(() => {
    setRequirements([]);
    onRequirementsChanged?.([]);
  }, [onRequirementsChanged]);

  const appliedCount = requirements.filter(req => req.applied).length;
  const pendingCount = requirements.length - appliedCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Extracted Requirements
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Total: {requirements.length}</span>
                <span>Applied: {appliedCount}</span>
                <span>Pending: {pendingCount}</span>
              </div>
            </div>
            
            {requirements.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllRequirements}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Requirements List */}
      <div className="space-y-3">
        {requirements.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No requirements extracted yet.</p>
              <p className="text-xs mt-1">
                Select text from specifications to extract backing requirements automatically.
              </p>
            </CardContent>
          </Card>
        ) : (
          requirements.map(requirement => (
            <RequirementCard
              key={requirement.id}
              requirement={requirement}
              onEdit={(updates) => updateRequirement(requirement.id, updates)}
              onApply={() => applyRequirement(requirement.id)}
              onDelete={() => deleteRequirement(requirement.id)}
            />
          ))
        )}
      </div>

      {/* Helper for external components to add requirements */}
      {React.createElement('div', { 
        ref: (el: any) => {
          if (el) {
            el._addRequirement = addRequirement;
          }
        },
        style: { display: 'none' }
      })}
    </div>
  );
}