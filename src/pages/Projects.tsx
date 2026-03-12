import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Filter, Edit, Trash2, TrendingUp, TrendingDown, Eye, Download } from 'lucide-react';
import { useProjects, ProjectWithClient } from '../hooks/useProjects';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { ProjectViewModal } from '../components/projects/ProjectViewModal';
import { formatCurrency } from '../utils/format';

type ProjectStatus = 'En attente' | 'En cours' | 'Termine' | 'Annule';

const statusColors: Record<ProjectStatus, 'default' | 'info' | 'success' | 'error'> = {
  'En attente': 'default',
  'En cours': 'info',
  'Termine': 'success',
  'Annule': 'error',
};

export function Projects() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithClient | undefined>();

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    enAttente: projects.filter(p => p.status === 'En attente').length,
    enCours: projects.filter(p => p.status === 'En cours').length,
    termine: projects.filter(p => p.status === 'Termine').length,
    annule: projects.filter(p => p.status === 'Annule').length,
  };

  const handleCreateProject = () => {
    setSelectedProject(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditProject = (project: ProjectWithClient) => {
    setSelectedProject(project);
    setIsFormModalOpen(true);
  };

  const handleViewProject = (project: ProjectWithClient) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le chantier "${name}" ?`)) {
      try {
        await deleteProject(id);
      } catch (error: any) {
        alert(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleSubmitProject = async (projectData: any) => {
    if (selectedProject) {
      await updateProject(selectedProject.id, projectData);
    } else {
      await createProject(projectData);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nom', 'Client', 'Statut', 'Montant HT', 'Marge prévue (%)', 'Marge réelle (%)', 'Date début', 'Date fin', 'Adresse'].join(';'),
      ...filteredProjects.map(project => [
        project.name,
        project.client_name || '',
        project.status,
        project.amount_ht.toString(),
        (project.expected_margin_rate || 0).toString(),
        (project.actual_margin_rate || 0).toString(),
        project.start_date || '',
        project.end_date || '',
        project.address || ''
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chantiers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-builty-gray mb-2">Chantiers</h1>
            <p className="text-builty-gray-light text-lg">Gérez vos projets et suivez leur rentabilité</p>
          </div>
          <Button size="lg" onClick={handleCreateProject} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouveau chantier
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-200 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">En attente</p>
            <p className="text-3xl font-extrabold text-builty-gray">{stats.enAttente}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-builty-blue/20 hover:border-builty-blue/40 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">En cours</p>
            <p className="text-3xl font-extrabold text-builty-blue">{stats.enCours}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 hover:border-green-300 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Terminés</p>
            <p className="text-3xl font-extrabold text-green-600">{stats.termine}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-200 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Annulés</p>
            <p className="text-3xl font-extrabold text-builty-gray-light">{stats.annule}</p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b-2 border-gray-100 bg-builty-gray-lighter">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-builty-gray-light" />
              <input
                type="text"
                placeholder="Rechercher un chantier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none bg-white font-medium"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-builty-gray-lighter border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Montant HT
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Marge prévue
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Marge réelle
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredProjects.map((project) => {
                const marginDiff = (project.actual_margin_rate || 0) - (project.expected_margin_rate || 0);
                const isMarginPositive = marginDiff >= 0;

                return (
                  <tr key={project.id} className="hover:bg-builty-gray-lighter/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-builty-gray">{project.name}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-builty-gray-light">
                      {project.client_name}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Badge variant={statusColors[project.status]}>
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-builty-gray">
                      {formatCurrency(project.amount_ht, 2)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-builty-gray">
                      {project.expected_margin_rate || 0}%
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold ${
                          isMarginPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {project.actual_margin_rate || 0}%
                        </span>
                        {isMarginPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-builty-gray-light">
                      <div>
                        {project.start_date && <p>{new Date(project.start_date).toLocaleDateString('fr-FR')}</p>}
                        {project.end_date && <p className="text-xs">au {new Date(project.end_date).toLocaleDateString('fr-FR')}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="p-2 rounded-lg text-builty-gray-light hover:text-builty-blue hover:bg-builty-blue/10 transition-all"
                          title="Voir le chantier"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-2 rounded-lg text-builty-gray-light hover:text-builty-blue hover:bg-builty-blue/10 transition-all"
                          title="Modifier le chantier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="p-2 rounded-lg text-builty-gray-light hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Supprimer le chantier"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-builty-gray-lighter flex items-center justify-center">
              <HardHat className="h-8 w-8 text-builty-gray-light" />
            </div>
            <p className="text-builty-gray font-semibold mb-1">Aucun chantier trouvé</p>
            <p className="text-sm text-builty-gray-light">Créez votre premier chantier pour commencer</p>
          </div>
        )}
      </Card>

      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitProject}
        project={selectedProject}
      />

      {selectedProject && (
        <ProjectViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          project={selectedProject}
          onEdit={() => {
            setIsViewModalOpen(false);
            setIsFormModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
