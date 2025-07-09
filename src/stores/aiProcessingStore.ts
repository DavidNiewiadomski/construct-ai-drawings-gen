import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIDetectedComponent, AIBackingRule, AIBackingPlacement } from '@/types';
import { FileCard } from './uploadStore';

export type ProcessingStep = 
  | 'file-selection'
  | 'processing'
  | 'detection-review'
  | 'backing-generation'
  | 'final-review';

export type ProcessingStatus = 
  | 'idle'
  | 'processing'
  | 'completed'
  | 'error';

interface ProcessingState {
  // Current wizard state
  currentStep: ProcessingStep;
  processingStatus: ProcessingStatus;
  isProcessing: boolean;
  
  // Data management
  selectedFiles: FileCard[];
  detectedComponents: AIDetectedComponent[];
  backingRules: AIBackingRule[];
  generatedPlacements: AIBackingPlacement[];
  
  // Progress tracking
  processingProgress: number;
  currentStage: string;
  currentMessage: string;
  
  // Error handling
  errors: string[];
  
  // Settings
  processingSettings: {
    confidenceThreshold: number;
    autoConfirmHighConfidence: boolean;
    enableCollisionDetection: boolean;
    optimizeMaterials: boolean;
    minimumSpacing: number;
  };
}

interface ProcessingActions {
  // Step navigation
  setCurrentStep: (step: ProcessingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetWizard: () => void;
  
  // File management
  setSelectedFiles: (files: FileCard[]) => void;
  addSelectedFile: (file: FileCard) => void;
  removeSelectedFile: (fileId: string) => void;
  
  // Component management
  setDetectedComponents: (components: AIDetectedComponent[]) => void;
  updateComponent: (componentId: string, updates: Partial<AIDetectedComponent>) => void;
  confirmComponent: (componentId: string) => void;
  rejectComponent: (componentId: string) => void;
  confirmAllComponents: () => void;
  
  // Backing rules management
  setBackingRules: (rules: AIBackingRule[]) => void;
  addBackingRule: (rule: AIBackingRule) => void;
  updateBackingRule: (ruleId: string, updates: Partial<AIBackingRule>) => void;
  removeBackingRule: (ruleId: string) => void;
  
  // Placement management
  setGeneratedPlacements: (placements: AIBackingPlacement[]) => void;
  addPlacement: (placement: AIBackingPlacement) => void;
  updatePlacement: (placementId: string, updates: Partial<AIBackingPlacement>) => void;
  removePlacement: (placementId: string) => void;
  
  // Processing state
  setProcessingStatus: (status: ProcessingStatus) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessingProgress: (progress: number, stage?: string, message?: string) => void;
  
  // Error handling
  addError: (error: string) => void;
  clearErrors: () => void;
  
  // Settings
  updateSettings: (settings: Partial<ProcessingState['processingSettings']>) => void;
  
  // Computed getters
  getConfirmedComponents: () => AIDetectedComponent[];
  getBackingRequiredComponents: () => AIDetectedComponent[];
  getCompletionRate: () => number;
  canProceedToNextStep: () => boolean;
  
  // Bulk operations
  bulkConfirmComponents: (componentIds: string[]) => void;
  bulkRejectComponents: (componentIds: string[]) => void;
  regeneratePlacements: () => void;
}

const stepOrder: ProcessingStep[] = [
  'file-selection',
  'processing',
  'detection-review',
  'backing-generation',
  'final-review'
];

export const useAIProcessingStore = create<ProcessingState & ProcessingActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'file-selection',
      processingStatus: 'idle',
      isProcessing: false,
      
      selectedFiles: [],
      detectedComponents: [],
      backingRules: [],
      generatedPlacements: [],
      
      processingProgress: 0,
      currentStage: '',
      currentMessage: '',
      
      errors: [],
      
      processingSettings: {
        confidenceThreshold: 0.7,
        autoConfirmHighConfidence: true,
        enableCollisionDetection: true,
        optimizeMaterials: true,
        minimumSpacing: 12
      },

