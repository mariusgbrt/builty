import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Calendar, Clock, User, Briefcase, FileText } from 'lucide-react';
import { AllocationWithDetails } from '../../hooks/useAllocations';

interface AllocationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocation: AllocationWithDetails;
  onEdit: () => void;
}

const statusColors: Record<string, 'default' | 'info' | 'success' | 'error'> = {
  'Planifie': 'default',
  'En cours': 'info',
  'Termine': 'success',
  'Annule': 'error',
};

const statusLabels: Record<string, string> = {
  'Planifie': 'Planifié',
  'En cours': 'En cours',
  'Termine': 'Terminé',
  'Annule': 'Annulé',
};

export function AllocationViewModal({ isOpen, onClose, allocation, onEdit }: AllocationViewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'affectation">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-builty-gray">{allocation.project_name}</h3>
            <Badge variant={statusColors[allocation.status]} className="mt-2">
              {statusLabels[allocation.status]}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Informations</h4>

          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Ressource</p>
              <p className="text-gray-900">
                {allocation.resource_name}
                {allocation.resource_type && (
                  <span className="text-sm text-gray-500 ml-2">({allocation.resource_type})</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <Briefcase className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Projet</p>
              <p className="text-gray-900">{allocation.project_name}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="text-gray-900">
                {new Date(allocation.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Horaires</p>
              <p className="text-gray-900">
                De {allocation.start_time} à {allocation.end_time}
              </p>
            </div>
          </div>

          {allocation.notes && (
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-900 whitespace-pre-wrap">{allocation.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onEdit}>
            Modifier
          </Button>
        </div>
      </div>
    </Modal>
  );
}
