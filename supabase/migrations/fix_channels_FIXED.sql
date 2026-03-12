-- Script de réparation des canaux - Compatible avec user_profiles ou profiles

-- Déterminer quelle table utiliser
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

-- 1. Créer le canal général pour TOUTES les entreprises qui n'en ont pas
DO $$
DECLARE
  company_record RECORD;
  new_channel_id UUID;
  admin_user_id UUID;
  profile_table TEXT;
BEGIN
  -- Déterminer la table à utiliser
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    profile_table := 'user_profiles';
  ELSE
    profile_table := 'profiles';
  END IF;

  FOR company_record IN 
    SELECT DISTINCT c.id, c.name
    FROM companies c
    WHERE NOT EXISTS (
      SELECT 1 FROM channels ch 
      WHERE ch.company_id = c.id 
      AND ch.channel_type = 'general'
    )
  LOOP
    RAISE NOTICE 'Création du canal général pour l''entreprise: %', company_record.name;
    
    -- Récupérer un admin de l'entreprise
    EXECUTE format('SELECT id FROM %I WHERE company_id = $1 AND role = $2 LIMIT 1', profile_table)
    INTO admin_user_id
    USING company_record.id, 'Admin';
    
    -- Créer le canal général
    INSERT INTO channels (company_id, name, description, channel_type, created_by)
    VALUES (
      company_record.id, 
      'Général', 
      'Canal de discussion générale pour toute l''équipe', 
      'general',
      admin_user_id
    )
    RETURNING id INTO new_channel_id;
    
    RAISE NOTICE 'Canal général créé avec l''ID: %', new_channel_id;
    
    -- Ajouter TOUS les membres de l'entreprise au canal général
    EXECUTE format('
      INSERT INTO channel_members (channel_id, user_id, role)
      SELECT $1, p.id, CASE WHEN p.role = $2 THEN $3 ELSE $4 END
      FROM %I p
      WHERE p.company_id = $5
    ', profile_table)
    USING new_channel_id, 'Admin', 'admin', 'member', company_record.id;
    
    RAISE NOTICE 'Membres ajoutés au canal général';
  END LOOP;
END $$;

-- 2. Créer des canaux pour TOUS les projets qui n'en ont pas
DO $$
DECLARE
  project_record RECORD;
  new_channel_id UUID;
  profile_table TEXT;
BEGIN
  -- Déterminer la table à utiliser
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    profile_table := 'user_profiles';
  ELSE
    profile_table := 'profiles';
  END IF;

  FOR project_record IN 
    SELECT p.id, p.company_id, p.name
    FROM projects p
    WHERE NOT EXISTS (
      SELECT 1 FROM channels ch 
      WHERE ch.project_id = p.id 
      AND ch.channel_type = 'project'
    )
  LOOP
    RAISE NOTICE 'Création du canal pour le chantier: %', project_record.name;
    
    -- Créer le canal du projet
    INSERT INTO channels (company_id, name, description, channel_type, project_id)
    VALUES (
      project_record.company_id,
      'Chantier: ' || project_record.name,
      'Canal de discussion pour le chantier ' || project_record.name,
      'project',
      project_record.id
    )
    RETURNING id INTO new_channel_id;
    
    RAISE NOTICE 'Canal créé avec l''ID: %', new_channel_id;
    
    -- Ajouter TOUS les admins au canal du projet
    EXECUTE format('
      INSERT INTO channel_members (channel_id, user_id, role)
      SELECT $1, p.id, $2
      FROM %I p
      WHERE p.company_id = $3 AND p.role = $4
    ', profile_table)
    USING new_channel_id, 'admin', project_record.company_id, 'Admin';
    
    RAISE NOTICE 'Admins ajoutés au canal du chantier';
  END LOOP;
END $$;

-- 3. Afficher un résumé
DO $$
DECLARE
  total_channels INTEGER;
  total_general INTEGER;
  total_project INTEGER;
  total_members INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_channels FROM channels;
  SELECT COUNT(*) INTO total_general FROM channels WHERE channel_type = 'general';
  SELECT COUNT(*) INTO total_project FROM channels WHERE channel_type = 'project';
  SELECT COUNT(*) INTO total_members FROM channel_members;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '=== RÉSUMÉ ===';
  RAISE NOTICE 'Total canaux: %', total_channels;
  RAISE NOTICE 'Canaux généraux: %', total_general;
  RAISE NOTICE 'Canaux chantiers: %', total_project;
  RAISE NOTICE 'Total membres dans les canaux: %', total_members;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUCCÈS ! Rafraîchissez votre application.';
  RAISE NOTICE '========================================';
END $$;

-- 4. Afficher les canaux créés
SELECT 
  c.id,
  c.name,
  c.channel_type,
  c.company_id,
  co.name as company_name,
  (SELECT COUNT(*) FROM channel_members WHERE channel_id = c.id) as member_count
FROM channels c
LEFT JOIN companies co ON c.company_id = co.id
ORDER BY c.channel_type, c.name;
