-- Script de vérification et réparation des canaux
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier si les tables existent
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'channels') THEN
        RAISE NOTICE 'ERREUR: La table channels n''existe pas. Exécutez d''abord create_channels.sql';
    ELSE
        RAISE NOTICE 'OK: La table channels existe';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'channel_members') THEN
        RAISE NOTICE 'ERREUR: La table channel_members n''existe pas. Exécutez d''abord create_channels.sql';
    ELSE
        RAISE NOTICE 'OK: La table channel_members existe';
    END IF;
END $$;

-- 2. Créer le canal général pour TOUTES les entreprises qui n'en ont pas
DO $$
DECLARE
  company_record RECORD;
  new_channel_id UUID;
  admin_user_id UUID;
BEGIN
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
    SELECT id INTO admin_user_id
    FROM profiles
    WHERE company_id = company_record.id AND role = 'Admin'
    LIMIT 1;
    
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
    INSERT INTO channel_members (channel_id, user_id, role)
    SELECT 
      new_channel_id, 
      p.id, 
      CASE WHEN p.role = 'Admin' THEN 'admin' ELSE 'member' END
    FROM profiles p
    WHERE p.company_id = company_record.id;
    
    RAISE NOTICE 'Membres ajoutés au canal général';
  END LOOP;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Toutes les entreprises ont déjà un canal général';
  END IF;
END $$;

-- 3. Créer des canaux pour TOUS les projets qui n'en ont pas
DO $$
DECLARE
  project_record RECORD;
  new_channel_id UUID;
BEGIN
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
    INSERT INTO channel_members (channel_id, user_id, role)
    SELECT 
      new_channel_id, 
      p.id, 
      'admin'
    FROM profiles p
    WHERE p.company_id = project_record.company_id 
    AND p.role = 'Admin';
    
    RAISE NOTICE 'Admins ajoutés au canal du chantier';
  END LOOP;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Tous les projets ont déjà un canal';
  END IF;
END $$;

-- 4. Afficher un résumé
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
  
  RAISE NOTICE '=== RÉSUMÉ ===';
  RAISE NOTICE 'Total canaux: %', total_channels;
  RAISE NOTICE 'Canaux généraux: %', total_general;
  RAISE NOTICE 'Canaux chantiers: %', total_project;
  RAISE NOTICE 'Total membres dans les canaux: %', total_members;
END $$;

-- 5. Afficher les canaux créés (pour vérification)
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
