import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Channel {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  channel_type: 'general' | 'project';
  project_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  project?: {
    name: string;
    status: string;
  };
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
}

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Fetch channels that the user is a member of
  const fetchChannels = useCallback(async () => {
    if (!profile?.id || !profile?.company_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Étape 1 : Récupérer les IDs des canaux où l'utilisateur est membre
      const { data: memberData, error: memberError } = await supabase
        .from('channel_members')
        .select('channel_id')
        .eq('user_id', profile.id);

      if (memberError) throw memberError;

      // Si l'utilisateur n'est membre d'aucun canal
      if (!memberData || memberData.length === 0) {
        setChannels([]);
        setLoading(false);
        return;
      }

      // Extraire les IDs des canaux
      const channelIds = memberData.map(m => m.channel_id);

      // Étape 2 : Récupérer les détails des canaux
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          project:projects (
            name,
            status
          )
        `)
        .in('id', channelIds)
        .eq('company_id', profile.company_id)
        .order('channel_type', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Sort: general first, then projects by name
      const sortedChannels = (data || []).sort((a, b) => {
        if (a.channel_type === 'general' && b.channel_type !== 'general') return -1;
        if (a.channel_type !== 'general' && b.channel_type === 'general') return 1;
        return a.name.localeCompare(b.name);
      });

      setChannels(sortedChannels);
    } catch (err: any) {
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.company_id]);

  // Setup realtime subscription
  useEffect(() => {
    if (!profile?.id || !profile?.company_id) return;

    fetchChannels();

    // Subscribe to channel changes
    const channel = supabase
      .channel(`channels:${profile.company_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels',
          filter: `company_id=eq.${profile.company_id}`,
        },
        () => {
          fetchChannels();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_members',
        },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [profile?.id, profile?.company_id, fetchChannels]);

  // Get members of a specific channel
  const getChannelMembers = async (channelId: string): Promise<ChannelMember[]> => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          user:user_profiles (
            full_name,
            email,
            role
          )
        `)
        .eq('channel_id', channelId)
        .order('role', { ascending: false })
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching channel members:', err);
      return [];
    }
  };

  // Get all company members not in a specific channel
  const getAvailableMembers = async (channelId: string) => {
    if (!profile?.company_id) return [];

    try {
      // Étape 1 : Récupérer les IDs des membres déjà dans le canal
      const { data: existingMembers, error: membersError } = await supabase
        .from('channel_members')
        .select('user_id')
        .eq('channel_id', channelId);

      if (membersError) throw membersError;

      const existingMemberIds = (existingMembers || []).map(m => m.user_id);

      // Étape 2 : Récupérer tous les membres de l'entreprise qui ne sont PAS dans le canal
      const query = supabase
        .from('user_profiles')
        .select('id, full_name, email, role')
        .eq('company_id', profile.company_id);

      // Filtrer ceux qui sont déjà membres
      if (existingMemberIds.length > 0) {
        query.not('id', 'in', `(${existingMemberIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching available members:', err);
      return [];
    }
  };

  // Add member to channel
  const addMemberToChannel = async (channelId: string, userId: string, role: 'admin' | 'member' = 'member') => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId,
          role,
        });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error adding member to channel:', err);
      throw err;
    }
  };

  // Remove member from channel
  const removeMemberFromChannel = async (channelId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error removing member from channel:', err);
      throw err;
    }
  };

  // Update member role
  const updateMemberRole = async (channelId: string, userId: string, role: 'admin' | 'member') => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .update({ role })
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error updating member role:', err);
      throw err;
    }
  };

  // Delete channel
  const deleteChannel = async (channelId: string) => {
    try {
      console.log('Tentative de suppression du canal:', channelId);
      
      // Supprimer le canal (les membres et messages seront supprimés en cascade)
      const { data, error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId)
        .select();

      if (error) {
        console.error('Erreur Supabase lors de la suppression:', error);
        throw error;
      }
      
      console.log('Canal supprimé avec succès:', data);
      
      // Rafraîchir la liste des canaux
      await fetchChannels();
    } catch (err: any) {
      console.error('Error deleting channel:', err);
      throw err;
    }
  };

  return {
    channels,
    loading,
    fetchChannels,
    getChannelMembers,
    getAvailableMembers,
    addMemberToChannel,
    removeMemberFromChannel,
    updateMemberRole,
    deleteChannel,
  };
}
