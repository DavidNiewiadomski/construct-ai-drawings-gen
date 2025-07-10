-- Add specification support to the database

-- Add specification-related columns to uploaded_files if needed
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS is_specification boolean DEFAULT false;
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS spec_sections jsonb DEFAULT '[]';

-- Create table for extracted requirements
CREATE TABLE IF NOT EXISTS specification_requirements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id uuid NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    requirement_text text NOT NULL,
    spec_section text NOT NULL,
    page_number integer DEFAULT 1,
    component_type text,
    backing_type text,
    height_aff integer,
    weight_capacity integer,
    dimensions jsonb,
    notes text,
    confidence real DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    applied boolean DEFAULT false,
    applied_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on specification_requirements
ALTER TABLE specification_requirements ENABLE ROW LEVEL SECURITY;

-- Create policies for specification_requirements
CREATE POLICY "Users can view requirements for their project files"
    ON specification_requirements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM uploaded_files uf
            JOIN projects p ON uf.project_id = p.id
            WHERE uf.id = specification_requirements.file_id
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
        )
    );

CREATE POLICY "Users can create requirements for their project files"
    ON specification_requirements FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM uploaded_files uf
            JOIN projects p ON uf.project_id = p.id
            WHERE uf.id = specification_requirements.file_id
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
        )
    );

CREATE POLICY "Users can update requirements for their project files"
    ON specification_requirements FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM uploaded_files uf
            JOIN projects p ON uf.project_id = p.id
            WHERE uf.id = specification_requirements.file_id
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
        )
    );

-- Create table for backing rules with specification sources
CREATE TABLE IF NOT EXISTS backing_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    component_type text NOT NULL,
    backing_type text NOT NULL,
    height_aff integer NOT NULL DEFAULT 48,
    weight_min integer,
    weight_max integer,
    width_min integer,
    width_max integer,
    conditions text,
    notes text,
    source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'specification', 'ai_generated', 'standard')),
    source_reference text, -- spec section, standard code, etc.
    requirement_id uuid REFERENCES specification_requirements(id) ON DELETE SET NULL,
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on backing_rules
ALTER TABLE backing_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for backing_rules
CREATE POLICY "Users can view rules for their projects"
    ON backing_rules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = backing_rules.project_id
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
        )
    );

CREATE POLICY "Users can create rules for their projects"
    ON backing_rules FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = backing_rules.project_id
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
        )
    );

CREATE POLICY "Users can update rules for their projects"
    ON backing_rules FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = backing_rules.project_id
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_specification_requirements_file_id ON specification_requirements(file_id);
CREATE INDEX IF NOT EXISTS idx_specification_requirements_applied ON specification_requirements(applied);
CREATE INDEX IF NOT EXISTS idx_backing_rules_project_id ON backing_rules(project_id);
CREATE INDEX IF NOT EXISTS idx_backing_rules_component_type ON backing_rules(component_type);
CREATE INDEX IF NOT EXISTS idx_backing_rules_source_type ON backing_rules(source_type);

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER update_specification_requirements_updated_at
    BEFORE UPDATE ON specification_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_backing_rules_updated_at
    BEFORE UPDATE ON backing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();