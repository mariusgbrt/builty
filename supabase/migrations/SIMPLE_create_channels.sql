-- Version SIMPLE - Créer les canaux pour les données existantes

-- 1. Créer le canal général pour chaque entreprise
INSERT INTO channels (company_id, name, description, channel_type, created_by)
SELECT 
  c.id,
  'Général',
  'Canal de discussion générale pour toute l''équipe',
  'general',
  (SELECT id FROM user_profiles WHERE company_id = c.id AND role = 'Admin' LIMIT 1)
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM channels WHERE company_id = c.id AND channel_type = 'general'
);

-- 2. Ajouter tous les membres au canal général
INSERT INTO channel_members (channel_id, user_id, role)
SELECT 
  ch.id,
  up.id,
  CASE WHEN up.role = 'Admin' THEN 'admin' ELSE 'member' END
FROM channels ch
CROSS JOIN user_profiles up
WHERE ch.channel_type = 'general'
  AND ch.company_id = up.company_id
  AND NOT EXISTS (
    SELECT 1 FROM channel_members 
    WHERE channel_id = ch.id AND user_id = up.id
  );

-- 3. Créer un canal pour chaque projet
INSERT INTO channels (company_id, name, description, channel_type, project_id, created_by)
SELECT 
  p.company_id,
  'Chantier: ' || p.name,
  'Canal de discussion pour le chantier ' || p.name,
  'project',
  p.id,
  (SELECT id FROM user_profiles WHERE company_id = p.company_id AND role = 'Admin' LIMIT 1)
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM channels WHERE project_id = p.id AND channel_type = 'project'
);

-- 4. Ajouter tous les admins aux canaux de projets
INSERT INTO channel_members (channel_id, user_id, role)
SELECT 
  ch.id,
  up.id,
  'admin'
FROM channels ch
CROSS JOIN user_profiles up
WHERE ch.channel_type = 'project'
  AND ch.company_id = up.company_id
  AND up.role = 'Admin'
  AND NOT EXISTS (
    SELECT 1 FROM channel_members 
    WHERE channel_id = ch.id AND user_id = up.id
  );

-- 5. Afficher un résumé
SELECT 
  'Canaux créés avec succès !' as message,
  (SELECT COUNT(*) FROM channels) as total_canaux,
  (SELECT COUNT(*) FROM channels WHERE channel_type = 'general') as canaux_generaux,
  (SELECT COUNT(*) FROM channels WHERE channel_type = 'project') as canaux_projets,
  (SELECT COUNT(*) FROM channel_members) as total_membres;
