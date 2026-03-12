-- Version SIMPLE - Création des tables channels et channel_members
-- Compatible avec votre structure existante

-- 1. Créer la table channels
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel_type VARCHAR(20) NOT NULL CHECK (channel_type IN ('general', 'project')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_project_channel CHECK (
    (channel_type = 'project' AND project_id IS NOT NULL) OR
    (channel_type = 'general' AND project_id IS NULL)
  )
);

-- 2. Créer la table channel_members
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- 3. Ajouter channel_id à messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES channels(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);

-- 4. Créer les index
CREATE INDEX IF NOT EXISTS idx_channels_company_id ON channels(company_id);
CREATE INDEX IF NOT EXISTS idx_channels_project_id ON channels(project_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);

-- 5. Activer RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour channels
CREATE POLICY "Users can view their company channels where they are members"
  ON channels FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    AND id IN (SELECT channel_id FROM channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can create channels"
  ON channels FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can update channels"
  ON channels FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can delete channels"
  ON channels FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 7. Politiques RLS pour channel_members
CREATE POLICY "Users can view members of their channels"
  ON channel_members FOR SELECT
  USING (
    channel_id IN (SELECT channel_id FROM channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can add members to channels"
  ON channel_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can remove members from channels"
  ON channel_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- 8. Mettre à jour les politiques messages pour utiliser channel_id
DROP POLICY IF EXISTS "Users can view messages from their company" ON messages;
CREATE POLICY "Users can view messages from their channels"
  ON messages FOR SELECT
  USING (
    channel_id IN (SELECT channel_id FROM channel_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert messages in their company" ON messages;
CREATE POLICY "Users can insert messages in their channels"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND channel_id IN (SELECT channel_id FROM channel_members WHERE user_id = auth.uid())
  );

-- 9. Triggers
CREATE OR REPLACE FUNCTION update_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER channels_updated_at_trigger
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_channels_updated_at();

-- 10. Activer Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE channels;
ALTER PUBLICATION supabase_realtime ADD TABLE channel_members;

SELECT 'Tables channels et channel_members créées avec succès !' as result;
