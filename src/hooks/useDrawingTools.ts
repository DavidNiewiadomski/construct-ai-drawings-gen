import { useState, useCallback, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { BackingPlacement as BackingType } from '@/types';

export interface Point {
  x: number;
  y: number;
}

export interface MeasurementLine {
  id: string;
  start: Point;
  end: Point;
  distance: number;
}

export interface DrawingPreview {
  start: Point;
  current: Point;
  width: number;
  height: number;
}

type DrawingTool = 'pan' | 'select' | 'draw' | 'measure';

interface UseDrawingToolsProps {
  onBackingCreate?: (backing: BackingType) => void;
  onMeasurementCreate?: (measurement: MeasurementLine) => void;
  gridSize?: number;
  snapToGrid?: boolean;
}

export const useDrawingTools = ({
  onBackingCreate,
  onMeasurementCreate,
  gridSize = 24,
  snapToGrid = true
}: UseDrawingToolsProps = {}) => {
  const [tool, setTool] = useState<DrawingTool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [drawingPreview, setDrawingPreview] = useState<DrawingPreview | null>(null);
  const [measurementPoints, setMeasurementPoints] = useState<Point[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementLine[]>([]);
  
  const stageRef = useRef<any>(null);

  // Utility function to snap coordinates to grid
  const snapPoint = useCallback((point: Point): Point => {
    if (!snapToGrid) return point;
    
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  }, [gridSize, snapToGrid]);

  // Get pointer position relative to stage
  const getPointerPosition = useCallback((e: KonvaEventObject<MouseEvent>): Point => {
    const stage = e.target.getStage();
    if (!stage) return { x: 0, y: 0 };
    
    const pointer = stage.getPointerPosition();
    return pointer || { x: 0, y: 0 };
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((start: Point, end: Point): number => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Handle mouse down events
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const pointer = getPointerPosition(e);
    const snappedPoint = snapPoint(pointer);

    switch (tool) {
      case 'draw':
        setIsDrawing(true);
        setStartPoint(snappedPoint);
        setCurrentPoint(snappedPoint);
        setDrawingPreview({
          start: snappedPoint,
          current: snappedPoint,
          width: 0,
          height: 0,
        });
        break;

      case 'measure':
        if (measurementPoints.length === 0) {
          // First point of measurement
          setMeasurementPoints([snappedPoint]);
        } else if (measurementPoints.length === 1) {
          // Second point - complete measurement
          const start = measurementPoints[0];
          const distance = calculateDistance(start, snappedPoint);
          
          const newMeasurement: MeasurementLine = {
            id: crypto.randomUUID(),
            start,
            end: snappedPoint,
            distance,
          };

          setMeasurements(prev => [...prev, newMeasurement]);
          setMeasurementPoints([]);
          
          if (onMeasurementCreate) {
            onMeasurementCreate(newMeasurement);
          }
        }
        break;

      case 'select':
      case 'pan':
        // These are handled by the individual components/canvas
        break;
    }
  }, [tool, measurementPoints, snapPoint, getPointerPosition, calculateDistance, onMeasurementCreate]);

  // Handle mouse move events
  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing && tool !== 'measure') return;

    const pointer = getPointerPosition(e);
    const snappedPoint = snapPoint(pointer);

    switch (tool) {
      case 'draw':
        if (isDrawing && startPoint) {
          setCurrentPoint(snappedPoint);
          
          const width = Math.abs(snappedPoint.x - startPoint.x);
          const height = Math.abs(snappedPoint.y - startPoint.y);
          
          setDrawingPreview({
            start: {
              x: Math.min(startPoint.x, snappedPoint.x),
              y: Math.min(startPoint.y, snappedPoint.y),
            },
            current: snappedPoint,
            width,
            height,
          });
        }
        break;

      case 'measure':
        if (measurementPoints.length === 1) {
          setCurrentPoint(snappedPoint);
        }
        break;
    }
  }, [tool, isDrawing, startPoint, measurementPoints, snapPoint, getPointerPosition]);

  // Handle mouse up events
  const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const pointer = getPointerPosition(e);
    const snappedPoint = snapPoint(pointer);

    switch (tool) {
      case 'draw':
        if (isDrawing && startPoint && drawingPreview) {
          const minSize = gridSize; // Minimum backing size
          
          if (drawingPreview.width >= minSize && drawingPreview.height >= minSize) {
            const newBacking: BackingType = {
              id: crypto.randomUUID(),
              componentId: `backing-${Date.now()}`,
              backingType: '2x6', // Default type
              dimensions: {
                width: drawingPreview.width,
                height: drawingPreview.height,
                thickness: 6, // Default thickness
              },
              location: {
                x: drawingPreview.start.x,
                y: drawingPreview.start.y,
                z: 42, // Default Z position
              },
              orientation: 0,
              status: 'user_modified',
            };

            if (onBackingCreate) {
              onBackingCreate(newBacking);
            }
          }
        }
        
        // Reset drawing state
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentPoint(null);
        setDrawingPreview(null);
        break;

      case 'measure':
        // Measurement completion is handled in mouseDown
        break;

      case 'select':
      case 'pan':
        // These are handled by the individual components/canvas
        break;
    }
  }, [tool, isDrawing, startPoint, drawingPreview, gridSize, snapPoint, getPointerPosition, onBackingCreate]);

  // Cancel current drawing/measurement
  const cancelCurrentAction = useCallback(() => {
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setDrawingPreview(null);
    setMeasurementPoints([]);
  }, []);

  // Clear all measurements
  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setMeasurementPoints([]);
  }, []);

  // Get cursor style based on current tool
  const getCursorStyle = useCallback(() => {
    switch (tool) {
      case 'pan':
        return 'grab';
      case 'select':
        return 'default';
      case 'draw':
        return 'crosshair';
      case 'measure':
        return 'crosshair';
      default:
        return 'default';
    }
  }, [tool]);

  // Get preview data for rendering
  const getPreviewData = useCallback(() => {
    const preview: any = {};
    
    if (drawingPreview && tool === 'draw') {
      preview.rectangle = drawingPreview;
    }
    
    if (measurementPoints.length === 1 && currentPoint && tool === 'measure') {
      preview.measurementLine = {
        start: measurementPoints[0],
        end: currentPoint,
        distance: calculateDistance(measurementPoints[0], currentPoint),
      };
    }
    
    return preview;
  }, [drawingPreview, measurementPoints, currentPoint, tool, calculateDistance]);

  return {
    // Tool state
    tool,
    setTool,
    isDrawing,
    
    // Points and preview data
    startPoint,
    currentPoint,
    drawingPreview,
    measurementPoints,
    measurements,
    
    // Event handlers
    handlers: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
    },
    
    // Utility functions
    cancelCurrentAction,
    clearMeasurements,
    getCursorStyle,
    getPreviewData,
    snapPoint,
    calculateDistance,
    
    // State setters for external control
    setMeasurements,
    setIsDrawing,
  };
};