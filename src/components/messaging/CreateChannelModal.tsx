import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Hash, HardHat } from 'lucide-react';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: () => void;
}

export function CreateChannelModal({ isOpen, onClose, onChannelCreated }: CreateChannelModalProps) {
  const { profile } = useAuth();
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelType, setChannelType] = useState<'general' | 'project' | 'custom'>('custom');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (isOpen && channelType === 'project') {
      fetchProjects();
    }
  }, [isOpen, channelType]);

  const fetchProjects = async () => {
    if (!profile?.company_id) return;

    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', profile.company_id)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.company_id || !profile?.id) {
      alert('Erreur: Utilisateur non authentifié');
      return;
    }

    if (!channelName.trim()) {
      alert('Veuillez entrer un nom de canal');
      return;
    }

    if (channelType === 'project' && !selectedProjectId) {
      alert('Veuillez sélectionner un chantier');
      return;
    }

    try {
      setLoading(true);

      // Créer le canal
      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .insert({
          company_id: profile.company_id,
          name: channelName.trim(),
          description: channelDescription.trim() || null,
          channel_type: channelType === 'custom' ? 'general' : channelType,
          project_id: channelType === 'project' ? selectedProjectId : null,
          created_by: profile.id,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Attendre un peu pour que le canal soit bien créé
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ajouter le créateur comme admin du canal (avec protection contre doublons)
      const { error: memberError } = await supabase
        .from('channel_members')
        .upsert({
          channel_id: channelData.id,
          user_id: profile.id,
          role: 'admin',
        }, {
          onConflict: 'channel_id,user_id',
          ignoreDuplicates: true
        });

      if (memberError && !memberError.message.includes('duplicate')) {
        console.error('Error adding creator:', memberError);
      }

      // Si c'est un canal général ou custom, ajouter tous les membres de l'entreprise
      if (channelType !== 'project') {
        // Récupérer tous les membres
        const { data: companyMembers, error: membersError } = await supabase
          .from('user_profiles')
          .select('id, role')
          .eq('company_id', profile.company_id);

        if (!membersError && companyMembers && companyMembers.length > 0) {
          const memberInserts = companyMembers.map((member) => ({
            channel_id: channelData.id,
            user_id: member.id,
            role: member.role === 'Admin' ? 'admin' : 'member',
          }));

          await supabase
            .from('channel_members')
            .upsert(memberInserts, {
              onConflict: 'channel_id,user_id',
              ignoreDuplicates: true
            });
        }
      } else {
        // Pour un canal de projet, ajouter tous les admins
        const { data: admins, error: adminsError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('company_id', profile.company_id)
          .eq('role', 'Admin');

        if (!adminsError && admins && admins.length > 0) {
          const adminInserts = admins.map((admin) => ({
            channel_id: channelData.id,
            user_id: admin.id,
            role: 'admin',
          }));

          await supabase
            .from('channel_members')
            .upsert(adminInserts, {
              onConflict: 'channel_id,user_id',
              ignoreDuplicates: true
            });
        }
      }

      alert('Canal créé avec succès !');
      onChannelCreated();
      handleClose();
    } catch (err: any) {
      console.error('Error creating channel:', err);
      alert(err.message || 'Erreur lors de la création du canal');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChannelName('');
    setChannelDescription('');
    setChannelType('custom');
    setSelectedProjectId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Créer un nouveau canal">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Channel Type */}
        <div>
          <label className="block text-sm font-bold text-builty-gray mb-3">
            Type de canal
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setChannelType('custom')}
              className={`p-4 rounded-xl border-2 transition-all ${
                channelType === 'custom'
                  ? 'border-builty-blue bg-builty-blue/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Hash className={`h-6 w-6 mx-auto mb-2 ${
                channelType === 'custom' ? 'text-builty-blue' : 'text-builty-gray-light'
              }`} />
              <p className={`text-sm font-semibold ${
                channelType === 'custom' ? 'text-builty-blue' : 'text-builty-gray'
              }`}>
                Personnalisé
              </p>
            </button>

            <button
              type="button"
              onClick={() => setChannelType('general')}
              className={`p-4 rounded-xl border-2 transition-all ${
                channelType === 'general'
                  ? 'border-builty-blue bg-builty-blue/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Hash className={`h-6 w-6 mx-auto mb-2 ${
                channelType === 'general' ? 'text-builty-blue' : 'text-builty-gray-light'
              }`} />
              <p className={`text-sm font-semibold ${
                channelType === 'general' ? 'text-builty-blue' : 'text-builty-gray'
              }`}>
                Général
              </p>
            </button>

            <button
              type="button"
              onClick={() => setChannelType('project')}
              className={`p-4 rounded-xl border-2 transition-all ${
                channelType === 'project'
                  ? 'border-builty-orange bg-builty-orange/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <HardHat className={`h-6 w-6 mx-auto mb-2 ${
                channelType === 'project' ? 'text-builty-orange' : 'text-builty-gray-light'
              }`} />
              <p className={`text-sm font-semibold ${
                channelType === 'project' ? 'text-builty-orange' : 'text-builty-gray'
              }`}>
                Chantier
              </p>
            </button>
          </div>
          <p className="text-xs text-builty-gray-light mt-2">
            {channelType === 'custom' && 'Canal personnalisé pour un usage spécifique'}
            {channelType === 'general' && 'Tous les membres auront accès à ce canal'}
            {channelType === 'project' && 'Lié à un chantier spécifique'}
          </p>
        </div>

        {/* Project Selection (only for project type) */}
        {channelType === 'project' && (
          <Select
            label="Chantier"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            required
            disabled={loadingProjects}
          >
            <option value="">Sélectionner un chantier</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        )}

        {/* Channel Name */}
        <Input
          label="Nom du canal"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder={
            channelType === 'project'
              ? 'Ex: Équipe Électricité'
              : channelType === 'general'
              ? 'Ex: Annonces'
              : 'Ex: Support Client'
          }
          required
          maxLength={255}
        />

        {/* Channel Description */}
        <Textarea
          label="Description (optionnel)"
          value={channelDescription}
          onChange={(e) => setChannelDescription(e.target.value)}
          placeholder="Décrivez le but de ce canal..."
          rows={3}
        />

        {/* Info Box */}
        <div className={`p-4 rounded-xl border-2 ${
          channelType === 'project'
            ? 'bg-builty-orange/5 border-builty-orange/20'
            : 'bg-builty-blue/5 border-builty-blue/20'
        }`}>
          <p className="text-sm text-builty-gray">
            <strong>Qui aura accès ?</strong>
          </p>
          <p className="text-sm text-builty-gray-light mt-1">
            {channelType === 'project'
              ? 'Tous les admins seront ajoutés. Vous pourrez ensuite ajouter les employés concernés.'
              : 'Tous les membres de l\'entreprise seront automatiquement ajoutés à ce canal.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading || (channelType === 'project' && !selectedProjectId)}
          >
            {loading ? 'Création...' : 'Créer le canal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
