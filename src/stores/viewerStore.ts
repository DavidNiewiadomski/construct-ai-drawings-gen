import { create } from 'zustand';

type Tool = 'pan' | 'select' | 'add' | 'measure';

interface ViewerState {
  zoom: number;
  position: { x: number; y: number };
  selectedTool: Tool;
  selectedBacking: string | null;
  showGrid: boolean;
  gridSize: number;
  layers: {
    drawing: boolean;
    backings: boolean;
    dimensions: boolean;
  };
  
  // Actions
  setZoom: (zoom: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
  selectTool: (tool: Tool) => void;
  selectBacking: (id: string | null) => void;
  toggleLayer: (layer: keyof ViewerState['layers']) => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  resetView: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  zoom: 1,
  position: { x: 0, y: 0 },
  selectedTool: 'select',
  selectedBacking: null,
  showGrid: false,
  gridSize: 24, // 24 inches in drawing units
  layers: {
    drawing: true,
    backings: true,
    dimensions: true,
  },

  setZoom: (zoom: number) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  
  setPosition: (position: { x: number; y: number }) => set({ position }),
  
  selectTool: (tool: Tool) => set({ selectedTool: tool, selectedBacking: null }),
  
  selectBacking: (id: string | null) => set({ selectedBacking: id }),
  
  toggleLayer: (layer: keyof ViewerState['layers']) => 
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  setGridSize: (size: number) => set({ gridSize: size }),
  
  resetView: () => set({ zoom: 1, position: { x: 0, y: 0 } }),
}));