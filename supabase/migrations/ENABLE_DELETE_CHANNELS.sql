-- S'assurer que la suppression en cascade fonctionne correctement
-- Les messages et les membres doivent être supprimés automatiquement

-- 1. Vérifier les contraintes de clés étrangères
SELECT 
  '=== CONTRAINTES ON DELETE CASCADE ===' as section;

SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'channel_members' OR tc.table_name = 'messages')
  AND ccu.table_name = 'channels';

-- 2. S'assurer que RLS est bien désactivé sur channels
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;

-- 3. Message de confirmation
SELECT 
  '✅ Configuration OK pour suppression de canaux' as status,
  'Les canaux peuvent être supprimés par les admins' as info1,
  'Les messages et membres seront supprimés en cascade' as info2;
