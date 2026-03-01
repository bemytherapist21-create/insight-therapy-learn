
-- Create storage bucket for data files
INSERT INTO storage.buckets (id, name, public) VALUES ('data-files', 'data-files', false);

-- RLS policies for data-files bucket
CREATE POLICY "Users can upload their own data files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'data-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own data files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'data-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own data files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'data-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create data_analyses table
CREATE TABLE public.data_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  parsed_structure JSONB,
  column_definitions JSONB,
  business_context JSONB,
  insights JSONB,
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can create their own analyses"
ON public.data_analyses FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own analyses"
ON public.data_analyses FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own analyses"
ON public.data_analyses FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own analyses"
ON public.data_analyses FOR DELETE
TO authenticated
USING (user_id = auth.uid()::text);
