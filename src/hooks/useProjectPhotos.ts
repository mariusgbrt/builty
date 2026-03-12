import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface ProjectPhoto {
  id: string;
  project_id: string;
  company_id: string;
  file_url: string;
  file_name: string;
  description: string | null;
  uploaded_by: string;
  created_at: string;
}

export function useProjectPhotos(projectId: string) {
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { profile } = useAuth();

  const fetchPhotos = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_photos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err: any) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [projectId]);

  const uploadPhoto = async (file: File, description?: string) => {
    if (!profile?.company_id || !profile?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-photos')
        .getPublicUrl(fileName);

      // Save to database
      const { data, error } = await supabase
        .from('project_photos')
        .insert({
          project_id: projectId,
          company_id: profile.company_id,
          file_url: publicUrl,
          file_name: file.name,
          description: description || null,
          uploaded_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      setPhotos((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/project-photos/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabase.storage.from('project-photos').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('project_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      throw err;
    }
  };

  const sendPhotosToClient = async (photoIds: string[], clientEmail: string, clientName: string, projectName: string) => {
    try {
      const selectedPhotos = photos.filter((p) => photoIds.includes(p.id));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-project-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          clientEmail,
          clientName,
          projectName,
          photos: selectedPhotos.map((p) => ({
            url: p.file_url,
            fileName: p.file_name,
            description: p.description,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send photos');
      }

      return await response.json();
    } catch (err: any) {
      console.error('Error sending photos:', err);
      throw err;
    }
  };

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    deletePhoto,
    sendPhotosToClient,
    refreshPhotos: fetchPhotos,
  };
}
