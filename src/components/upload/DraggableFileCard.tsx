import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { FilePreview } from './FilePreview';
import { FileCard } from '@/stores/uploadStore';
import { FileCardSkeleton } from './FileCardSkeleton';

interface DraggableFileCardProps {
  file: FileCard;
  onTypeChange: (id: string, type: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model') => void;
  onDelete: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function DraggableFileCard({ file, onTypeChange, onDelete, onDownload }: DraggableFileCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Show skeleton while generating thumbnail
  if (file.isGeneratingThumbnail) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="animate-fade-in"
      >
        <FileCardSkeleton />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        animate-fade-in hover-scale group relative
        ${isDragging ? 'opacity-50 scale-105 shadow-lg z-50' : ''}
        transition-all duration-200
      `}
      {...attributes}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing"
      >
        <div className="bg-background/80 backdrop-blur-sm rounded p-1 shadow-sm border">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      <div className="hover:shadow-md transition-shadow duration-200">
        <FilePreview
          file={{
            name: file.name,
            url: URL.createObjectURL(file.file),
            type: file.file.type,
            size: file.size
          }}
          type={file.type}
          status={file.status}
          uploadProgress={file.uploadProgress}
          error={file.error}
          pages={file.pages}
          onTypeChange={(newType) => onTypeChange(file.id, newType)}
          onDelete={() => onDelete(file.id)}
          onDownload={onDownload ? () => onDownload(file.id) : undefined}
        />
      </div>
    </div>
  );
}