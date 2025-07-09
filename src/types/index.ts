export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: 'admin' | 'engineer' | 'reviewer' | 'viewer';
  created_at: string;
  avatar_url?: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  project_number: string;
  client_name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'processing' | 'review' | 'approved' | 'completed';
  owner_id: string;
  team_members: string[];
  deadline?: string;
}

export interface UploadedFile {
  id: string;
  project_id: string;
  file_name: string;
  file_type: 'contract_drawing' | 'shop_drawing' | 'submittal' | 'specification' | 'bim_model';
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  role: 'admin' | 'engineer' | 'reviewer' | 'viewer';
}

export interface LoginData {
  email: string;
  password: string;
}