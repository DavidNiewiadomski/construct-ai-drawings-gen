import { create } from 'zustand';
import { Point, BackingPlacement, Measurement } from '@/types';

type Tool = 'pan' | 'select' | 'draw' | 'measure' | 'add';

interface ViewerState {
  // Document state
  currentPage: number;
  totalPages: number;
  
  // View state
  zoom: number;
  pan: Point;
  
  // Tool state
  tool: Tool;
  selectedBackingId: string | null;
  
  // Data state
  backings: BackingPlacement[];
  measurements: Measurement[];
  
  // Grid state
  gridEnabled: boolean;
  gridSize: number;
  
  // Layer visibility
  layers: {
    drawing: boolean;
    backings: boolean;
    dimensions: boolean;
  };
  
  // Document actions
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  
  // View actions
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  resetView: () => void;
  
  // Tool actions
  setTool: (tool: Tool) => void;
  selectBacking: (id: string | null) => void;
  
  // Backing actions
  addBacking: (backing: BackingPlacement) => void;
  updateBacking: (id: string, updates: Partial<BackingPlacement>) => void;
  deleteBacking: (id: string) => void;
  
  // Measurement actions
  addMeasurement: (measurement: Measurement) => void;
  updateMeasurement: (id: string, updates: Partial<Measurement>) => void;
  deleteMeasurement: (id: string) => void;
  clearMeasurements: () => void;
  
  // Grid actions
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  
  // Layer actions
  toggleLayer: (layer: keyof ViewerState['layers']) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  // Document state
  currentPage: 0,
  totalPages: 0,
  
  // View state
  zoom: 1,
  pan: { x: 0, y: 0 },
  
  // Tool state
  tool: 'select',
  selectedBackingId: null,
  
  // Data state
  backings: [],
  measurements: [],
  
  // Grid state
  gridEnabled: false,
  gridSize: 24, // 24 inches in drawing units
  
  // Layer visibility
  layers: {
    drawing: true,
    backings: true,
    dimensions: true,
  },

  // Document actions
  setPage: (page: number) => set({ currentPage: page }),
  setTotalPages: (total: number) => set({ totalPages: total }),
  
  // View actions
  setZoom: (zoom: number) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (pan: Point) => set({ pan }),
  resetView: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),
  
  // Tool actions
  setTool: (tool: Tool) => set({ tool, selectedBackingId: null }),
  selectBacking: (id: string | null) => set({ selectedBackingId: id }),
  
  // Backing actions
  addBacking: (backing: BackingPlacement) => 
    set((state) => ({ backings: [...state.backings, backing] })),
  
  updateBacking: (id: string, updates: Partial<BackingPlacement>) =>
    set((state) => ({
      backings: state.backings.map(backing =>
        backing.id === id ? { ...backing, ...updates } : backing
      )
    })),
  
  deleteBacking: (id: string) =>
    set((state) => ({
      backings: state.backings.filter(backing => backing.id !== id),
      selectedBackingId: state.selectedBackingId === id ? null : state.selectedBackingId
    })),
  
  // Measurement actions
  addMeasurement: (measurement: Measurement) =>
    set((state) => ({ measurements: [...state.measurements, measurement] })),
  
  updateMeasurement: (id: string, updates: Partial<Measurement>) =>
    set((state) => ({
      measurements: state.measurements.map(measurement =>
        measurement.id === id ? { ...measurement, ...updates } : measurement
      )
    })),
  
  deleteMeasurement: (id: string) =>
    set((state) => ({
      measurements: state.measurements.filter(measurement => measurement.id !== id)
    })),
  
  clearMeasurements: () => set({ measurements: [] }),
  
  // Grid actions
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  setGridSize: (size: number) => set({ gridSize: size }),
  
  // Layer actions
  toggleLayer: (layer: keyof ViewerState['layers']) => 
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),
}));