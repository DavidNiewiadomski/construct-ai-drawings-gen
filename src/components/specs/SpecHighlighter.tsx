import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, MousePointer, Highlighter } from 'lucide-react';
import { ExtractedRequirement, Rectangle } from '@/types';
import { specService } from '@/services/specService';

interface SpecHighlighterProps {
  fileUrl: string;
  requirements: ExtractedRequirement[];
  onRequirementCreate: (requirement: ExtractedRequirement) => void;
}

export function SpecHighlighter({ fileUrl, requirements, onRequirementCreate }: SpecHighlighterProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [selectedText, setSelectedText] = useState('');
  const [selectionBounds, setSelectionBounds] = useState<Rectangle | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const keywords = [
    'blocking', 'backing', 'reinforcement', 'mounting height', 'AFF',
    'support', 'brace', 'TV', 'grab bar', 'equipment', 'sink', 'cabinet'
  ];

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText('');
      setSelectionBounds(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 10) return; // Ignore short selections

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (viewerRef.current) {
      const containerRect = viewerRef.current.getBoundingClientRect();
      const bounds: Rectangle = {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      };

      setSelectedText(text);
      setSelectionBounds(bounds);
    }
  }, []);

  const handleCreateRequirement = async () => {
    if (!selectedText || !selectionBounds) return;

    try {
      const newRequirement = await specService.createRequirement(
        'current-file', // This would be passed as prop in real implementation
        currentPage,
        selectedText,
        selectionBounds
      );

      onRequirementCreate(newRequirement);
      setSelectedText('');
      setSelectionBounds(null);
    } catch (error) {
      console.error('Failed to create requirement:', error);
    }
  };

  const highlightKeywords = (text: string) => {
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
      );
    });
    return highlightedText;
  };

  const renderRequirementHighlights = () => {
    return requirements
      .filter(req => req.pageNumber === currentPage)
      .map(req => (
        <div
          key={req.id}
          className="absolute border-2 border-blue-400 bg-blue-100 bg-opacity-30 pointer-events-none"
          style={{
            left: req.boundingBox.x * zoom,
            top: req.boundingBox.y * zoom,
            width: req.boundingBox.width * zoom,
            height: req.boundingBox.height * zoom,
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full h-full cursor-help pointer-events-auto" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="text-sm font-medium">{req.section}</p>
                <p className="text-xs text-muted-foreground">{req.text}</p>
                <Badge variant="outline" className="mt-1">
                  {Math.round(req.confidence * 100)}% confidence
                </Badge>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant={highlightMode ? "default" : "outline"}
            size="sm"
            onClick={() => setHighlightMode(!highlightMode)}
          >
            <Highlighter className="h-4 w-4 mr-1" />
            Highlight Mode
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSelecting(!isSelecting)}
          >
            <MousePointer className="h-4 w-4 mr-1" />
            Select Text
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm px-2">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm px-2 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(1)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto relative">
        <div
          ref={viewerRef}
          className="relative min-h-full"
          onMouseUp={isSelecting ? handleTextSelection : undefined}
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            cursor: isSelecting ? 'text' : 'default'
          }}
        >
          {/* Mock PDF content - in real implementation, use react-pdf or similar */}
          <div className="w-full min-h-[800px] bg-white border shadow-sm p-8">
            <div className="space-y-4 text-sm">
              <h2 className="text-lg font-bold">SECTION 05 50 00 - METAL FABRICATIONS</h2>
              
              <div className="space-y-2">
                <h3 className="font-semibold">2.1 WALL MOUNTED EQUIPMENT</h3>
                <p dangerouslySetInnerHTML={{ 
                  __html: highlightKeywords(
                    "TV Mounts: Provide 2x8 wood blocking at 60 inches above finished floor (AFF) for all wall-mounted televisions. Blocking shall extend minimum 6 inches beyond mounting bracket dimensions on all sides."
                  )
                }} />
                
                <p dangerouslySetInnerHTML={{ 
                  __html: highlightKeywords(
                    "Equipment over 50 lbs: Provide 3/4 inch plywood backing, minimum 24 inches x 24 inches, for equipment weighing more than 50 pounds. Backing shall be continuous and properly fastened to structural members."
                  )
                }} />
              </div>

              <h2 className="text-lg font-bold mt-8">SECTION 10 28 00 - TOILET ACCESSORIES</h2>
              
              <div className="space-y-2">
                <h3 className="font-semibold">2.1 MOUNTING REQUIREMENTS</h3>
                <p dangerouslySetInnerHTML={{ 
                  __html: highlightKeywords(
                    "Grab bars: Provide 2x6 continuous blocking at 33 to 36 inches AFF for all grab bar installations. Blocking shall be solid lumber, properly secured to wall framing."
                  )
                }} />
                
                <p dangerouslySetInnerHTML={{ 
                  __html: highlightKeywords(
                    "Paper dispensers: Provide 2x4 blocking at 36 inches AFF for paper towel and toilet paper dispensers. Coordinate exact locations with architectural drawings."
                  )
                }} />
              </div>
            </div>
          </div>

          {/* Requirement Highlights */}
          {renderRequirementHighlights()}

          {/* Selection Highlight */}
          {selectionBounds && (
            <div
              className="absolute border-2 border-green-400 bg-green-100 bg-opacity-30"
              style={{
                left: selectionBounds.x,
                top: selectionBounds.y,
                width: selectionBounds.width,
                height: selectionBounds.height,
              }}
            />
          )}
        </div>
      </div>

      {/* Selection Action Bar */}
      {selectedText && (
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Selected Text:</p>
              <p className="text-xs text-muted-foreground truncate max-w-md">
                {selectedText}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedText('');
                  setSelectionBounds(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateRequirement}>
                Create Requirement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}