import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Send, Image as ImageIcon, Video, Trash2, Hash, Settings, MessageSquare, Plus } from 'lucide-react';
import { useMessages } from '../hooks/useMessages';
import { useChannels, Channel } from '../hooks/useChannels';
import { useAuth } from '../contexts/AuthContext';
import { ChannelManagementModal } from '../components/messaging/ChannelManagementModal';
import { CreateChannelModal } from '../components/messaging/CreateChannelModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Toast } from '../components/ui/Toast';

export function Messaging() {
  const { profile } = useAuth();
  const { channels, loading: channelsLoading, fetchChannels, deleteChannel } = useChannels();
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const { messages, loading, sending, uploading, sendMessage, sendMedia, deleteMessage } = useMessages(activeChannel?.id || null);
  const [messageText, setMessageText] = useState('');
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [createChannelModalOpen, setCreateChannelModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // États pour les confirmations et toasts
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'channel' | 'message', data: any } | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Set first channel as active when channels load
  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0]);
    }
  }, [channels, activeChannel]);

  const handleChannelCreated = () => {
    fetchChannels();
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleDeleteChannelClick = () => {
    if (!activeChannel) {
      return;
    }

    if (activeChannel.name === 'Général') {
      showToast('Le canal général ne peut pas être supprimé.', 'warning');
      return;
    }

    setConfirmAction({ type: 'channel', data: activeChannel });
    setConfirmModalOpen(true);
  };

  const handleDeleteChannel = async () => {
    if (!confirmAction || confirmAction.type !== 'channel') return;

    const channelToDelete = confirmAction.data as Channel;

    try {
      console.log('Appel de deleteChannel...');
      await deleteChannel(channelToDelete.id);
      console.log('deleteChannel terminé avec succès');
      
      showToast('Canal supprimé avec succès !', 'success');
      
      // Sélectionner le premier canal disponible
      if (channels.length > 1) {
        const nextChannel = channels.find(c => c.id !== channelToDelete.id);
        setActiveChannel(nextChannel || null);
      } else {
        setActiveChannel(null);
      }
    } catch (err: any) {
      console.error('Erreur dans handleDeleteChannel:', err);
      showToast(err.message || 'Erreur lors de la suppression du canal', 'error');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [messageText]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    try {
      await sendMessage(messageText);
      setMessageText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner une image', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('L\'image ne doit pas dépasser 10 Mo', 'warning');
      return;
    }

    try {
      await sendMedia(file, 'image');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi de l\'image', 'error');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Veuillez sélectionner une vidéo', 'warning');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('La vidéo ne doit pas dépasser 50 Mo', 'warning');
      return;
    }

    try {
      await sendMedia(file, 'video');
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi de la vidéo', 'error');
    }
  };

  const handleDeleteMessageClick = (messageId: string) => {
    setConfirmAction({ type: 'message', data: messageId });
    setConfirmModalOpen(true);
  };

  const handleDeleteMessage = async () => {
    if (!confirmAction || confirmAction.type !== 'message') return;

    const messageId = confirmAction.data as string;

    try {
      await deleteMessage(messageId);
      showToast('Message supprimé', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', 'error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${timeStr}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ` à ${timeStr}`;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isAdmin = profile?.role === 'Admin';

  if (channelsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-builty-gray-light">Chargement de la messagerie...</div>
      </div>
    );
  }

  if (channels.length === 0 && !channelsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-builty-gray-lighter">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center shadow-md">
            <MessageSquare className="w-10 h-10 text-builty-blue" />
          </div>
          <p className="text-xl font-bold text-builty-gray mb-2">Aucun canal disponible</p>
          <p className="text-builty-gray-light mb-6">
            Créez votre premier canal ou les canaux seront créés automatiquement avec vos chantiers
          </p>
          {isAdmin && (
            <Button onClick={() => setCreateChannelModalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Créer un canal
            </Button>
          )}
        </div>
        <CreateChannelModal
          isOpen={createChannelModalOpen}
          onClose={() => setCreateChannelModalOpen(false)}
          onChannelCreated={handleChannelCreated}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-builty-gray-lighter">
      {/* Left sidebar - Channels list */}
      <div className="w-80 bg-white border-r-2 border-gray-100 flex flex-col">
        {/* Sidebar header */}
        <div className="p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-builty-blue flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-builty-gray">Messagerie</h2>
                <p className="text-xs text-builty-gray-light">{channels.length} canaux</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setCreateChannelModalOpen(true)}
                className="w-9 h-9 rounded-lg bg-builty-blue hover:bg-builty-blue-light text-white flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                title="Créer un canal"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Channels list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {channels.map((channel) => {
            const isActive = activeChannel?.id === channel.id;
            const isGeneral = channel.channel_type === 'general';

            return (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-builty-blue text-white shadow-md'
                    : 'bg-builty-gray-lighter hover:bg-gray-200 text-builty-gray'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20' : isGeneral ? 'bg-builty-blue/10' : 'bg-builty-orange/10'
                  }`}>
                    <Hash className={`h-5 w-5 ${
                      isActive ? 'text-white' : isGeneral ? 'text-builty-blue' : 'text-builty-orange'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${isActive ? 'text-white' : 'text-builty-gray'}`}>
                      {channel.name}
                    </p>
                    {channel.description && (
                      <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-builty-gray-light'}`}>
                        {channel.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side - Messages */}
      <div className="flex-1 flex flex-col">
        {/* Channel header */}
        <div className="bg-white border-b-2 border-gray-100 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                activeChannel?.channel_type === 'general' ? 'bg-builty-blue' : 'bg-builty-orange'
              }`}>
                <Hash className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-builty-gray">{activeChannel?.name}</h1>
                <p className="text-sm text-builty-gray-light">
                  {messages.length} message{messages.length > 1 ? 's' : ''}
                  {activeChannel?.description && ` • ${activeChannel.description}`}
                </p>
              </div>
            </div>
            {isAdmin && activeChannel && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setManagementModalOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gérer les membres
                </Button>
                
                {/* Bouton supprimer (sauf pour le canal "Général") */}
                {activeChannel.name !== 'Général' && (
                  <Button
                    onClick={handleDeleteChannelClick}
                    variant="danger"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-5xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white flex items-center justify-center shadow-md">
                  <MessageSquare className="w-10 h-10 text-builty-blue" />
                </div>
                <p className="text-xl font-bold text-builty-gray mb-2">Aucun message</p>
                <p className="text-builty-gray-light">Envoyez le premier message dans ce canal</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === profile?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div
                      className={`max-w-lg ${
                        isOwn ? 'bg-builty-blue text-white' : 'bg-white text-builty-gray'
                      } rounded-2xl px-5 py-3 shadow-sm border-2 ${
                        isOwn ? 'border-builty-blue' : 'border-gray-100'
                      } relative`}
                    >
                      {/* Delete button for own messages */}
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteMessageClick(message.id)}
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md hover:bg-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Sender name (if not own message) */}
                      {!isOwn && (
                        <p className="text-xs font-bold text-builty-blue mb-1">
                          {message.sender?.full_name || 'Membre'}
                        </p>
                      )}

                      {/* Message content */}
                      {message.message_type === 'text' && (
                        <p className="whitespace-pre-wrap break-words text-base">
                          {message.content}
                        </p>
                      )}

                      {message.message_type === 'image' && message.media_url && (
                        <div className="space-y-2">
                          <img
                            src={message.media_url}
                            alt={message.media_name || 'Image'}
                            className="rounded-xl max-w-sm max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.media_url!, '_blank')}
                          />
                          <div className="flex items-center justify-between text-xs opacity-80">
                            <span>{message.media_name}</span>
                            {message.media_size && <span>{formatFileSize(message.media_size)}</span>}
                          </div>
                        </div>
                      )}

                      {message.message_type === 'video' && message.media_url && (
                        <div className="space-y-2">
                          <video
                            src={message.media_url}
                            controls
                            className="rounded-xl max-w-sm max-h-96"
                          />
                          <div className="flex items-center justify-between text-xs opacity-80">
                            <span>{message.media_name}</span>
                            {message.media_size && <span>{formatFileSize(message.media_size)}</span>}
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p
                        className={`text-xs mt-2 ${
                          isOwn ? 'text-white/80' : 'text-builty-gray-light'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white border-t-2 border-gray-100 px-6 py-5 shadow-lg">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              {/* Attachment buttons */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-11 h-11 rounded-xl bg-builty-gray-lighter hover:bg-gray-200 text-builty-blue flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Envoyer une image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                  className="w-11 h-11 rounded-xl bg-builty-gray-lighter hover:bg-gray-200 text-builty-orange flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Envoyer une vidéo"
                >
                  <Video className="h-5 w-5" />
                </button>
              </div>

              {/* Text input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écrivez votre message... (Shift+Enter pour une nouvelle ligne)"
                  className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none resize-none font-medium text-builty-gray placeholder:text-builty-gray-light transition-all max-h-32"
                  rows={1}
                  disabled={sending || uploading}
                />
              </div>

              {/* Send button */}
              <Button
                type="submit"
                disabled={!messageText.trim() || sending || uploading}
                className="w-11 h-11 !p-0 flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>

            {uploading && (
              <div className="mt-3 text-center">
                <p className="text-sm text-builty-blue font-semibold">Envoi en cours...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel Management Modal */}
      <ChannelManagementModal
        channel={activeChannel}
        isOpen={managementModalOpen}
        onClose={() => setManagementModalOpen(false)}
      />

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={createChannelModalOpen}
        onClose={() => setCreateChannelModalOpen(false)}
        onChannelCreated={handleChannelCreated}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction?.type === 'channel') {
            handleDeleteChannel();
          } else if (confirmAction?.type === 'message') {
            handleDeleteMessage();
          }
        }}
        title={confirmAction?.type === 'channel' ? 'Supprimer le canal ?' : 'Supprimer le message ?'}
        message={
          confirmAction?.type === 'channel'
            ? `Êtes-vous sûr de vouloir supprimer le canal "${confirmAction.data.name}" ? Tous les messages seront définitivement supprimés.`
            : 'Ce message sera définitivement supprimé.'
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          isOpen={true}
          onClose={() => setToast(null)}
          message={toast.message}
          type={toast.type}
          duration={3000}
        />
      )}
    </div>
  );
}
