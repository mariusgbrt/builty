import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Service } from '../../hooks/useServices';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  service?: Service;
}

export function ServiceFormModal({ isOpen, onClose, onSubmit, service }: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit_price_ht: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        unit_price_ht: service.unit_price_ht.toString(),
        is_active: service.is_active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        unit_price_ht: '',
        is_active: true,
      });
    }
  }, [service, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.unit_price_ht) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const price = parseFloat(formData.unit_price_ht);
    if (isNaN(price) || price < 0) {
      alert('Le prix doit être un nombre positif');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        unit_price_ht: price,
        unit: 'Unite',
        default_tva_rate: 20,
        is_active: formData.is_active,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting service:', error);
      alert('Erreur lors de la sauvegarde du service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Modifier le service' : 'Nouveau service'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom du service"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Développement web"
          required
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description détaillée du service"
          rows={3}
        />

        <Input
          label="Prix unitaire HT"
          type="number"
          step="0.01"
          min="0"
          value={formData.unit_price_ht}
          onChange={(e) => setFormData({ ...formData, unit_price_ht: e.target.value })}
          placeholder="0.00"
          required
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Service actif
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} type="button" disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Enregistrement...' : service ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
