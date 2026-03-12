-- Corriger les politiques de storage pour message-media et project-photos

-- 1. Supprimer toutes les politiques existantes sur storage.objects
DROP POLICY IF EXISTS "Users can upload to message-media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view message-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their message-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their message-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to project-photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their project-photos" ON storage.objects;

-- 2. Créer des politiques TRÈS PERMISSIVES pour message-media
CREATE POLICY "message_media_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'message-media');

CREATE POLICY "message_media_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'message-media');

CREATE POLICY "message_media_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'message-media');

CREATE POLICY "message_media_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'message-media');

-- 3. Créer des politiques TRÈS PERMISSIVES pour project-photos
CREATE POLICY "project_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-photos');

CREATE POLICY "project_photos_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-photos');

CREATE POLICY "project_photos_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-photos');

CREATE POLICY "project_photos_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-photos');

-- 4. Vérifier que les buckets sont bien publics
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('message-media', 'project-photos');

-- 5. Confirmation
SELECT 
  '✅ Politiques de storage créées !' as status,
  'Vous pouvez maintenant uploader des photos et vidéos' as message;

-- 6. Afficher les buckets
SELECT 
  id as bucket_name,
  public,
  file_size_limit
FROM storage.buckets
WHERE id IN ('message-media', 'project-photos');
