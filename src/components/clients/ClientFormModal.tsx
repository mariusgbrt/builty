import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Client } from '../../hooks/useClients';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: Partial<Client>) => Promise<void>;
  client?: Client;
}

export function ClientFormModal({ isOpen, onClose, onSubmit, client }: ClientFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [type, setType] = useState<'Particulier' | 'Entreprise'>(client?.type || 'Particulier');
  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [address, setAddress] = useState(client?.address || '');
  const [postalCode, setPostalCode] = useState(client?.postal_code || '');
  const [city, setCity] = useState(client?.city || '');
  const [siret, setSiret] = useState(client?.siret || '');
  const [notes, setNotes] = useState(client?.notes || '');

  useEffect(() => {
    if (client) {
      setType(client.type);
      setName(client.name);
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setAddress(client.address || '');
      setPostalCode(client.postal_code || '');
      setCity(client.city || '');
      setSiret(client.siret || '');
      setNotes(client.notes || '');
    }
  }, [client]);

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
        address: address.trim() || null,
        postal_code: postalCode.trim() || null,
        city: city.trim() || null,
        siret: siret.trim() || null,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Modifier le client' : 'Nouveau client'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Select
          label="Type de client"
          value={type}
          onChange={(e) => setType(e.target.value as 'Particulier' | 'Entreprise')}
          required
        >
          <option value="Particulier">Particulier</option>
          <option value="Entreprise">Entreprise</option>
        </Select>

        <Input
          label="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du client"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.fr"
          />
          <Input
            label="Téléphone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01 23 45 67 89"
          />
        </div>

        <Input
          label="Adresse"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adresse complète"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Code postal"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="75001"
          />
          <Input
            label="Ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Paris"
          />
        </div>

        {type === 'Entreprise' && (
          <Input
            label="SIRET"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            placeholder="123 456 789 00012"
          />
        )}

        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes sur le client..."
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : client ? 'Mettre à jour' : 'Créer le client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
