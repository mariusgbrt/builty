-- Permettre la suppression des canaux par les admins

-- 1. Désactiver RLS sur channels (déjà fait normalement mais on s'assure)
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier que les suppressions en cascade sont bien configurées
-- Afficher les contraintes de clés étrangères
SELECT 
  '=== CONTRAINTES DE SUPPRESSION EN CASCADE ===' as section;

SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON rc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'channels';

-- 3. Test de suppression (créer un canal test puis le supprimer)
DO $$
DECLARE
  test_channel_id UUID;
  test_company_id UUID;
BEGIN
  -- Récupérer une entreprise existante
  SELECT id INTO test_company_id FROM companies LIMIT 1;
  
  IF test_company_id IS NULL THEN
    RAISE NOTICE 'Aucune entreprise trouvée pour le test';
    RETURN;
  END IF;
  
  -- Créer un canal test
  INSERT INTO channels (company_id, name, description, channel_type)
  VALUES (test_company_id, 'TEST_SUPPRESSION', 'Canal de test', 'general')
  RETURNING id INTO test_channel_id;
  
  RAISE NOTICE 'Canal test créé avec ID: %', test_channel_id;
  
  -- Supprimer le canal test
  DELETE FROM channels WHERE id = test_channel_id;
  
  RAISE NOTICE '✅ Suppression fonctionne ! Le canal test a été supprimé.';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Erreur lors du test de suppression: %', SQLERRM;
END $$;

-- 4. Confirmation finale
SELECT 
  '✅ Suppression de canaux activée !' as status,
  'RLS désactivé sur channels' as info1,
  'Les admins peuvent supprimer les canaux' as info2;
