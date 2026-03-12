import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  company_id: string;
  sender_id: string;
  channel_id: string;
  content: string | null;
  message_type: 'text' | 'image' | 'video' | 'file';
  media_url: string | null;
  media_name: string | null;
  media_size: number | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
}

export function useMessages(channelId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { profile } = useAuth();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!profile?.company_id || !channelId) {
      setLoading(false);
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id (
            full_name,
            email
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100); // Limit to last 100 messages

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id, channelId]);

  // Setup realtime subscription
  useEffect(() => {
    if (!profile?.company_id || !channelId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    // Subscribe to new messages
    const realtimeChannel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch sender info for the new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage = {
            ...payload.new,
            sender,
          } as Message;

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [profile?.company_id, channelId, fetchMessages]);

  // Send text message
  const sendMessage = async (content: string) => {
    if (!profile?.company_id || !profile?.id || !content.trim() || !channelId) {
      throw new Error('Invalid message');
    }

    try {
      setSending(true);

      const { error } = await supabase.from('messages').insert({
        company_id: profile.company_id,
        sender_id: profile.id,
        channel_id: channelId,
        content: content.trim(),
        message_type: 'text',
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  // Upload and send media (photo/video)
  const sendMedia = async (file: File, type: 'image' | 'video') => {
    if (!profile?.company_id || !profile?.id || !channelId) {
      throw new Error('User not authenticated');
    }

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.company_id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('message-media').getPublicUrl(fileName);

      // Save message to database
      const { error } = await supabase.from('messages').insert({
        company_id: profile.company_id,
        sender_id: profile.id,
        channel_id: channelId,
        content: null,
        message_type: type,
        media_url: publicUrl,
        media_name: file.name,
        media_size: file.size,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error sending media:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting message:', err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    sending,
    uploading,
    sendMessage,
    sendMedia,
    deleteMessage,
    refreshMessages: fetchMessages,
  };
}
