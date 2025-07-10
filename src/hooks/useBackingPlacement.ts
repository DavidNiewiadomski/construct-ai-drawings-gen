import { useCallback } from 'react';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingPlacement as BackingType } from '@/types';
import { coordinateSystem } from '@/utils/coordinateSystem';

export function useBackingPlacement(
  backings: BackingType[],
  onBackingsChange: (backings: BackingType[]) => void
) {
  const { pan: position, gridEnabled: showGrid, gridSize, selectBacking } = useViewerStore();

  // Handle adding a new backing
  const handleAddBacking = useCallback((pointer: { x: number; y: number }) => {
    // Convert screen coordinates to PDF coordinates
    const pdfPos = coordinateSystem.screenToPdf({
      x: pointer.x - position.x,
      y: pointer.y - position.y,
    });

    // Snap to grid if enabled
    const finalPos = showGrid 
      ? coordinateSystem.snapToPdfGrid(pdfPos, gridSize)
      : pdfPos;

    const newBacking: BackingType = {
      id: crypto.randomUUID(),
      componentId: '',
      x: finalPos.x,
      y: finalPos.y,
      width: 48,
      height: 24,
      backingType: '2x6',
      dimensions: { width: 48, height: 24, thickness: 6 },
      location: { x: finalPos.x, y: finalPos.y, z: 42 },
      orientation: 0,
      status: 'user_modified',
    };

    onBackingsChange([...backings, newBacking]);
    selectBacking(newBacking.id);
  }, [backings, onBackingsChange, position, showGrid, gridSize, selectBacking]);

  // Handle backing update
  const handleBackingUpdate = useCallback((updatedBacking: BackingType) => {
    const updatedBackings = backings.map(b =>
      b.id === updatedBacking.id ? updatedBacking : b
    );
    onBackingsChange(updatedBackings);
  }, [backings, onBackingsChange]);

  return {
    handleAddBacking,
    handleBackingUpdate
  };
}