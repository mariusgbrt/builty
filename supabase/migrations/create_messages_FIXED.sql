-- Migration Messages - Compatible avec user_profiles ou profiles
-- Exécutez cette version si vous avez des erreurs avec "profiles"

-- Déterminer si on utilise 'profiles' ou 'user_profiles'
DO $$
DECLARE
  profile_table_name TEXT;
BEGIN
  -- Vérifier quelle table existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    profile_table_name := 'user_profiles';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    profile_table_name := 'profiles';
  ELSE
    RAISE EXCEPTION 'Aucune table profiles ou user_profiles trouvée. Exécutez d''abord 00_INIT_COMPLETE.sql';
  END IF;
  
  RAISE NOTICE 'Utilisation de la table: %', profile_table_name;
END $$;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file')),
  media_url TEXT,
  media_name TEXT,
  media_size INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la contrainte de clé étrangère dynamiquement
DO $$
DECLARE
  profile_table_name TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    profile_table_name := 'user_profiles';
  ELSE
    profile_table_name := 'profiles';
  END IF;
  
  -- Ajouter la contrainte si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey'
  ) THEN
    EXECUTE format('ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES %I(id) ON DELETE CASCADE', profile_table_name);
    RAISE NOTICE 'Contrainte ajoutée avec succès sur %', profile_table_name;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_company_id ON messages(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_company_created ON messages(company_id, created_at DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (utilise la fonction user_company_id() qui doit déjà exister)
CREATE POLICY "Users can view messages from their company"
  ON messages
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
      UNION ALL
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for their company"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
      UNION ALL
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (
    sender_id = auth.uid()
    AND
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
      UNION ALL
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  USING (
    sender_id = auth.uid()
    AND
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
      UNION ALL
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS messages_updated_at_trigger ON messages;
CREATE TRIGGER messages_updated_at_trigger
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

RAISE NOTICE '========================================';
RAISE NOTICE 'Table messages créée avec succès !';
RAISE NOTICE '========================================';
