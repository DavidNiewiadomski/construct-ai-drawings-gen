import { useNavigate } from 'react-router-dom';
import { ProcessingWizard } from '@/components/ai/ProcessingWizard';
import { AIDetectedComponent, AIBackingPlacement } from '@/types';
import { FileCard } from '@/stores/uploadStore';
import { useToast } from '@/hooks/use-toast';

export default function Process() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleWizardComplete = (data: {
    selectedFiles: FileCard[];
    detectedComponents: AIDetectedComponent[];
    backingPlacements: AIBackingPlacement[];
  }) => {
    // Save results to localStorage for the main editor
    localStorage.setItem('processedFiles', JSON.stringify(data.selectedFiles));
    localStorage.setItem('detectedComponents', JSON.stringify(data.detectedComponents));
    localStorage.setItem('generatedBackings', JSON.stringify(data.backingPlacements));
    
    toast({
      title: 'Processing Complete!',
      description: `Generated ${data.backingPlacements.length} backing placements from ${data.detectedComponents.length} components.`,
    });
    
    // Navigate to main editor with results
    navigate('/', { 
      state: { 
        backings: data.backingPlacements,
        components: data.detectedComponents,
        processedFiles: data.selectedFiles
      } 
    });
  };

  const handleWizardCancel = () => {
    navigate('/');
  };

  return (
    <ProcessingWizard 
      onComplete={handleWizardComplete}
      onCancel={handleWizardCancel}
    />
  );
}