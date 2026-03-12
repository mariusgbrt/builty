import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Resource } from '../../hooks/useResources';

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: Partial<Resource>) => Promise<void>;
  resource?: Resource;
}

export function ResourceFormModal({ isOpen, onClose, onSubmit, resource }: ResourceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [type, setType] = useState<Resource['type']>(resource?.type || 'Ouvrier');
  const [name, setName] = useState(resource?.name || '');
  const [email, setEmail] = useState(resource?.email || '');
  const [phone, setPhone] = useState(resource?.phone || '');
  const [status, setStatus] = useState<Resource['status']>(resource?.status || 'Actif');

  useEffect(() => {
    if (resource) {
      setType(resource.type);
      setName(resource.name);
      setEmail(resource.email || '');
      setPhone(resource.phone || '');
      setStatus(resource.status);
    } else {
      setType('Ouvrier');
      setName('');
      setEmail('');
      setPhone('');
      setStatus('Actif');
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom est obligatoire');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        type,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={resource ? 'Modifier la ressource' : 'Ajouter une ressource'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Select
          label="Type de ressource"
          value={type}
          onChange={(e) => setType(e.target.value as Resource['type'])}
          required
        >
          <option value="Ouvrier">Ouvrier</option>
          <option value="Independant">Indépendant</option>
          <option value="Sous-traitant">Sous-traitant</option>
          <option value="Vehicule">Véhicule</option>
          <option value="Outil">Outil</option>
        </Select>

        <Input
          label="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Jean Dupont, Camion 1, Bétonnière..."
          required
        />

        <Input
          label="Email (optionnel)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemple.com"
        />

        <Input
          label="Téléphone (optionnel)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+33 6 12 34 56 78"
        />

        <Select
          label="Statut"
          value={status}
          onChange={(e) => setStatus(e.target.value as Resource['status'])}
          required
        >
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
        </Select>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : resource ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
