-- CORRECTION : Ajouter automatiquement le créateur du canal comme membre
-- avec un TRIGGER sur la table channels

-- 1. Créer une fonction qui ajoute automatiquement le créateur comme admin du canal
CREATE OR REPLACE FUNCTION auto_add_channel_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Ajouter le créateur comme admin du canal
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO channel_members (channel_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'admin')
    ON CONFLICT (channel_id, user_id) DO NOTHING;
  END IF;
  
  -- Si c'est un canal général ou personnalisé, ajouter tous les membres de l'entreprise
  IF NEW.channel_type IN ('general') THEN
    INSERT INTO channel_members (channel_id, user_id, role)
    SELECT 
      NEW.id,
      up.id,
      CASE WHEN up.role = 'Admin' THEN 'admin' ELSE 'member' END
    FROM user_profiles up
    WHERE up.company_id = NEW.company_id
    ON CONFLICT (channel_id, user_id) DO NOTHING;
  END IF;
  
  -- Si c'est un canal de projet, ajouter tous les admins
  IF NEW.channel_type = 'project' THEN
    INSERT INTO channel_members (channel_id, user_id, role)
    SELECT 
      NEW.id,
      up.id,
      'admin'
    FROM user_profiles up
    WHERE up.company_id = NEW.company_id
    AND up.role = 'Admin'
    ON CONFLICT (channel_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger qui s'exécute après chaque création de canal
DROP TRIGGER IF EXISTS trigger_auto_add_channel_creator ON channels;
CREATE TRIGGER trigger_auto_add_channel_creator
  AFTER INSERT ON channels
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_channel_creator();

-- 3. Réparer les canaux existants sans membres
INSERT INTO channel_members (channel_id, user_id, role)
SELECT 
  c.id,
  c.created_by,
  'admin'
FROM channels c
WHERE c.created_by IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM channel_members cm 
  WHERE cm.channel_id = c.id 
  AND cm.user_id = c.created_by
)
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- 4. Pour les canaux généraux, ajouter tous les membres de l'entreprise
INSERT INTO channel_members (channel_id, user_id, role)
SELECT 
  c.id,
  up.id,
  CASE WHEN up.role = 'Admin' THEN 'admin' ELSE 'member' END
FROM channels c
CROSS JOIN user_profiles up
WHERE c.channel_type = 'general'
AND c.company_id = up.company_id
AND NOT EXISTS (
  SELECT 1 FROM channel_members cm 
  WHERE cm.channel_id = c.id 
  AND cm.user_id = up.id
)
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- 5. Pour les canaux de projets, ajouter tous les admins
INSERT INTO channel_members (channel_id, user_id, role)
SELECT 
  c.id,
  up.id,
  'admin'
FROM channels c
CROSS JOIN user_profiles up
WHERE c.channel_type = 'project'
AND c.company_id = up.company_id
AND up.role = 'Admin'
AND NOT EXISTS (
  SELECT 1 FROM channel_members cm 
  WHERE cm.channel_id = c.id 
  AND cm.user_id = up.id
)
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- 6. Afficher le résumé
SELECT 
  '✅ TRIGGER CRÉÉ !' as status,
  'Les futurs canaux ajouteront automatiquement leurs membres' as info1,
  'Les canaux existants ont été réparés' as info2;

-- 7. Afficher les canaux avec leurs membres
SELECT 
  c.name as canal,
  c.channel_type,
  COUNT(cm.id) as nb_membres
FROM channels c
LEFT JOIN channel_members cm ON c.id = cm.channel_id
GROUP BY c.id, c.name, c.channel_type
ORDER BY c.created_at DESC;
