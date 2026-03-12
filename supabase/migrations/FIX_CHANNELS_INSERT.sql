-- CORRECTION : Politique RLS trop stricte sur la table channels
-- Permettre aux admins de créer des canaux

-- 1. Supprimer les politiques INSERT existantes sur channels
DROP POLICY IF EXISTS "Admins can create channels" ON channels;
DROP POLICY IF EXISTS "Company admins can create channels" ON channels;

-- 2. Créer une politique INSERT plus permissive
CREATE POLICY "allow_admin_create_channels"
  ON channels FOR INSERT
  WITH CHECK (
    -- L'utilisateur doit être admin de l'entreprise
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND company_id = channels.company_id
      AND role = 'Admin'
    )
  );

-- 3. Vérifier que les autres politiques sont correctes
DROP POLICY IF EXISTS "Users can view their company channels where they are members" ON channels;
DROP POLICY IF EXISTS "Users can view channels from their company where they are members" ON channels;

CREATE POLICY "allow_view_user_channels"
  ON channels FOR SELECT
  USING (
    -- L'utilisateur doit être membre du canal
    is_user_in_channel(id)
  );

-- 4. Politiques UPDATE et DELETE pour admins
DROP POLICY IF EXISTS "Admins can update channels" ON channels;
DROP POLICY IF EXISTS "Company admins can update their channels" ON channels;

CREATE POLICY "allow_admin_update_channels"
  ON channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND company_id = channels.company_id
      AND role = 'Admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete channels" ON channels;
DROP POLICY IF EXISTS "Company admins can delete their channels" ON channels;

CREATE POLICY "allow_admin_delete_channels"
  ON channels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND company_id = channels.company_id
      AND role = 'Admin'
    )
  );

-- 5. Vérification
SELECT 'Politiques RLS de channels corrigées !' as result;
