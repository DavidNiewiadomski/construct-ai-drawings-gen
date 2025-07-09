export interface UploadedFile {
  id: string;
  filename: string;
  fileType: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model';
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  metadata?: {
    pageCount?: number;
    dimensions?: { width: number; height: number };
    scale?: string;
  };
}

export interface DetectedComponent {
  id: string;
  fileId: string;
  pageNumber: number;
  componentType: 'tv' | 'fire_extinguisher' | 'sink' | 'grab_bar' | 'cabinet' | 'equipment' | 'other';
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text: string;
  confidence: number;
  specifications?: Record<string, any>;
}

export interface BackingPlacement {
  id: string;
  componentId: string;
  backingType: '2x4' | '2x6' | '2x8' | '2x10' | '3/4_plywood' | 'steel_plate' | 'blocking';
  dimensions: {
    width: number;
    height: number;
    thickness: number;
  };
  location: {
    x: number;
    y: number;
    z: number; // height above floor
  };
  orientation: number; // rotation in degrees
  status: 'ai_generated' | 'user_modified' | 'approved';
}

export interface BackingRule {
  id: string;
  componentType: string;
  condition: {
    weightMin?: number;
    weightMax?: number;
    sizeMin?: number;
    sizeMax?: number;
  };
  backing: {
    type: string;
    width: number;
    height: number;
    heightAFF: number;
  };
  notes?: string;
}

export interface ProcessingStatus {
  stage: 'uploading' | 'detecting' | 'analyzing' | 'generating' | 'complete';
  progress: number;
  currentFile?: string;
  message?: string;
  errors?: string[];
}

export interface ExtractedRequirement {
  id: string;
  fileId: string;
  section: string;
  text: string;
  pageNumber: number;
  boundingBox: Rectangle;
  parsedValues?: {
    componentType?: string;
    backingType?: string;
    dimensions?: string;
    heightAFF?: number;
  };
  confidence: number;
  applied: boolean;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SearchResult {
  id: string;
  text: string;
  pageNumber: number;
  boundingBox: Rectangle;
  context: string;
}