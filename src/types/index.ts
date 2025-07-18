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
  x: number;
  y: number;
  width: number;
  height: number;
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
  optimized?: boolean;
  zoneId?: string;
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

export interface BackingStandard {
  id: string;
  componentType: string;
  conditions: {
    weightMin?: number;
    weightMax?: number;
    widthMin?: number;
    widthMax?: number;
    custom?: string;
  };
  backing: {
    material: string;
    thickness: string;
    width: number;
    height: number;
    fasteners: string;
    spacing: number;
  };
  heightAFF: number;
  notes: string;
  images: string[];
  category: string;
  updatedAt: string;
  updatedBy: string;
}

// Measurement types
export interface Measurement {
  id: string;
  startPoint: Point;
  endPoint: Point;
  distance: number;
  createdAt: string;
}

export interface AppSettings {
  defaultStandards: 'custom' | 'commercial' | 'residential';
  units: 'imperial' | 'metric';
  gridSize: number;
  snapTolerance: number;
  autoSave: boolean;
  theme: 'dark' | 'light';
}

export interface AISettings {
  confidenceThresholds: Record<string, number>;
  enabledComponentTypes: string[];
  autoProcess: boolean;
  batchSize: number;
  qualityVsSpeed: number;
  ocrLanguage: string;
  enhancementFilters: boolean;
}

export interface TitleBlockConfig {
  template: string;
  fields: Record<string, string>;
  logoUrl?: string;
  position: 'bottom' | 'right';
}

export interface Point {
  x: number;
  y: number;
}

export interface Opening {
  id: string;
  type: 'door' | 'window' | 'opening';
  position: Point;
  width: number;
  height?: number;
}

export interface DoorOpening {
  id: string;
  wallId: string;
  position: Point;
  width: number;
  height: number;
  type: 'door' | 'window' | 'opening';
  swingDirection?: 'left' | 'right';
  clearanceRequired: number;
  confidence: number;
}

export interface DetectionResults {
  type: 'walls' | 'doors' | 'conflicts' | 'optimization';
  walls?: WallSegment[];
  doors?: DoorOpening[];
  conflicts?: Clash[];
  optimizedBackings?: BackingPlacement[];
}

export interface WallSegment {
  id: string;
  start: Point;
  end: Point;
  startPoint: Point;
  endPoint: Point;
  thickness: number;
  length: number;
  type: 'interior' | 'exterior' | 'partition';
  openings?: Opening[];
}

export interface Clash {
  id: string;
  type: 'backing_overlap' | 'door_swing' | 'window' | 'mep' | 'structural';
  severity: 'error' | 'warning';
  items: string[]; // IDs of clashing elements
  resolution?: string;
}

export interface Pattern {
  id: string;
  name: string;
  roomType: string;
  components: Array<{
    type: string;
    relativePosition: Point;
    backing: BackingRule;
  }>;
}

export interface ReviewComment {
  id: string;
  drawingId: string;
  position: Point;
  thread: CommentMessage[];
  status: 'open' | 'resolved';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentMessage {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  mentions: string[];
  attachments: string[];
}

export interface Change {
  id: string;
  timestamp: string;
  user: string;
  action: 'add' | 'modify' | 'delete';
  target: {
    type: 'backing' | 'dimension' | 'note' | 'comment';
    id: string;
  };
  before?: any;
  after?: any;
  reason?: string;
}

export interface Approval {
  id: string;
  reviewer: string;
  timestamp: string;
  status: 'approved' | 'rejected' | 'conditional';
  conditions?: string;
  signature: string;
  stampPosition?: Point;
}

export interface UserPresence {
  userId: string;
  userName: string;
  cursor?: Point;
  lastSeen: string;
  color: string;
}

export interface BackingZone {
  id: string;
  components: string[];
  combinedBacking: BackingPlacement;
  savings: {
    material: number;
    laborHours: number;
  };
  backings: BackingPlacement[];
  totalArea: number;
  materialType: string;
  bounds: {
    width: number;
    height: number;
  };
  center: Point;
}

export interface Dimension {
  id: string;
  start: Point;
  end: Point;
  value: number;
  label: string;
  type: 'linear' | 'radial' | 'angular';
}

// AI Processing Wizard Types (separate from existing types to avoid conflicts)
export interface AIDetectedComponent {
  id: string;
  type: string;
  confidence: number;
  position: Point;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  drawingId?: string;
  confirmed: boolean;
  needsBacking: boolean;
  properties?: Record<string, any>;
  text: string;
  location: string;
  pageNumber: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface AIBackingRule {
  id: string;
  name: string;
  componentTypes: string[];
  material: string;
  thickness: number;
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  margin: number;
  priority: number;
  conditions?: Record<string, any>;
}

export interface AIBackingPlacement {
  id: string;
  componentId: string;
  ruleId: string;
  position: Point;
  size: { width: number; height: number };
  material: string;
  thickness: number;
  notes?: string;
  drawingId: string;
}

export interface StandardDetail {
  id: string;
  name: string;
  description: string;
  category: 'tv_mount' | 'grab_bar' | 'cabinet' | 'equipment' | 'fixture' | 'structural';
  image?: string;
  dwgFile?: string;
  specifications: {
    backingType: string;
    dimensions: {
      width: number;
      height: number;
      thickness: number;
    };
    heightAFF: number;
    fasteners: string;
    spacing: number;
    loadRating: number; // lbs
    notes: string[];
  };
  applicability: {
    componentTypes: string[];
    weightRange: { min: number; max: number };
    sizeRange: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
    wallTypes: string[];
  };
  references: {
    code?: string;
    standard?: string;
    manufacturer?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Professional drawing elements
export interface ProfessionalDrawingElements {
  northArrow: {
    enabled: boolean;
    position: Point;
    rotation: number;
    scale: number;
  };
  scaleBar: {
    enabled: boolean;
    position: Point;
    scale: number;
    units: 'imperial' | 'metric';
  };
  legend: {
    enabled: boolean;
    position: Point;
    backingTypes: Array<{
      type: string;
      color: string;
      description: string;
      count?: number;
    }>;
  };
  generalNotes: {
    enabled: boolean;
    position: Point;
    notes: string[];
    title?: string;
  };
  revisionTable: {
    enabled: boolean;
    position: Point;
    revisions: Array<{
      number: string;
      date: string;
      description: string;
      by: string;
    }>;
  };
}