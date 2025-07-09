import { useCallback } from 'react';
import { useViewerStore } from '@/stores/viewerStore';
import { constrainPosition, getZoomToFit } from '@/utils/viewerUtils';
import { coordinateSystem } from '@/utils/coordinateSystem';

export function usePanAndZoom(stageSize: { width: number; height: number }, pdfDimensions: { width: number; height: number }) {
  const { zoom, position, setZoom, setPosition } = useViewerStore();

  // Handle zoom to fit
  const handleZoomToFit = useCallback(() => {
    if (pdfDimensions.width > 0 && pdfDimensions.height > 0) {
      const { zoom: newZoom, position: newPosition } = getZoomToFit(
        pdfDimensions,
        stageSize,
        50
      );
      setZoom(newZoom);
      setPosition(newPosition);
    }
  }, [pdfDimensions, stageSize, setZoom, setPosition]);

  // Handle mouse move for panning
  const handlePanMove = useCallback((stage: any, pointer: { x: number; y: number }) => {
    if (stage.dragData) {
      const newPosition = {
        x: pointer.x - stage.dragData.startX,
        y: pointer.y - stage.dragData.startY
      };
      
      // Constrain position to keep content visible
      const constrainedPosition = constrainPosition(
        newPosition,
        zoom,
        stageSize,
        pdfDimensions
      );
      
      setPosition(constrainedPosition);
    }
  }, [zoom, stageSize, pdfDimensions, setPosition]);

  // Start panning
  const startPan = useCallback((stage: any, pointer: { x: number; y: number }) => {
    stage.dragData = {
      startX: pointer.x - position.x,
      startY: pointer.y - position.y
    };
  }, [position]);

  // End panning
  const endPan = useCallback((stage: any) => {
    stage.dragData = null;
  }, []);

  // Update coordinate system when zoom/pan changes
  const updateCoordinateSystem = useCallback(() => {
    coordinateSystem.updateViewport({
      zoom,
      pan: position,
      stageSize
    });
  }, [zoom, position, stageSize]);

  return {
    zoom,
    position,
    handleZoomToFit,
    handlePanMove,
    startPan,
    endPan,
    updateCoordinateSystem
  };
}
