import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { Quote, QuoteItem } from '../../hooks/useQuotes';
import { useClients } from '../../hooks/useClients';
import { useCompanySettings } from '../../hooks/useCompanySettings';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quote: Partial<Quote>, items: QuoteItem[]) => Promise<void>;
  quote?: Quote;
  initialItems?: QuoteItem[];
  aiGeneratedData?: any;
}

export function QuoteFormModal({ isOpen, onClose, onSubmit, quote, initialItems = [], aiGeneratedData }: QuoteFormModalProps) {
  const { clients } = useClients();
  const { settings } = useCompanySettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultTvaRate = settings?.default_tva_rate || 20;

  const [clientId, setClientId] = useState(quote?.client_id || '');
  const [status, setStatus] = useState<Quote['status']>(quote?.status || 'Brouillon');
  const [notes, setNotes] = useState(quote?.notes || '');
  const [items, setItems] = useState<QuoteItem[]>(initialItems.length > 0 ? initialItems : [
    { description: '', quantity: 1, unit_price_ht: 0, tva_rate: defaultTvaRate, total_ht: 0, display_order: 0 }
  ]);

  useEffect(() => {
    if (quote) {
      setClientId(quote.client_id || '');
      setStatus(quote.status);
      setNotes(quote.notes || '');
    }
  }, [quote]);

  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  useEffect(() => {
    if (aiGeneratedData) {
      if (aiGeneratedData.notes) {
        setNotes(aiGeneratedData.notes);
      }

      if (aiGeneratedData.items && aiGeneratedData.items.length > 0) {
        const formattedItems = aiGeneratedData.items.map((item: any, index: number) => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price_ht: item.unit_price || 0,
          tva_rate: 20,
          total_ht: (item.quantity || 1) * (item.unit_price || 0),
          display_order: index,
        }));
        setItems(formattedItems);
      }
    }
  }, [aiGeneratedData]);

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unit_price_ht: 0,
      tva_rate: defaultTvaRate,
      total_ht: 0,
      display_order: items.length
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price_ht') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
      const unitPrice = field === 'unit_price_ht' ? parseFloat(value) || 0 : newItems[index].unit_price_ht;
      newItems[index].total_ht = quantity * unitPrice;
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    const totalHT = items.reduce((sum, item) => sum + item.total_ht, 0);
    const tvaAmount = items.reduce((sum, item) => {
      const itemTva = (item.total_ht * item.tva_rate) / 100;
      return sum + itemTva;
    }, 0);
    const totalTTC = totalHT + tvaAmount;

    return { totalHT, tvaAmount, totalTTC };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('Veuillez sélectionner un client');
      return;
    }

    const hasEmptyItems = items.some(item => !item.description.trim());
    if (hasEmptyItems) {
      setError('Toutes les lignes doivent avoir une description');
      return;
    }

    try {
      setLoading(true);
      const { totalHT, tvaAmount, totalTTC } = calculateTotals();

      await onSubmit({
        client_id: clientId,
        status,
        amount_ht: totalHT,
        amount_ttc: totalTTC,
        tva_amount: tvaAmount,
        tva_rate: defaultTvaRate,
        notes,
      }, items);

      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const { totalHT, tvaAmount, totalTTC } = calculateTotals();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={quote ? 'Modifier le devis' : 'Créer un devis'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {aiGeneratedData && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">Devis généré par l'IA</p>
              <p className="text-sm text-blue-700">
                {aiGeneratedData.title && <span className="font-medium">{aiGeneratedData.title} - </span>}
                {aiGeneratedData.description || 'Vérifiez et ajustez les informations avant de créer le devis.'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Select
          label="Client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
        >
          <option value="">Sélectionner un client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </Select>

        <Select
          label="Statut"
          value={status}
          onChange={(e) => setStatus(e.target.value as Quote['status'])}
          required
        >
          <option value="Brouillon">Brouillon</option>
          <option value="Envoye">Envoyé</option>
          <option value="Accepte">Accepté</option>
          <option value="Rejete">Rejeté</option>
          <option value="Converti">Converti</option>
        </Select>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Lignes du devis</label>
            <Button type="button" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter une ligne
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description de la prestation"
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Quantité"
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    required
                  />
                  <Input
                    label="Prix unitaire HT"
                    type="number"
                    step="0.01"
                    value={item.unit_price_ht}
                    onChange={(e) => updateItem(index, 'unit_price_ht', e.target.value)}
                    required
                  />
                  <Input
                    label="TVA (%)"
                    type="number"
                    step="0.01"
                    value={item.tva_rate}
                    onChange={(e) => updateItem(index, 'tva_rate', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="text-right">
                  <span className="text-sm text-gray-600">Total HT: </span>
                  <span className="font-semibold text-gray-900">
                    {item.total_ht.toFixed(2)} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total HT:</span>
            <span className="font-semibold">{totalHT.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA:</span>
            <span className="font-semibold">{tvaAmount.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total TTC:</span>
            <span className="text-builty-blue">{totalTTC.toFixed(2)} €</span>
          </div>
        </div>

        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes complémentaires..."
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : quote ? 'Mettre à jour' : 'Créer le devis'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
