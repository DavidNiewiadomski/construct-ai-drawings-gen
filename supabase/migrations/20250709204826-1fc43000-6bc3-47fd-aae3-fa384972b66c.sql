-- Create tables for collaboration and review features

-- Review comments table
CREATE TABLE public.review_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    drawing_id UUID NOT NULL REFERENCES public.uploaded_files(id) ON DELETE CASCADE,
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comment messages table (for threading)
CREATE TABLE public.comment_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.review_comments(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    author UUID NOT NULL,
    mentions UUID[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Change history table
CREATE TABLE public.change_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    drawing_id UUID NOT NULL REFERENCES public.uploaded_files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('add', 'modify', 'delete')),
    target_type TEXT NOT NULL CHECK (target_type IN ('backing', 'dimension', 'note', 'comment')),
    target_id TEXT NOT NULL,
    before_data JSONB,
    after_data JSONB,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approvals table
CREATE TABLE public.approvals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    drawing_id UUID NOT NULL REFERENCES public.uploaded_files(id) ON DELETE CASCADE,
    reviewer UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'conditional')),
    conditions TEXT,
    signature TEXT,
    stamp_position_x FLOAT,
    stamp_position_y FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_comments
CREATE POLICY "Users can view comments on their project files" 
ON public.review_comments 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.uploaded_files uf 
        JOIN public.projects p ON uf.project_id = p.id 
        WHERE uf.id = review_comments.drawing_id 
        AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    )
);

CREATE POLICY "Users can create comments on their project files" 
ON public.review_comments 
FOR INSERT 
WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM public.uploaded_files uf 
        JOIN public.projects p ON uf.project_id = p.id 
        WHERE uf.id = review_comments.drawing_id 
        AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    )
);

CREATE POLICY "Users can update their own comments" 
ON public.review_comments 
FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for comment_messages
CREATE POLICY "Users can view messages on accessible comments" 
ON public.comment_messages 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.review_comments rc 
        JOIN public.uploaded_files uf ON rc.drawing_id = uf.id 
        JOIN public.projects p ON uf.project_id = p.id 
        WHERE rc.id = comment_messages.comment_id 
        AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    )
);

CREATE POLICY "Users can create messages on accessible comments" 
ON public.comment_messages 
FOR INSERT 
WITH CHECK (
    auth.uid() = author AND
    EXISTS (
        SELECT 1 FROM public.review_comments rc 
        JOIN public.uploaded_files uf ON rc.drawing_id = uf.id 
        JOIN public.projects p ON uf.project_id = p.id 
        WHERE rc.id = comment_messages.comment_id 
        AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    )
);

-- RLS Policies for change_history
CREATE POLICY "Users can view change history for their projects" 
ON public.change_history 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.uploaded_files uf 
        JOIN public.projects p ON uf.project_id = p.id 
        WHERE uf.id = change_history.drawing_id 
        AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    )
);

CREATE POLICY "Users can create change history for their projects" 
ON public.change_history 
FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.uploaded_files uf 
        JOIN public.projects p ON uf.project_id = p.id 
        WHERE uf.id = change_history.drawing_id 
        AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    )
);

-- RLS Policies for approvals
CREATE POLICY "Users can view approvals for their projects" 
ON public.approvals 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.uploaded_files uf 
        JOIN public.projects p ON uf.project_id = p.id 
        WHERE uf.id = approvals.drawing_id 
        AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    )
);

CREATE POLICY "Users can create approvals for their projects" 
ON public.approvals 
FOR INSERT 
WITH CHECK (
    auth.uid() = reviewer AND
    EXISTS (
        SELECT 1 FROM public.uploaded_files uf 
        JOIN public.projects p ON uf.project_id = p.id 
        WHERE uf.id = approvals.drawing_id 
        AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.team_members))
    )
);

-- Create indexes for performance
CREATE INDEX idx_review_comments_drawing_id ON public.review_comments(drawing_id);
CREATE INDEX idx_comment_messages_comment_id ON public.comment_messages(comment_id);
CREATE INDEX idx_change_history_drawing_id ON public.change_history(drawing_id);
CREATE INDEX idx_approvals_drawing_id ON public.approvals(drawing_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_review_comments_updated_at
    BEFORE UPDATE ON public.review_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();