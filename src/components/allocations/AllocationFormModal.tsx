import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Allocation } from '../../hooks/useAllocations';
import { useProjects } from '../../hooks/useProjects';
import { useResources } from '../../hooks/useResources';

interface AllocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (allocation: Partial<Allocation>) => Promise<void>;
  allocation?: Allocation;
  preSelectedDate?: string;
  preSelectedResourceId?: string;
}

export function AllocationFormModal({
  isOpen,
  onClose,
  onSubmit,
  allocation,
  preSelectedDate,
  preSelectedResourceId,
}: AllocationFormModalProps) {
  const { projects } = useProjects();
  const { resources } = useResources();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projectId, setProjectId] = useState(allocation?.project_id || '');
  const [resourceId, setResourceId] = useState(allocation?.resource_id || preSelectedResourceId || '');
  const [date, setDate] = useState(allocation?.date || preSelectedDate || '');
  const [startTime, setStartTime] = useState(allocation?.start_time || '08:00');
  const [endTime, setEndTime] = useState(allocation?.end_time || '17:00');
  const [status, setStatus] = useState<'Planifie' | 'En cours' | 'Termine' | 'Annule'>(
    allocation?.status || 'Planifie'
  );
  const [notes, setNotes] = useState(allocation?.notes || '');

  useEffect(() => {
    if (allocation) {
      setProjectId(allocation.project_id);
      setResourceId(allocation.resource_id);
      setDate(allocation.date);
      setStartTime(allocation.start_time);
      setEndTime(allocation.end_time);
      setStatus(allocation.status);
      setNotes(allocation.notes || '');
    } else {
      if (preSelectedDate) setDate(preSelectedDate);
      if (preSelectedResourceId) setResourceId(preSelectedResourceId);
    }
  }, [allocation, preSelectedDate, preSelectedResourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!projectId) {
      setError('Le projet est obligatoire');
      return;
    }

    if (!resourceId) {
      setError('La ressource est obligatoire');
      return;
    }

    if (!date) {
      setError('La date est obligatoire');
      return;
    }

    if (!startTime || !endTime) {
      setError('Les heures de début et fin sont obligatoires');
      return;
    }

    if (startTime >= endTime) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        project_id: projectId,
        resource_id: resourceId,
        date,
        start_time: startTime,
        end_time: endTime,
        status,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = projects.filter(p => p.status !== 'Termine' && p.status !== 'Annule');
  const activeResources = resources.filter(r => r.status === 'Actif');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={allocation ? 'Modifier l\'affectation' : 'Nouvelle affectation'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Select
          label="Projet"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
        >
          <option value="">Sélectionner un projet</option>
          {activeProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>

        <Select
          label="Ressource"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          required
        >
          <option value="">Sélectionner une ressource</option>
          {activeResources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name} ({resource.type})
            </option>
          ))}
        </Select>

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Heure de début"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="Heure de fin"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <Select
          label="Statut"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          required
        >
          <option value="Planifie">Planifié</option>
          <option value="En cours">En cours</option>
          <option value="Termine">Terminé</option>
          <option value="Annule">Annulé</option>
        </Select>

        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes complémentaires..."
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : allocation ? 'Mettre à jour' : 'Créer l\'affectation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
