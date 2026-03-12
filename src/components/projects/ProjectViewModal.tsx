import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Calendar, MapPin, TrendingUp, TrendingDown, Euro, FileText, User, Info, Image } from 'lucide-react';
import { ProjectWithClient } from '../../hooks/useProjects';
import { ProjectPhotosGallery } from './ProjectPhotosGallery';
import { formatCurrency } from '../../utils/format';

interface ProjectViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithClient;
  onEdit: () => void;
}

const statusColors: Record<string, 'default' | 'info' | 'success' | 'error'> = {
  'En attente': 'default',
  'En cours': 'info',
  'Termine': 'success',
  'Annule': 'error',
};

type Tab = 'info' | 'photos';

export function ProjectViewModal({ isOpen, onClose, project, onEdit }: ProjectViewModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const marginDiff = (project.actual_margin_rate || 0) - (project.expected_margin_rate || 0);
  const isMarginPositive = marginDiff >= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du chantier" size="xl">
      <div className="space-y-6">
        {/* Header avec nom et statut */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-builty-gray">{project.name}</h3>
            <Badge variant={statusColors[project.status]} className="mt-2">
              {project.status}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-gray-100">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-0.5 ${
                activeTab === 'info'
                  ? 'text-builty-blue border-builty-blue'
                  : 'text-builty-gray-light border-transparent hover:text-builty-gray'
              }`}
            >
              <Info className="h-4 w-4" />
              Informations
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 -mb-0.5 ${
                activeTab === 'photos'
                  ? 'text-builty-blue border-builty-blue'
                  : 'text-builty-gray-light border-transparent hover:text-builty-gray'
              }`}
            >
              <Image className="h-4 w-4" />
              Photos du chantier
            </button>
          </div>
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'info' ? (
          <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-builty-gray">{project.name}</h3>
            <Badge variant={statusColors[project.status]} className="mt-2">
              {project.status}
            </Badge>
          </div>
        </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-builty-gray-lighter rounded-2xl border-2 border-gray-100">
              <div>
                <p className="text-sm text-builty-gray-light font-medium mb-2">Montant HT</p>
                <p className="text-3xl font-extrabold text-builty-blue">
                  {formatCurrency(project.amount_ht || 0, 2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-builty-gray-light font-medium mb-2">Marge réelle</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-extrabold ${isMarginPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {project.actual_margin_rate || 0}%
                  </p>
                  {isMarginPositive ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Détails */}
            <div className="space-y-5">
              {project.client_name && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-builty-blue/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-builty-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-builty-gray-light mb-1">Client</p>
                    <p className="text-base font-bold text-builty-gray">{project.client_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Euro className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-builty-gray-light mb-2">Marges</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <p className="text-xs text-builty-gray-light font-medium mb-1">Prévue</p>
                      <p className="text-lg font-bold text-builty-gray">{project.expected_margin_rate || 0}%</p>
                    </div>
                    <div className={`p-3 rounded-xl border-2 ${isMarginPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-xs text-builty-gray-light font-medium mb-1">Réelle</p>
                      <p className={`text-lg font-bold ${isMarginPositive ? 'text-green-700' : 'text-red-700'}`}>
                        {project.actual_margin_rate || 0}%
                        {project.expected_margin_rate && (
                          <span className="text-xs ml-1">
                            ({marginDiff > 0 ? '+' : ''}{marginDiff.toFixed(1)}%)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {(project.start_date || project.end_date) && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-builty-orange/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-builty-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-builty-gray-light mb-1">Dates</p>
                    <p className="text-base font-semibold text-builty-gray">
                      {project.start_date && (
                        <span>Du {new Date(project.start_date).toLocaleDateString('fr-FR')}</span>
                      )}
                      {project.end_date && (
                        <span> au {new Date(project.end_date).toLocaleDateString('fr-FR')}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {project.address && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-builty-gray-light mb-1">Adresse du chantier</p>
                    <p className="text-base font-semibold text-builty-gray">{project.address}</p>
                  </div>
                </div>
              )}

              {project.description && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-builty-gray-light" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-builty-gray-light mb-1">Description</p>
                    <p className="text-base text-builty-gray whitespace-pre-wrap">{project.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-100">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={onEdit}>
                Modifier
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <ProjectPhotosGallery project={project} />
          </div>
        )}
      </div>
    </Modal>
  );
}
