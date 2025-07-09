-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'engineer', 'reviewer', 'viewer');

-- Create enum for project status
CREATE TYPE public.project_status AS ENUM ('draft', 'processing', 'review', 'approved', 'completed');

-- Create enum for file types
CREATE TYPE public.file_type AS ENUM ('contract_drawing', 'shop_drawing', 'submittal', 'specification', 'bim_model');

-- Create enum for processing status
CREATE TYPE public.processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  project_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'draft',
  owner_id UUID NOT NULL,
  team_members UUID[] DEFAULT '{}',
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create uploaded_files table
CREATE TABLE public.uploaded_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL,
  processing_status processing_status NOT NULL DEFAULT 'pending',
  metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for projects
CREATE POLICY "Users can view projects they own or are team members of" 
ON public.projects 
FOR SELECT 
USING (
  auth.uid() = owner_id OR 
  auth.uid() = ANY(team_members)
);

CREATE POLICY "Users can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update their projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete their projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Create policies for uploaded_files
CREATE POLICY "Users can view files from their projects" 
ON public.uploaded_files 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = uploaded_files.project_id 
    AND (projects.owner_id = auth.uid() OR auth.uid() = ANY(projects.team_members))
  )
);

CREATE POLICY "Users can upload files to their projects" 
ON public.uploaded_files 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = uploaded_files.project_id 
    AND (projects.owner_id = auth.uid() OR auth.uid() = ANY(projects.team_members))
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, company_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_team_members ON public.projects USING GIN(team_members);
CREATE INDEX idx_uploaded_files_project_id ON public.uploaded_files(project_id);
CREATE INDEX idx_uploaded_files_uploaded_by ON public.uploaded_files(uploaded_by);