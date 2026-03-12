-- CORRECTION : Supprimer les politiques RLS problématiques et les recréer correctement

-- 1. Supprimer toutes les politiques problématiques de channel_members
DROP POLICY IF EXISTS "Users can view members of their channels" ON channel_members;
DROP POLICY IF EXISTS "Admins can add members to channels" ON channel_members;
DROP POLICY IF EXISTS "Admins can remove members from channels" ON channel_members;

-- 2. Recréer les politiques SANS récursion

-- Politique SELECT : Un utilisateur peut voir les membres des canaux auxquels il appartient
CREATE POLICY "view_channel_members"
  ON channel_members FOR SELECT
  USING (
    -- Vérifier directement dans la table channel_members si l'utilisateur est membre
    EXISTS (
      SELECT 1 FROM channel_members cm2 
      WHERE cm2.channel_id = channel_members.channel_id 
      AND cm2.user_id = auth.uid()
    )
  );

-- Politique INSERT : Seuls les admins de l'entreprise peuvent ajouter des membres
CREATE POLICY "admin_add_members"
  ON channel_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN channels c ON c.id = channel_members.channel_id
      WHERE up.id = auth.uid() 
      AND up.company_id = c.company_id
      AND up.role = 'Admin'
    )
  );

-- Politique DELETE : Seuls les admins de l'entreprise peuvent retirer des membres
CREATE POLICY "admin_remove_members"
  ON channel_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN channels c ON c.id = channel_members.channel_id
      WHERE up.id = auth.uid() 
      AND up.company_id = c.company_id
      AND up.role = 'Admin'
    )
  );

-- 3. Vérification
SELECT 'Politiques RLS corrigées avec succès !' as result;
