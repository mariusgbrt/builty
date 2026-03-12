-- Migration Channels - Compatible avec user_profiles ou profiles
-- Exécutez cette version si vous avez des erreurs avec "profiles"

-- Vérification préalable
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    RAISE EXCEPTION 'La table messages n''existe pas. Exécutez d''abord create_messages_FIXED.sql';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    RAISE EXCEPTION 'La table projects n''existe pas. Exécutez d''abord 00_INIT_COMPLETE.sql';
  END IF;
  
  RAISE NOTICE 'Vérifications passées, création des canaux...';
END $$;

-- Déterminer le nom de la table profiles
DO $$
DECLARE
  profile_table_name TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    profile_table_name := 'user_profiles';
  ELSE
    profile_table_name := 'profiles';
  END IF;
  RAISE NOTICE 'Utilisation de la table: %', profile_table_name;
END $$;

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel_type VARCHAR(20) NOT NULL CHECK (channel_type IN ('general', 'project')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_project_channel CHECK (
    (channel_type = 'project' AND project_id IS NOT NULL) OR
    (channel_type = 'general' AND project_id IS NULL)
  )
);

-- Ajouter la contrainte created_by dynamiquement
DO $$
DECLARE
  profile_table_name TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    profile_table_name := 'user_profiles';
  ELSE
    profile_table_name := 'profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'channels_created_by_fkey'
  ) THEN
    EXECUTE format('ALTER TABLE channels ADD CONSTRAINT channels_created_by_fkey FOREIGN KEY (created_by) REFERENCES %I(id) ON DELETE SET NULL', profile_table_name);
  END IF;
END $$;

-- Create channel_members table
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Ajouter la contrainte user_id dynamiquement
DO $$
DECLARE
  profile_table_name TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    profile_table_name := 'user_profiles';
  ELSE
    profile_table_name := 'profiles';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'channel_members_user_id_fkey'
  ) THEN
    EXECUTE format('ALTER TABLE channel_members ADD CONSTRAINT channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES %I(id) ON DELETE CASCADE', profile_table_name);
  END IF;
END $$;

-- Add channel_id to messages table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'channel_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN channel_id UUID REFERENCES channels(id) ON DELETE CASCADE;
    RAISE NOTICE 'Colonne channel_id ajoutée à la table messages';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_channels_company_id ON channels(company_id);
CREATE INDEX IF NOT EXISTS idx_channels_project_id ON channels(project_id);
CREATE INDEX IF NOT EXISTS idx_channels_type ON channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);

-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channels (compatible avec profiles et user_profiles)
DROP POLICY IF EXISTS "Users can view channels from their company where they are members" ON channels;
CREATE POLICY "Users can view channels from their company where they are members"
  ON channels
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
      UNION ALL
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
    AND id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Company admins can create channels" ON channels;
CREATE POLICY "Company admins can create channels"
  ON channels
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
      UNION ALL
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

DROP POLICY IF EXISTS "Company admins can update their channels" ON channels;
CREATE POLICY "Company admins can update their channels"
  ON channels
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
      UNION ALL
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

DROP POLICY IF EXISTS "Company admins can delete their channels" ON channels;
CREATE POLICY "Company admins can delete their channels"
  ON channels
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
      UNION ALL
      SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- RLS Policies for channel_members
DROP POLICY IF EXISTS "Users can view members of their channels" ON channel_members;
CREATE POLICY "Users can view members of their channels"
  ON channel_members
  FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Channel admins can add members" ON channel_members;
CREATE POLICY "Channel admins can add members"
  ON channel_members
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT cm.channel_id 
      FROM channel_members cm
      LEFT JOIN user_profiles up ON up.id = auth.uid()
      LEFT JOIN profiles p ON p.id = auth.uid()
      WHERE cm.user_id = auth.uid() 
      AND (cm.role = 'admin' OR up.role = 'Admin' OR p.role = 'Admin')
    )
  );

DROP POLICY IF EXISTS "Channel admins can remove members" ON channel_members;
CREATE POLICY "Channel admins can remove members"
  ON channel_members
  FOR DELETE
  USING (
    channel_id IN (
      SELECT cm.channel_id 
      FROM channel_members cm
      LEFT JOIN user_profiles up ON up.id = auth.uid()
      LEFT JOIN profiles p ON p.id = auth.uid()
      WHERE cm.user_id = auth.uid() 
      AND (cm.role = 'admin' OR up.role = 'Admin' OR p.role = 'Admin')
    )
  );

-- Update RLS policies for messages to check channel membership
DROP POLICY IF EXISTS "Users can view messages from their company" ON messages;
DROP POLICY IF EXISTS "Users can view messages from channels they belong to" ON messages;
CREATE POLICY "Users can view messages from channels they belong to"
  ON messages
  FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages for their company" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in channels they belong to" ON messages;
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

-- Triggers
CREATE OR REPLACE FUNCTION update_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS channels_updated_at_trigger ON channels;
CREATE TRIGGER channels_updated_at_trigger
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_channels_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE channels;
ALTER PUBLICATION supabase_realtime ADD TABLE channel_members;

RAISE NOTICE '========================================';
RAISE NOTICE 'Tables channels et channel_members créées avec succès !';
RAISE NOTICE 'Prochaine étape: Exécutez fix_channels_FIXED.sql';
RAISE NOTICE '========================================';
