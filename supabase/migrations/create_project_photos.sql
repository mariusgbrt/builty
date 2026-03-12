-- Create project_photos table
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX idx_project_photos_company_id ON project_photos(company_id);
CREATE INDEX idx_project_photos_created_at ON project_photos(created_at DESC);

-- Enable RLS
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view photos from their company"
  ON project_photos
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their company projects"
  ON project_photos
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    AND
    project_id IN (
      SELECT id FROM projects WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own photos"
  ON project_photos
  FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    AND
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from their company"
  ON project_photos
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Create storage bucket for project photos (run this separately in Supabase dashboard or via SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);

-- Storage policies (to be added in Supabase dashboard Storage settings)
-- Policy for SELECT: 
--   Name: "Public Access"
--   Allowed operation: SELECT
--   Policy definition: true

-- Policy for INSERT:
--   Name: "Authenticated users can upload"
--   Allowed operation: INSERT
--   Policy definition: auth.role() = 'authenticated'

-- Policy for DELETE:
--   Name: "Users can delete their company photos"
--   Allowed operation: DELETE
--   Policy definition: (bucket_id = 'project-photos')