      // Step navigation
      setCurrentStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => {
        const currentIndex = stepOrder.indexOf(state.currentStep);
        const nextIndex = Math.min(currentIndex + 1, stepOrder.length - 1);
        return { currentStep: stepOrder[nextIndex] };
      }),
      
      previousStep: () => set((state) => {
        const currentIndex = stepOrder.indexOf(state.currentStep);
        const prevIndex = Math.max(currentIndex - 1, 0);
        return { currentStep: stepOrder[prevIndex] };
      }),
      
      resetWizard: () => set({
        currentStep: 'file-selection',
        processingStatus: 'idle',
        isProcessing: false,
        selectedFiles: [],
        detectedComponents: [],
        generatedPlacements: [],
        processingProgress: 0,
        currentStage: '',
        currentMessage: '',
        errors: []
      }),

      // File management
      setSelectedFiles: (files) => set({ selectedFiles: files }),
      
      addSelectedFile: (file) => set((state) => ({
        selectedFiles: [...state.selectedFiles, file]
      })),
      
      removeSelectedFile: (fileId) => set((state) => ({
        selectedFiles: state.selectedFiles.filter(f => f.id !== fileId)
      })),

      // Component management
      setDetectedComponents: (components) => set({ detectedComponents: components }),
      
      updateComponent: (componentId, updates) => set((state) => ({
        detectedComponents: state.detectedComponents.map(c =>
          c.id === componentId ? { ...c, ...updates } : c
        )
      })),
      
      confirmComponent: (componentId) => set((state) => ({
        detectedComponents: state.detectedComponents.map(c =>
          c.id === componentId ? { ...c, confirmed: true } : c
        )
      })),
      
      rejectComponent: (componentId) => set((state) => ({
        detectedComponents: state.detectedComponents.map(c =>
          c.id === componentId ? { ...c, confirmed: false } : c
        )
      })),
      
      confirmAllComponents: () => set((state) => ({
        detectedComponents: state.detectedComponents.map(c => ({ ...c, confirmed: true }))
      })),

      // Backing rules management
      setBackingRules: (rules) => set({ backingRules: rules }),
      
      addBackingRule: (rule) => set((state) => ({
        backingRules: [...state.backingRules, rule]
      })),
      
      updateBackingRule: (ruleId, updates) => set((state) => ({
        backingRules: state.backingRules.map(r =>
          r.id === ruleId ? { ...r, ...updates } : r
        )
      })),
      
      removeBackingRule: (ruleId) => set((state) => ({
        backingRules: state.backingRules.filter(r => r.id !== ruleId)
      })),

      // Placement management
      setGeneratedPlacements: (placements) => set({ generatedPlacements: placements }),
      
      addPlacement: (placement) => set((state) => ({
        generatedPlacements: [...state.generatedPlacements, placement]
      })),
      
      updatePlacement: (placementId, updates) => set((state) => ({
        generatedPlacements: state.generatedPlacements.map(p =>
          p.id === placementId ? { ...p, ...updates } : p
        )
      })),
      
      removePlacement: (placementId) => set((state) => ({
        generatedPlacements: state.generatedPlacements.filter(p => p.id !== placementId)
      })),

      // Processing state
      setProcessingStatus: (status) => set({ processingStatus: status }),
      setIsProcessing: (isProcessing) => set({ isProcessing }),
      
      setProcessingProgress: (progress, stage, message) => set({
        processingProgress: progress,
        ...(stage && { currentStage: stage }),
        ...(message && { currentMessage: message })
      }),

      // Error handling
      addError: (error) => set((state) => ({
        errors: [...state.errors, error]
      })),
      
      clearErrors: () => set({ errors: [] }),

      // Settings
      updateSettings: (settings) => set((state) => ({
        processingSettings: { ...state.processingSettings, ...settings }
      })),

      // Computed getters
      getConfirmedComponents: () => {
        const state = get();
        return state.detectedComponents.filter(c => c.confirmed);
      },
      
      getBackingRequiredComponents: () => {
        const state = get();
        return state.detectedComponents.filter(c => c.confirmed && c.needsBacking);
      },
      
      getCompletionRate: () => {
        const state = get();
        const backingRequired = state.detectedComponents.filter(c => c.confirmed && c.needsBacking);
        if (backingRequired.length === 0) return 100;
        return (state.generatedPlacements.length / backingRequired.length) * 100;
      },
      
      canProceedToNextStep: () => {
        const state = get();
        switch (state.currentStep) {
          case 'file-selection':
            return state.selectedFiles.length > 0;
          case 'processing':
            return state.processingStatus === 'completed' && state.detectedComponents.length > 0;
          case 'detection-review':
            return state.detectedComponents.some(c => c.confirmed);
          case 'backing-generation':
            return state.generatedPlacements.length > 0;
          case 'final-review':
            return true;
          default:
            return false;
        }
      },

      // Bulk operations
      bulkConfirmComponents: (componentIds) => set((state) => ({
        detectedComponents: state.detectedComponents.map(c =>
          componentIds.includes(c.id) ? { ...c, confirmed: true } : c
        )
      })),
      
      bulkRejectComponents: (componentIds) => set((state) => ({
        detectedComponents: state.detectedComponents.map(c =>
          componentIds.includes(c.id) ? { ...c, confirmed: false } : c
        )
      })),
      
      regeneratePlacements: () => set({
        generatedPlacements: [],
        processingProgress: 0
      })
    }),
    {
      name: 'ai-processing-store',
      // Only persist non-sensitive data
      partialize: (state) => ({
        processingSettings: state.processingSettings,
        backingRules: state.backingRules
      })
    }
  )
);

// Selector hooks for common use cases
export const useCurrentStep = () => useAIProcessingStore(state => state.currentStep);
export const useProcessingProgress = () => useAIProcessingStore(state => ({
  progress: state.processingProgress,
  stage: state.currentStage,
  message: state.currentMessage
}));
export const useDetectedComponents = () => useAIProcessingStore(state => state.detectedComponents);
export const useConfirmedComponents = () => useAIProcessingStore(state => 
  state.detectedComponents.filter(c => c.confirmed)
);
export const useGeneratedPlacements = () => useAIProcessingStore(state => state.generatedPlacements);
export const useCanProceed = () => useAIProcessingStore(state => state.canProceedToNextStep());