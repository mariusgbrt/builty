import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Upload, Trash2, Send, Image as ImageIcon, Check, X } from 'lucide-react';
import { useProjectPhotos } from '../../hooks/useProjectPhotos';
import { ProjectWithClient } from '../../hooks/useProjects';
import { supabase } from '../../lib/supabase';

interface ProjectPhotosGalleryProps {
  project: ProjectWithClient;
}

export function ProjectPhotosGallery({ project }: ProjectPhotosGalleryProps) {
  const { photos, loading, uploading, uploadPhoto, deletePhoto, sendPhotosToClient } = useProjectPhotos(project.id);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadPhoto(files[i]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'upload');
    }
  };

  const handleDelete = async (photoId: string, fileUrl: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      await deletePhoto(photoId, fileUrl);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const selectAll = () => {
    setSelectedPhotos(photos.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedPhotos([]);
  };

  const handleSendToClient = async () => {
    if (selectedPhotos.length === 0) {
      alert('Veuillez sélectionner au moins une photo');
      return;
    }

    if (!project.client_id) {
      alert('Ce chantier n\'a pas de client associé');
      return;
    }

    try {
      setSending(true);

      // Fetch client email from database
      const { data: client, error } = await supabase
        .from('clients')
        .select('email, name')
        .eq('id', project.client_id)
        .single();

      if (error) throw error;

      if (!client?.email) {
        alert('Ce client n\'a pas d\'adresse email enregistrée. Veuillez l\'ajouter dans la fiche client.');
        return;
      }

      await sendPhotosToClient(
        selectedPhotos,
        client.email,
        client.name,
        project.name
      );
      
      alert(`${selectedPhotos.length} photo(s) envoyée(s) avec succès à ${client.name} (${client.email})`);
      setSelectedPhotos([]);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-builty-gray-light">Chargement des photos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-builty-blue/10 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-builty-blue" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-builty-gray">Galerie photos</h4>
            <p className="text-sm text-builty-gray-light">
              {photos.length} photo{photos.length > 1 ? 's' : ''}
              {selectedPhotos.length > 0 && ` • ${selectedPhotos.length} sélectionnée${selectedPhotos.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {photos.length > 0 && (
            <>
              {selectedPhotos.length === photos.length ? (
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  <X className="h-4 w-4 mr-2" />
                  Désélectionner tout
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={selectAll}>
                  <Check className="h-4 w-4 mr-2" />
                  Tout sélectionner
                </Button>
              )}

              {selectedPhotos.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleSendToClient}
                  disabled={sending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Envoi...' : `Envoyer au client (${selectedPhotos.length})`}
                </Button>
              )}
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Upload...' : 'Ajouter des photos'}
          </Button>
        </div>
      </div>

      {/* Galerie */}
      {photos.length === 0 ? (
        <div className="py-16 text-center bg-builty-gray-lighter rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-builty-gray-light" />
          </div>
          <p className="text-builty-gray font-semibold mb-2">Aucune photo ajoutée</p>
          <p className="text-sm text-builty-gray-light mb-6">
            Ajoutez des photos pour suivre l'avancement du chantier
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Ajouter ma première photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const isSelected = selectedPhotos.includes(photo.id);

            return (
              <div
                key={photo.id}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-builty-blue shadow-lg scale-[0.98]'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Checkbox de sélection */}
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => togglePhotoSelection(photo.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-builty-blue text-white'
                        : 'bg-white/90 text-builty-gray-light hover:bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                </div>

                {/* Bouton supprimer */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(photo.id, photo.file_url)}
                    className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Image */}
                <div
                  className="aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => togglePhotoSelection(photo.id)}
                >
                  <img
                    src={photo.file_url}
                    alt={photo.file_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="p-3 bg-white">
                  <p className="text-xs font-semibold text-builty-gray truncate">
                    {photo.file_name}
                  </p>
                  <p className="text-xs text-builty-gray-light mt-1">
                    {new Date(photo.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
