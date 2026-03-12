import { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Camera, Upload, FileText, Loader2, Sparkles, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AIQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuoteGenerated: (quoteData: any) => void;
}

type InputMode = 'text' | 'upload' | 'camera';

interface QuoteItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

interface QuoteResponse {
  title: string;
  description: string;
  items: QuoteItem[];
  notes?: string;
}

export function AIQuoteModal({ isOpen, onClose, onQuoteGenerated }: AIQuoteModalProps) {
  const { profile } = useAuth();
  const [mode, setMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [clientInfo, setClientInfo] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      console.error('Camera error:', err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const preview = canvas.toDataURL('image/jpeg');
            setImageFiles(prev => [...prev, file]);
            setImagePreviews(prev => [...prev, preview]);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      let filesProcessed = 0;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
          setError('Veuillez sélectionner uniquement des images valides');
          return;
        }

        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          filesProcessed++;

          if (filesProcessed === files.length) {
            setImageFiles(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateQuote = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      let content: string | string[] = '';
      let type: 'text' | 'image' = 'text';

      if (mode === 'text') {
        if (!textInput.trim()) {
          throw new Error('Veuillez entrer une description des travaux');
        }
        content = textInput;
        type = 'text';
      } else {
        if (imageFiles.length === 0) {
          throw new Error('Veuillez sélectionner ou capturer au moins une image');
        }
        content = await Promise.all(imageFiles.map(file => convertImageToBase64(file)));
        type = 'image';
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Vous devez être connecté');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quote-ai`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content,
          clientInfo: clientInfo.trim() || undefined,
          companyId: profile?.company_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la génération du devis');
      }

      const quoteData: QuoteResponse = await response.json();

      onQuoteGenerated(quoteData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      console.error('Generate quote error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setMode('text');
    setTextInput('');
    setClientInfo('');
    setImageFiles([]);
    setImagePreviews([]);
    setError(null);
    onClose();
  };

  const clearImage = (index?: number) => {
    if (index !== undefined) {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles([]);
      setImagePreviews([]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Créer un devis avec l'IA">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Assistant IA de devis</p>
            <p className="mb-2">Décrivez les travaux par texte, photo ou capture d'écran. L'IA génèrera un devis détaillé avec postes et prix.</p>
            <p className="text-xs bg-white bg-opacity-60 rounded px-2 py-1 inline-block">
              💡 L'IA utilise automatiquement vos tarifs configurés dans Paramètres → Tarifs
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informations client (optionnel)
          </label>
          <Input
            placeholder="Ex: Rénovation cuisine, appartement 50m²..."
            value={clientInfo}
            onChange={(e) => setClientInfo(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mode de saisie
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                setMode('text');
                stopCamera();
                clearImage();
              }}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                mode === 'text'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className={`h-6 w-6 mb-2 ${mode === 'text' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${mode === 'text' ? 'text-blue-900' : 'text-gray-700'}`}>
                Texte
              </span>
            </button>

            <button
              onClick={() => {
                setMode('upload');
                stopCamera();
              }}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                mode === 'upload'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Upload className={`h-6 w-6 mb-2 ${mode === 'upload' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${mode === 'upload' ? 'text-blue-900' : 'text-gray-700'}`}>
                Importer
              </span>
            </button>

            <button
              onClick={() => {
                setMode('camera');
                clearImage();
                startCamera();
              }}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                mode === 'camera'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Camera className={`h-6 w-6 mb-2 ${mode === 'camera' ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${mode === 'camera' ? 'text-blue-900' : 'text-gray-700'}`}>
                Photo
              </span>
            </button>
          </div>
        </div>

        {mode === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description des travaux
            </label>
            <Textarea
              placeholder="Ex: Installation d'une cuisine complète avec plan de travail en granit, pose de carrelage au sol 30m², peinture des murs..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
        )}

        {mode === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            {imagePreviews.length === 0 ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors"
              >
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600">Cliquez pour sélectionner des images</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP jusqu'à 10MB chacune</p>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={() => clearImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter d'autres images
                </Button>
              </div>
            )}
          </div>
        )}

        {mode === 'camera' && (
          <div className="space-y-3">
            {isCameraActive ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="mt-4 flex justify-center space-x-3">
                  <Button onClick={capturePhoto}>
                    <Camera className="h-5 w-5 mr-2" />
                    Capturer
                  </Button>
                  {imagePreviews.length > 0 && (
                    <Button variant="outline" onClick={stopCamera}>
                      Terminer
                    </Button>
                  )}
                </div>
              </div>
            ) : imagePreviews.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Captured ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={() => clearImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={startCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Capturer d'autres photos
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <Camera className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 text-center">Démarrage de la caméra...</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            Annuler
          </Button>
          <Button onClick={generateQuote} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Générer le devis
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
