import React, { useState, useCallback } from 'react';
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { searchPlugin } from '@react-pdf-viewer/search';
import { highlightPlugin } from '@react-pdf-viewer/highlight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  FileText, 
  Highlighter, 
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

interface SpecificationViewerProps {
  file: {
    url: string;
    name: string;
  };
  onTextSelect?: (text: string, pageIndex: number, context: string) => void;
  onRequirementExtracted?: (requirement: ExtractedRequirement) => void;
}

interface ExtractedRequirement {
  id: string;
  text: string;
  pageNumber: number;
  category: string;
  confidence: number;
  context: string;
  parsedValues?: {
    backingType?: string;
    dimensions?: string;
    heightAFF?: number;
    componentType?: string;
  };
}

const BACKING_KEYWORDS = [
  'backing', 'blocking', 'reinforcement', 'support',
  'nailer', 'substrate', 'backer', 'frame', 'framing',
  'mount', 'bracket', 'attachment', 'fastener',
  'AFF', 'above finished floor', 'height',
  'plywood', '2x4', '2x6', '2x8', '2x10', '2x12',
  'gauge', 'steel', 'wood', 'lumber', 'stud',
  'television', 'TV', 'monitor', 'cabinet',
  'grab bar', 'handrail', 'fixture', 'equipment'
];

const BACKING_PATTERNS = [
  /(\d+x\d+)\s*(lumber|wood|stud)/i,
  /(\d+\/\d+["']?)\s*(plywood|ply)/i,
  /(\d+)\s*gauge\s*steel/i,
  /(\d+["']?\s*x\s*\d+["']?)\s*backing/i,
  /mount(?:ing)?\s*(?:at\s*)?(\d+["']?)\s*(?:AFF|above\s*finished\s*floor)/i,
  /backing\s*(?:shall\s*be\s*)?(\d+x\d+)/i
];

export function SpecificationViewer({ 
  file, 
  onTextSelect, 
  onRequirementExtracted 
}: SpecificationViewerProps) {
  const [selectedText, setSelectedText] = useState<string>('');
  const [extractedRequirements, setExtractedRequirements] = useState<ExtractedRequirement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Initialize plugins
  const searchPluginInstance = searchPlugin();
  const highlightPluginInstance = highlightPlugin();

  const extractBackingRequirement = useCallback((text: string, pageNum: number): ExtractedRequirement | null => {
    // Check if text contains backing-related keywords
    const hasBackingKeywords = BACKING_KEYWORDS.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!hasBackingKeywords) return null;

    // Parse backing dimensions and materials
    const parsedValues: ExtractedRequirement['parsedValues'] = {};
    
    // Extract lumber dimensions (2x4, 2x6, etc.)
    const lumberMatch = text.match(/(\d+x\d+)/i);
    if (lumberMatch) {
      parsedValues.backingType = lumberMatch[1];
    }

    // Extract plywood thickness
    const plywoodMatch = text.match(/(\d+\/\d+)["']?\s*plywood/i);
    if (plywoodMatch) {
      parsedValues.backingType = `${plywoodMatch[1]}_plywood`;
    }

    // Extract height AFF
    const heightMatch = text.match(/(\d+)["']?\s*(?:AFF|above\s*finished\s*floor)/i);
    if (heightMatch) {
      parsedValues.heightAFF = parseInt(heightMatch[1]);
    }

    // Determine component type
    if (text.toLowerCase().includes('tv') || text.toLowerCase().includes('television')) {
      parsedValues.componentType = 'tv';
    } else if (text.toLowerCase().includes('grab bar') || text.toLowerCase().includes('handrail')) {
      parsedValues.componentType = 'grab_bar';
    } else if (text.toLowerCase().includes('cabinet')) {
      parsedValues.componentType = 'cabinet';
    }

    // Calculate confidence based on pattern matches
    let confidence = 0.5;
    if (lumberMatch || plywoodMatch) confidence += 0.3;
    if (heightMatch) confidence += 0.2;
    if (parsedValues.componentType) confidence += 0.2;

    return {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      pageNumber: pageNum + 1,
      category: 'backing_requirement',
      confidence: Math.min(confidence, 1.0),
      context: text.substring(Math.max(0, text.length - 100)),
      parsedValues
    };
  }, []);

  const handleTextSelection = useCallback((e: any) => {
    const selectedText = e.text?.trim();
    if (!selectedText || selectedText.length < 10) return;

    setSelectedText(selectedText);
    setCurrentPage(e.pageIndex || 0);
    
    // Try to extract requirement
    const requirement = extractBackingRequirement(selectedText, e.pageIndex || 0);
    if (requirement) {
      console.log('Extracted requirement:', requirement);
    }

    onTextSelect?.(selectedText, e.pageIndex || 0, selectedText);
  }, [extractBackingRequirement, onTextSelect]);

  const addRequirement = useCallback(() => {
    if (!selectedText) return;

    const requirement = extractBackingRequirement(selectedText, currentPage);
    if (requirement) {
      setExtractedRequirements(prev => [...prev, requirement]);
      onRequirementExtracted?.(requirement);
      setSelectedText('');
    }
  }, [selectedText, currentPage, extractBackingRequirement, onRequirementExtracted]);

  const removeRequirement = useCallback((id: string) => {
    setExtractedRequirements(prev => prev.filter(req => req.id !== id));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[800px]">
      {/* PDF Viewer */}
      <div className="lg:col-span-2 border rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {searchPluginInstance.Search && (
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <searchPluginInstance.Search />
              </div>
            )}
          </div>
        </div>
        
        <div className="h-full">
          <Viewer
            fileUrl={file.url}
            defaultScale={SpecialZoomLevel.PageFit}
            plugins={[searchPluginInstance, highlightPluginInstance]}
            onDocumentLoad={(e) => {
              console.log('Document loaded:', e.doc.numPages, 'pages');
            }}
          />
        </div>
      </div>

      {/* Requirements Panel */}
      <div className="space-y-4">
        {/* Selection Panel */}
        {selectedText && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Highlighter className="w-4 h-4" />
                Selected Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
                {selectedText}
              </div>
              <Button onClick={addRequirement} size="sm" className="w-full">
                <Plus className="w-3 h-3 mr-1" />
                Extract Requirement
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Extracted Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Requirements ({extractedRequirements.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {extractedRequirements.length === 0 ? (
              <div className="text-center text-muted-foreground text-xs py-4">
                Select text containing backing requirements to extract them automatically.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {extractedRequirements.map((req) => (
                  <div key={req.id} className="border rounded-lg p-2 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={req.confidence > 0.7 ? "default" : "secondary"} className="text-xs">
                          {Math.round(req.confidence * 100)}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Page {req.pageNumber}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRequirement(req.id)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                    
                    <div className="text-xs">{req.text}</div>
                    
                    {req.parsedValues && (
                      <div className="space-y-1">
                        {req.parsedValues.backingType && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Type:</span>
                            <Badge variant="outline" className="text-xs">
                              {req.parsedValues.backingType}
                            </Badge>
                          </div>
                        )}
                        {req.parsedValues.heightAFF && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Height:</span>
                            <span className="text-xs">{req.parsedValues.heightAFF}" AFF</span>
                          </div>
                        )}
                        {req.parsedValues.componentType && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Component:</span>
                            <span className="text-xs">{req.parsedValues.componentType}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keywords Reference */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Auto-Highlight Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Text containing these terms will be automatically highlighted:
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {BACKING_KEYWORDS.slice(0, 8).map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">
                +{BACKING_KEYWORDS.length - 8} more
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}