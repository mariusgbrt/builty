-- ============================================
-- SCRIPT DE DIAGNOSTIC COMPLET
-- Exécutez ce script pour voir EXACTEMENT ce qui se passe
-- ============================================

-- 1. Voir tous les canaux créés
SELECT 
  '=== CANAUX CRÉÉS ===' as section;

SELECT 
  id,
  name,
  channel_type,
  company_id,
  created_by,
  created_at
FROM channels
ORDER BY created_at DESC;

-- 2. Voir tous les membres des canaux
SELECT 
  '=== MEMBRES DES CANAUX ===' as section;

SELECT 
  c.name as canal_name,
  c.channel_type,
  cm.user_id,
  up.full_name as membre_nom,
  cm.role as role_canal,
  cm.joined_at
FROM channels c
LEFT JOIN channel_members cm ON c.id = cm.channel_id
LEFT JOIN user_profiles up ON cm.user_id = up.id
ORDER BY c.created_at DESC, cm.role DESC;

-- 3. Voir votre profil utilisateur actuel
SELECT 
  '=== VOTRE PROFIL ===' as section;

SELECT 
  id,
  email,
  full_name,
  company_id,
  role
FROM user_profiles
WHERE id = auth.uid();

-- 4. Compter les canaux par type
SELECT 
  '=== RÉSUMÉ PAR TYPE ===' as section;

SELECT 
  channel_type,
  COUNT(*) as nombre
FROM channels
GROUP BY channel_type;

-- 5. Voir les canaux SANS membres
SELECT 
  '=== CANAUX SANS MEMBRES (PROBLÈME) ===' as section;

SELECT 
  c.id,
  c.name,
  c.channel_type
FROM channels c
WHERE NOT EXISTS (
  SELECT 1 FROM channel_members cm WHERE cm.channel_id = c.id
);

-- 6. Voir les membres de canaux qui n'existent pas (orphelins)
SELECT 
  '=== MEMBRES ORPHELINS (PROBLÈME) ===' as section;

SELECT 
  cm.channel_id,
  cm.user_id,
  up.full_name
FROM channel_members cm
LEFT JOIN user_profiles up ON cm.user_id = up.id
WHERE NOT EXISTS (
  SELECT 1 FROM channels c WHERE c.id = cm.channel_id
);

-- 7. Voir combien de canaux VOUS devriez voir
SELECT 
  '=== CANAUX AUXQUELS VOUS APPARTENEZ ===' as section;

SELECT 
  c.name,
  c.channel_type,
  cm.role
FROM channels c
JOIN channel_members cm ON c.id = cm.channel_id
WHERE cm.user_id = auth.uid()
ORDER BY c.channel_type, c.name;

-- 8. Compter tout
SELECT 
  '=== COMPTEURS FINAUX ===' as section;

SELECT 
  (SELECT COUNT(*) FROM channels) as total_canaux,
  (SELECT COUNT(*) FROM channel_members) as total_membres,
  (SELECT COUNT(DISTINCT channel_id) FROM channel_members WHERE user_id = auth.uid()) as vos_canaux;
