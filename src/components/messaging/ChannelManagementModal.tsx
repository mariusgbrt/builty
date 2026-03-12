import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Users, UserPlus, X, Shield, User as UserIcon } from 'lucide-react';
import { useChannels, Channel, ChannelMember } from '../../hooks/useChannels';
import { useAuth } from '../../contexts/AuthContext';

interface ChannelManagementModalProps {
  channel: Channel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChannelManagementModal({ channel, isOpen, onClose }: ChannelManagementModalProps) {
  const { profile } = useAuth();
  const { getChannelMembers, getAvailableMembers, addMemberToChannel, removeMemberFromChannel, updateMemberRole } = useChannels();
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    if (channel && isOpen) {
      loadChannelData();
    }
  }, [channel, isOpen]);

  const loadChannelData = async () => {
    if (!channel) return;

    setLoading(true);
    try {
      const [membersData, availableData] = await Promise.all([
        getChannelMembers(channel.id),
        getAvailableMembers(channel.id),
      ]);
      setMembers(membersData);
      setAvailableMembers(availableData);
    } catch (err) {
      console.error('Error loading channel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!channel) return;

    try {
      await addMemberToChannel(channel.id, userId);
      await loadChannelData();
      setShowAddMember(false);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'ajout du membre');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!channel) return;
    if (!confirm('Retirer ce membre du canal ?')) return;

    try {
      await removeMemberFromChannel(channel.id, userId);
      await loadChannelData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du retrait du membre');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'member') => {
    if (!channel) return;
    const newRole = currentRole === 'admin' ? 'member' : 'admin';

    try {
      await updateMemberRole(channel.id, userId, newRole);
      await loadChannelData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de rôle');
    }
  };

  if (!channel) return null;

  const isAdmin = profile?.role === 'Admin';
  const isGeneralChannel = channel.channel_type === 'general';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gérer le canal : ${channel.name}`}>
      <div className="space-y-6">
        {/* Channel info */}
        <div className="bg-builty-gray-lighter rounded-xl p-4">
          <h3 className="font-bold text-builty-gray mb-2">{channel.name}</h3>
          <p className="text-sm text-builty-gray-light">{channel.description}</p>
          {channel.channel_type === 'project' && channel.project && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-builty-blue/10 text-builty-blue rounded-lg font-semibold">
                Chantier: {channel.project.name}
              </span>
            </div>
          )}
        </div>

        {/* Members list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-builty-blue" />
              <h3 className="font-bold text-builty-gray">
                Membres ({members.length})
              </h3>
            </div>
            {isAdmin && !isGeneralChannel && (
              <Button
                onClick={() => setShowAddMember(!showAddMember)}
                size="sm"
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            )}
          </div>

          {/* Add member section */}
          {showAddMember && availableMembers.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <h4 className="font-bold text-builty-gray mb-3">Ajouter un membre</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-semibold text-builty-gray">{member.full_name}</p>
                      <p className="text-sm text-builty-gray-light">{member.email}</p>
                    </div>
                    <Button
                      onClick={() => handleAddMember(member.id)}
                      size="sm"
                      variant="primary"
                    >
                      Ajouter
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAddMember && availableMembers.length === 0 && (
            <div className="mb-4 p-4 bg-builty-gray-lighter rounded-xl text-center">
              <p className="text-builty-gray-light">Tous les membres sont déjà dans ce canal</p>
            </div>
          )}

          {/* Current members */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-builty-gray-light">Chargement...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-builty-gray-light">Aucun membre</div>
            ) : (
              members.map((member) => {
                const isCurrentUser = member.user_id === profile?.id;
                const canManage = isAdmin && !isGeneralChannel && !isCurrentUser;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-builty-blue/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        member.role === 'admin' ? 'bg-builty-blue/10' : 'bg-gray-100'
                      }`}>
                        {member.role === 'admin' ? (
                          <Shield className="h-5 w-5 text-builty-blue" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-builty-gray-light" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-builty-gray">
                          {member.user?.full_name || 'Membre'}
                          {isCurrentUser && <span className="text-sm text-builty-blue ml-2">(Vous)</span>}
                        </p>
                        <p className="text-sm text-builty-gray-light">{member.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        member.role === 'admin'
                          ? 'bg-builty-blue/10 text-builty-blue'
                          : 'bg-gray-100 text-builty-gray-light'
                      }`}>
                        {member.role === 'admin' ? 'Admin' : 'Membre'}
                      </span>

                      {canManage && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleToggleRole(member.user_id, member.role)}
                            size="sm"
                            variant="outline"
                            title={member.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin'}
                          >
                            {member.role === 'admin' ? '→ Membre' : '→ Admin'}
                          </Button>
                          <button
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                            title="Retirer du canal"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Info message for general channel */}
        {isGeneralChannel && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-builty-blue font-semibold">
              ℹ️ Le canal général inclut automatiquement tous les membres de l'entreprise.
            </p>
          </div>
        )}

        {/* Close button */}
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
