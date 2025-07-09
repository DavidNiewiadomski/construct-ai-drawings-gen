import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Menu,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Home,
  Move,
  Square,
  Ruler,
  FileText,
  Settings,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { BackingPlacement } from '@/types';

interface MobileViewerProps {
  drawingUrl?: string;
  backings: BackingPlacement[];
  onBackingsChange: (backings: BackingPlacement[]) => void;
}

interface TouchGesture {
  scale: number;
  rotation: number;
  panX: number;
  panY: number;
}

export function MobileViewer({ drawingUrl, backings, onBackingsChange }: MobileViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activeTool, setActiveTool] = useState<'select' | 'move' | 'backing' | 'dimension'>('select');
  const [selectedBacking, setSelectedBacking] = useState<string | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [transform, setTransform] = useState<TouchGesture>({
    scale: 1,
    rotation: 0,
    panX: 0,
    panY: 0
  });
  
  // Touch handling state
  const [touches, setTouches] = useState<TouchList | null>(null);
  const [lastDistance, setLastDistance] = useState(0);
  const [lastAngle, setLastAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showBackings, setShowBackings] = useState(true);

  // Calculate distance between two touches
  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Calculate angle between two touches
  const getTouchAngle = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touchList = e.touches;
    setTouches(touchList);

    if (touchList.length === 2) {
      // Two-finger gesture
      setLastDistance(getTouchDistance(touchList));
      setLastAngle(getTouchAngle(touchList));
    } else if (touchList.length === 1) {
      // Single touch
      setIsDragging(true);
      
      // Check if touching a backing
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (touchList[0].clientX - rect.left - transform.panX) / transform.scale;
        const y = (touchList[0].clientY - rect.top - transform.panY) / transform.scale;
        
        const touchedBacking = backings.find(backing => 
          x >= backing.position.x && 
          x <= backing.position.x + backing.size.width &&
          y >= backing.position.y && 
          y <= backing.position.y + backing.size.height
        );
        
        if (touchedBacking) {
          setSelectedBacking(touchedBacking.id);
          setShowProperties(true);
        } else {
          setSelectedBacking(null);
          setShowProperties(false);
        }
      }
    }
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touchList = e.touches;

    if (touchList.length === 2 && touches && touches.length === 2) {
      // Two-finger pinch/rotate
      const currentDistance = getTouchDistance(touchList);
      const currentAngle = getTouchAngle(touchList);

      if (lastDistance > 0) {
        const scaleChange = currentDistance / lastDistance;
        const angleChange = currentAngle - lastAngle;

        setTransform(prev => ({
          ...prev,
          scale: Math.max(0.1, Math.min(5, prev.scale * scaleChange)),
          rotation: prev.rotation + angleChange
        }));
      }

      setLastDistance(currentDistance);
      setLastAngle(currentAngle);
    } else if (touchList.length === 1 && touches && touches.length === 1 && isDragging) {
      // Single finger pan
      const deltaX = touchList[0].clientX - touches[0].clientX;
      const deltaY = touchList[0].clientY - touches[0].clientY;

      if (activeTool === 'move' || activeTool === 'select') {
        setTransform(prev => ({
          ...prev,
          panX: prev.panX + deltaX,
          panY: prev.panY + deltaY
        }));
      }
    }

    setTouches(touchList);
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouches(null);
    setIsDragging(false);
    setLastDistance(0);
    setLastAngle(0);
  };

  // Handle long press for context menu
  const handleLongPress = (e: React.TouchEvent) => {
    e.preventDefault();
    // Show context menu or properties panel
    setShowProperties(true);
  };

  // Reset view to fit
  const resetView = () => {
    setTransform({
      scale: 1,
      rotation: 0,
      panX: 0,
      panY: 0
    });
  };

  // Zoom controls
  const zoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(5, prev.scale * 1.2)
    }));
  };

  const zoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale * 0.8)
    }));
  };

  // Rotate view
  const rotateView = () => {
    setTransform(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const selectedBackingData = selectedBacking ? 
    backings.find(b => b.id === selectedBacking) : null;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Tools</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={activeTool === 'select' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTool('select')}
                      className="justify-start"
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Select
                    </Button>
                    <Button
                      variant={activeTool === 'move' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTool('move')}
                      className="justify-start"
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Pan
                    </Button>
                    <Button
                      variant={activeTool === 'backing' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTool('backing')}
                      className="justify-start"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Backing
                    </Button>
                    <Button
                      variant={activeTool === 'dimension' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTool('dimension')}
                      className="justify-start"
                    >
                      <Ruler className="h-4 w-4 mr-2" />
                      Measure
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">View</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBackings(!showBackings)}
                      className="w-full justify-start"
                    >
                      {showBackings ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                      {showBackings ? 'Hide' : 'Show'} Backings
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Backings ({backings.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {backings.map((backing) => (
                      <Card
                        key={backing.id}
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedBacking === backing.id ? 'bg-primary/10 border-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedBacking(backing.id);
                          setShowProperties(true);
                        }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{backing.component.type}</span>
                            <Badge variant="secondary" className="text-xs">
                              {backing.lumberSize}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {backing.size.width}" × {backing.size.height}"
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="font-semibold text-lg">Drawing Viewer</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={resetView}>
            <Home className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted/30"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
            transformOrigin: 'center',
            touchAction: 'none'
          }}
        />
        
        {/* Drawing placeholder */}
        {!drawingUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No drawing loaded</p>
            </div>
          </div>
        )}

        {/* Backing overlays (simplified for mobile) */}
        {showBackings && backings.map((backing) => (
          <div
            key={backing.id}
            className={`absolute border-2 bg-primary/20 rounded ${
              selectedBacking === backing.id ? 'border-primary' : 'border-primary/50'
            }`}
            style={{
              left: `${backing.position.x * transform.scale + transform.panX}px`,
              top: `${backing.position.y * transform.scale + transform.panY}px`,
              width: `${backing.size.width * transform.scale}px`,
              height: `${backing.size.height * transform.scale}px`,
              transform: `rotate(${transform.rotation}deg)`
            }}
            onClick={() => {
              setSelectedBacking(backing.id);
              setShowProperties(true);
            }}
          >
            <div className="absolute top-1 left-1">
              <Badge variant="secondary" className="text-xs">
                {backing.lumberSize}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between p-4 border-t bg-card">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {Math.round(transform.scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={rotateView}>
          <RotateCw className="h-4 w-4" />
        </Button>

        <Badge variant="secondary" className="text-xs">
          {activeTool}
        </Badge>
      </div>

      {/* Properties Bottom Sheet */}
      <Sheet open={showProperties} onOpenChange={setShowProperties}>
        <SheetContent side="bottom" className="h-[400px]">
          {selectedBackingData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Backing Properties</h3>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newBackings = backings.filter(b => b.id !== selectedBacking);
                    onBackingsChange(newBackings);
                    setSelectedBacking(null);
                    setShowProperties(false);
                  }}
                >
                  Delete
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Component Type</label>
                  <p className="text-sm text-muted-foreground">{selectedBackingData.component.type}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Lumber Size</label>
                  <p className="text-sm text-muted-foreground">{selectedBackingData.lumberSize}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Width</label>
                    <p className="text-sm text-muted-foreground">{selectedBackingData.size.width}"</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Height</label>
                    <p className="text-sm text-muted-foreground">{selectedBackingData.size.height}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">X Position</label>
                    <p className="text-sm text-muted-foreground">{Math.round(selectedBackingData.position.x)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Y Position</label>
                    <p className="text-sm text-muted-foreground">{Math.round(selectedBackingData.position.y)}</p>
                  </div>
                </div>

                {selectedBackingData.notes && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-sm text-muted-foreground">{selectedBackingData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}