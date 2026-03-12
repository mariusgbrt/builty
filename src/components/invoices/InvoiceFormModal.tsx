import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { Invoice, InvoiceItem } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { useCompanySettings } from '../../hooks/useCompanySettings';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Partial<Invoice>, items: InvoiceItem[]) => Promise<void>;
  invoice?: Invoice;
  initialItems?: InvoiceItem[];
}

export function InvoiceFormModal({ isOpen, onClose, onSubmit, invoice, initialItems = [] }: InvoiceFormModalProps) {
  const { clients } = useClients();
  const { settings } = useCompanySettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultTvaRate = settings?.default_tva_rate || 20;
  const defaultPaymentTerms = settings?.default_payment_terms || '30 jours';

  const [clientId, setClientId] = useState(invoice?.client_id || '');
  const [status, setStatus] = useState<Invoice['status']>(invoice?.status || 'Brouillon');
  const [issueDate, setIssueDate] = useState(invoice?.issue_date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(invoice?.due_date || '');
  const [paymentTerms, setPaymentTerms] = useState(invoice?.payment_terms || defaultPaymentTerms);
  const [amountPaid, setAmountPaid] = useState(invoice?.amount_paid?.toString() || '0');
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [items, setItems] = useState<InvoiceItem[]>(initialItems.length > 0 ? initialItems : [
    { description: '', quantity: 1, unit_price_ht: 0, tva_rate: defaultTvaRate, total_ht: 0, display_order: 0 }
  ]);

  useEffect(() => {
    if (invoice) {
      setClientId(invoice.client_id || '');
      setStatus(invoice.status);
      setIssueDate(invoice.issue_date);
      setDueDate(invoice.due_date);
      setPaymentTerms(invoice.payment_terms || '30 jours');
      setAmountPaid(invoice.amount_paid?.toString() || '0');
      setNotes(invoice.notes || '');
    }
  }, [invoice]);

  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  useEffect(() => {
    if (issueDate && paymentTerms) {
      const days = parseInt(paymentTerms.match(/\d+/)?.[0] || '30');
      const issue = new Date(issueDate);
      issue.setDate(issue.getDate() + days);
      setDueDate(issue.toISOString().split('T')[0]);
    }
  }, [issueDate, paymentTerms]);

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

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
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

    if (!issueDate || !dueDate) {
      setError('Les dates sont obligatoires');
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
        amount_paid: parseFloat(amountPaid) || 0,
        issue_date: issueDate,
        due_date: dueDate,
        payment_terms: paymentTerms,
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
    <Modal isOpen={isOpen} onClose={onClose} title={invoice ? 'Modifier la facture' : 'Créer une facture'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
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
            onChange={(e) => setStatus(e.target.value as Invoice['status'])}
            required
          >
            <option value="Brouillon">Brouillon</option>
            <option value="Envoyee">Envoyée</option>
            <option value="Partielle">Partielle</option>
            <option value="Payee">Payée</option>
            <option value="En retard">En retard</option>
            <option value="Annulee">Annulée</option>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Date émission"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
          <Select
            label="Conditions paiement"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            required
          >
            <option value="15 jours">15 jours</option>
            <option value="30 jours">30 jours</option>
            <option value="45 jours">45 jours</option>
            <option value="60 jours">60 jours</option>
          </Select>
          <Input
            label="Date échéance"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Lignes de la facture</label>
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
          <div className="pt-2 border-t">
            <Input
              label="Montant payé"
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              required
            />
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
            {loading ? 'Enregistrement...' : invoice ? 'Mettre à jour' : 'Créer la facture'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
