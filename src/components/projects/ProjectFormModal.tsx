import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Project } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => Promise<void>;
  project?: Project;
}

export function ProjectFormModal({ isOpen, onClose, onSubmit, project }: ProjectFormModalProps) {
  const { clients } = useClients();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [clientId, setClientId] = useState(project?.client_id || '');
  const [name, setName] = useState(project?.name || '');
  const [status, setStatus] = useState<'En attente' | 'En cours' | 'Termine' | 'Annule'>(project?.status || 'En attente');
  const [amountHT, setAmountHT] = useState(project?.amount_ht?.toString() || '');
  const [expectedMargin, setExpectedMargin] = useState(project?.expected_margin_rate?.toString() || '');
  const [actualMargin, setActualMargin] = useState(project?.actual_margin_rate?.toString() || '');
  const [startDate, setStartDate] = useState(project?.start_date || '');
  const [endDate, setEndDate] = useState(project?.end_date || '');
  const [address, setAddress] = useState(project?.address || '');
  const [description, setDescription] = useState(project?.description || '');

  useEffect(() => {
    if (project) {
      setClientId(project.client_id || '');
      setName(project.name);
      setStatus(project.status);
      setAmountHT(project.amount_ht?.toString() || '');
      setExpectedMargin(project.expected_margin_rate?.toString() || '');
      setActualMargin(project.actual_margin_rate?.toString() || '');
      setStartDate(project.start_date || '');
      setEndDate(project.end_date || '');
      setAddress(project.address || '');
      setDescription(project.description || '');
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom du projet est obligatoire');
      return;
    }

    if (!amountHT || parseFloat(amountHT) < 0) {
      setError('Le montant HT doit être un nombre positif');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        client_id: clientId || null,
        name: name.trim(),
        status,
        amount_ht: parseFloat(amountHT),
        expected_margin_rate: expectedMargin ? parseFloat(expectedMargin) : null,
        actual_margin_rate: actualMargin ? parseFloat(actualMargin) : null,
        start_date: startDate || null,
        end_date: endDate || null,
        address: address.trim() || null,
        description: description.trim() || null,
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
      title={project ? 'Modifier le chantier' : 'Nouveau chantier'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Nom du chantier"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Rénovation appartement 3P"
          required
        />

        <Select
          label="Client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>

        <Select
          label="Statut"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          required
        >
          <option value="En attente">En attente</option>
          <option value="En cours">En cours</option>
          <option value="Termine">Terminé</option>
          <option value="Annule">Annulé</option>
        </Select>

        <Input
          label="Montant HT"
          type="number"
          step="0.01"
          value={amountHT}
          onChange={(e) => setAmountHT(e.target.value)}
          placeholder="0.00"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Marge prévue (%)"
            type="number"
            step="0.01"
            value={expectedMargin}
            onChange={(e) => setExpectedMargin(e.target.value)}
            placeholder="20.00"
          />
          <Input
            label="Marge réelle (%)"
            type="number"
            step="0.01"
            value={actualMargin}
            onChange={(e) => setActualMargin(e.target.value)}
            placeholder="22.50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date de début"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Date de fin prévue"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Adresse du chantier"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adresse complète"
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du chantier..."
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : project ? 'Mettre à jour' : 'Créer le chantier'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
