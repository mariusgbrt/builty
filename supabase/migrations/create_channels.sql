-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel_type VARCHAR(20) NOT NULL CHECK (channel_type IN ('general', 'project')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure project channels have a project_id
  CONSTRAINT check_project_channel CHECK (
    (channel_type = 'project' AND project_id IS NOT NULL) OR
    (channel_type = 'general' AND project_id IS NULL)
  )
);

-- Create channel_members table (junction table for users and channels)
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only be in a channel once
  UNIQUE(channel_id, user_id)
);

-- Add channel_id to messages table
ALTER TABLE messages ADD COLUMN channel_id UUID REFERENCES channels(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_channels_company_id ON channels(company_id);
CREATE INDEX idx_channels_project_id ON channels(project_id);
CREATE INDEX idx_channels_type ON channels(channel_type);
CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX idx_messages_channel_id ON messages(channel_id);

-- Enable RLS on channels
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channels
CREATE POLICY "Users can view channels from their company where they are members"
  ON channels
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    AND id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can create channels"
  ON channels
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Company admins can update their channels"
  ON channels
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Company admins can delete their channels"
  ON channels
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Enable RLS on channel_members
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channel_members
CREATE POLICY "Users can view members of their channels"
  ON channel_members
  FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can add members"
  ON channel_members
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT cm.channel_id 
      FROM channel_members cm
      JOIN profiles p ON p.id = auth.uid()
      WHERE cm.user_id = auth.uid() 
      AND (cm.role = 'admin' OR p.role = 'Admin')
    )
  );

CREATE POLICY "Channel admins can remove members"
  ON channel_members
  FOR DELETE
  USING (
    channel_id IN (
      SELECT cm.channel_id 
      FROM channel_members cm
      JOIN profiles p ON p.id = auth.uid()
      WHERE cm.user_id = auth.uid() 
      AND (cm.role = 'admin' OR p.role = 'Admin')
    )
  );

-- Update RLS policies for messages to check channel membership
DROP POLICY IF EXISTS "Users can view messages from their company" ON messages;
CREATE POLICY "Users can view messages from channels they belong to"
  ON messages
  FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages for their company" ON messages;
CREATE POLICY "Users can insert messages in channels they belong to"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

-- Function to create general channel for a company
CREATE OR REPLACE FUNCTION create_general_channel_for_company()
RETURNS TRIGGER AS $$
DECLARE
  new_channel_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get the first admin of the company (usually the creator)
  SELECT id INTO admin_user_id
  FROM profiles
  WHERE company_id = NEW.id AND role = 'Admin'
  LIMIT 1;

  -- Create general channel
  INSERT INTO channels (company_id, name, description, channel_type, created_by)
  VALUES (NEW.id, 'Général', 'Canal de discussion générale pour toute l''équipe', 'general', admin_user_id)
  RETURNING id INTO new_channel_id;

  -- Add all company members to the general channel
  INSERT INTO channel_members (channel_id, user_id, role)
  SELECT new_channel_id, p.id, CASE WHEN p.role = 'Admin' THEN 'admin' ELSE 'member' END
  FROM profiles p
  WHERE p.company_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create general channel when a company is created
-- Note: This will only work for NEW companies. For existing companies, you'll need to run a manual migration.
CREATE TRIGGER create_general_channel_on_company_creation
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION create_general_channel_for_company();

-- Function to create channel when a project is created
CREATE OR REPLACE FUNCTION create_channel_for_project()
RETURNS TRIGGER AS $$
DECLARE
  new_channel_id UUID;
BEGIN
  -- Create project channel
  INSERT INTO channels (company_id, name, description, channel_type, project_id, created_by)
  VALUES (
    NEW.company_id,
    'Chantier: ' || NEW.name,
    'Canal de discussion pour le chantier ' || NEW.name,
    'project',
    NEW.id,
    auth.uid()
  )
  RETURNING id INTO new_channel_id;

  -- Add all company admins to the project channel by default
  INSERT INTO channel_members (channel_id, user_id, role)
  SELECT new_channel_id, p.id, 'admin'
  FROM profiles p
  WHERE p.company_id = NEW.company_id AND p.role = 'Admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create channel when a project is created
CREATE TRIGGER create_channel_on_project_creation
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_channel_for_project();

-- Function to add new company member to general channel
CREATE OR REPLACE FUNCTION add_member_to_general_channel()
RETURNS TRIGGER AS $$
DECLARE
  general_channel_id UUID;
BEGIN
  -- Get the general channel for the company
  SELECT id INTO general_channel_id
  FROM channels
  WHERE company_id = NEW.company_id AND channel_type = 'general'
  LIMIT 1;

  -- Add the new member to the general channel
  IF general_channel_id IS NOT NULL THEN
    INSERT INTO channel_members (channel_id, user_id, role)
    VALUES (general_channel_id, NEW.id, CASE WHEN NEW.role = 'Admin' THEN 'admin' ELSE 'member' END)
    ON CONFLICT (channel_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add new member to general channel
CREATE TRIGGER add_new_member_to_general_channel
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION add_member_to_general_channel();

-- Function to update channels updated_at timestamp
CREATE OR REPLACE FUNCTION update_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update channels updated_at
CREATE TRIGGER channels_updated_at_trigger
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_channels_updated_at();

-- Enable realtime for channels and channel_members tables
ALTER PUBLICATION supabase_realtime ADD TABLE channels;
ALTER PUBLICATION supabase_realtime ADD TABLE channel_members;

-- Manual migration for existing companies (create general channels)
-- This will create a general channel for all existing companies that don't have one
DO $$
DECLARE
  company_record RECORD;
  new_channel_id UUID;
BEGIN
  FOR company_record IN SELECT id FROM companies WHERE id NOT IN (SELECT DISTINCT company_id FROM channels WHERE channel_type = 'general')
  LOOP
    -- Create general channel
    INSERT INTO channels (company_id, name, description, channel_type)
    VALUES (company_record.id, 'Général', 'Canal de discussion générale pour toute l''équipe', 'general')
    RETURNING id INTO new_channel_id;

    -- Add all company members to the general channel
    INSERT INTO channel_members (channel_id, user_id, role)
    SELECT new_channel_id, p.id, CASE WHEN p.role = 'Admin' THEN 'admin' ELSE 'member' END
    FROM profiles p
    WHERE p.company_id = company_record.id;
  END LOOP;
END $$;

-- Manual migration for existing projects (create project channels)
-- This will create a project channel for all existing projects that don't have one
DO $$
DECLARE
  project_record RECORD;
  new_channel_id UUID;
BEGIN
  FOR project_record IN SELECT id, company_id, name FROM projects WHERE id NOT IN (SELECT DISTINCT project_id FROM channels WHERE channel_type = 'project' AND project_id IS NOT NULL)
  LOOP
    -- Create project channel
    INSERT INTO channels (company_id, name, description, channel_type, project_id)
    VALUES (
      project_record.company_id,
      'Chantier: ' || project_record.name,
      'Canal de discussion pour le chantier ' || project_record.name,
      'project',
      project_record.id
    )
    RETURNING id INTO new_channel_id;

    -- Add all company admins to the project channel
    INSERT INTO channel_members (channel_id, user_id, role)
    SELECT new_channel_id, p.id, 'admin'
    FROM profiles p
    WHERE p.company_id = project_record.company_id AND p.role = 'Admin';
  END LOOP;
END $$;
