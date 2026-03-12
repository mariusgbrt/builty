import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Plus, Download, Edit, Trash2, Users, ChevronDown, ChevronUp, HardHat, User, Building2, Truck, Wrench, Calendar } from 'lucide-react';
import { useResources, Resource } from '../hooks/useResources';
import { useAllocations, AllocationWithDetails } from '../hooks/useAllocations';
import { AllocationFormModal } from '../components/allocations/AllocationFormModal';
import { AllocationViewModal } from '../components/allocations/AllocationViewModal';
import { ResourceFormModal } from '../components/resources/ResourceFormModal';

type ResourceType = 'Ouvrier' | 'Independant' | 'Sous-traitant' | 'Vehicule' | 'Outil';

const getResourceTypeIcon = (type: ResourceType) => {
  switch (type) {
    case 'Ouvrier':
      return <HardHat className="h-5 w-5" />;
    case 'Independant':
      return <User className="h-5 w-5" />;
    case 'Sous-traitant':
      return <Building2 className="h-5 w-5" />;
    case 'Vehicule':
      return <Truck className="h-5 w-5" />;
    case 'Outil':
      return <Wrench className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const projectColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500',
];

const getProjectColor = (projectId: string) => {
  const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return projectColors[hash % projectColors.length];
};

export function Planning() {
  const { resources, loading: loadingResources, createResource, updateResource, deleteResource } = useResources();
  const { allocations, loading: loadingAllocations, createAllocation, updateAllocation, deleteAllocation } = useAllocations();
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationWithDetails | undefined>();
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();
  const [preSelectedDate, setPreSelectedDate] = useState<string | undefined>();
  const [preSelectedResourceId, setPreSelectedResourceId] = useState<string | undefined>();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleCreateAllocation = (date?: string, resourceId?: string) => {
    setSelectedAllocation(undefined);
    setPreSelectedDate(date);
    setPreSelectedResourceId(resourceId);
    setIsFormModalOpen(true);
  };

  const handleEditAllocation = (allocation: AllocationWithDetails) => {
    setSelectedAllocation(allocation);
    setPreSelectedDate(undefined);
    setPreSelectedResourceId(undefined);
    setIsFormModalOpen(true);
  };

  const handleViewAllocation = (allocation: AllocationWithDetails) => {
    setSelectedAllocation(allocation);
    setIsViewModalOpen(true);
  };

  const handleDeleteAllocation = async (id: string, projectName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette affectation pour "${projectName}" ?`)) {
      try {
        await deleteAllocation(id);
      } catch (error: any) {
        alert(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleSubmitAllocation = async (allocationData: any) => {
    if (selectedAllocation) {
      await updateAllocation(selectedAllocation.id, allocationData);
    } else {
      await createAllocation(allocationData);
    }
  };

  const handleCreateResource = () => {
    setSelectedResource(undefined);
    setIsResourceModalOpen(true);
  };

  const handleSubmitResource = async (resourceData: Partial<Resource>) => {
    if (selectedResource) {
      await updateResource(selectedResource.id, resourceData);
    } else {
      await createResource(resourceData);
    }
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsResourceModalOpen(true);
  };

  const handleDeleteResource = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la ressource "${name}" ?`)) {
      try {
        await deleteResource(id);
      } catch (error: any) {
        alert(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Ressource', 'Type', 'Projet', 'Date', 'Heure début', 'Heure fin', 'Statut', 'Notes'].join(';'),
      ...allocations.map(allocation => [
        allocation.resource_name || '',
        allocation.resource_type || '',
        allocation.project_name || '',
        allocation.date,
        allocation.start_time,
        allocation.end_time,
        allocation.status,
        allocation.notes || ''
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `planning_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const activeResources = resources.filter(r => r.status === 'Actif');

  const resourcesByType = activeResources.reduce((acc, resource) => {
    if (!acc[resource.type]) acc[resource.type] = [];
    acc[resource.type].push(resource);
    return acc;
  }, {} as Record<ResourceType, Resource[]>);

  const getAllocationsForResourceAndDate = (resourceId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allocations.filter(
      (alloc) => alloc.resource_id === resourceId && alloc.date === dateStr && alloc.status !== 'Annule'
    );
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const allocationsInWeek = allocations.filter((alloc) => {
    if (alloc.status === 'Annule') return false;
    const allocDate = new Date(alloc.date);
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return allocDate >= currentWeekStart && allocDate <= weekEnd;
  });

  const projectsWithAllocations = allocationsInWeek.reduce((acc, alloc) => {
    if (!acc[alloc.project_id]) {
      acc[alloc.project_id] = {
        id: alloc.project_id,
        name: alloc.project_name || 'Projet sans nom',
        allocations: []
      };
    }
    acc[alloc.project_id].allocations.push(alloc);
    return acc;
  }, {} as Record<string, { id: string; name: string; allocations: AllocationWithDetails[] }>);

  const projectsList = Object.values(projectsWithAllocations).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const getResourcesForProject = (projectId: string) => {
    const projectAllocs = projectsWithAllocations[projectId]?.allocations || [];
    const resourceIds = new Set(projectAllocs.map(a => a.resource_id));
    return activeResources.filter(r => resourceIds.has(r.id));
  };

  const getAllocationsForProjectResourceAndDate = (projectId: string, resourceId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allocations.filter(
      (alloc) =>
        alloc.project_id === projectId &&
        alloc.resource_id === resourceId &&
        alloc.date === dateStr &&
        alloc.status !== 'Annule'
    );
  };

  if (loadingResources || loadingAllocations) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const selectedDay = weekDays[selectedDayIndex];
  const goToPreviousDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    } else {
      goToPreviousWeek();
      setSelectedDayIndex(6);
    }
  };

  const goToNextDay = () => {
    if (selectedDayIndex < 6) {
      setSelectedDayIndex(selectedDayIndex + 1);
    } else {
      goToNextWeek();
      setSelectedDayIndex(0);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-full">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-builty-gray mb-2">Planning</h1>
            <p className="text-sm md:text-base text-gray-600">Gérez vos ressources et affectations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport} className="flex-1 md:flex-none">
              <Download className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Exporter</span>
            </Button>
            <Button variant="outline" onClick={handleCreateResource} className="flex-1 md:flex-none">
              <Users className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Ressources</span>
            </Button>
            <Button onClick={() => handleCreateAllocation()} className="flex-1 md:flex-none">
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Affectation</span>
            </Button>
          </div>
        </div>

        {isMobile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
              <Button variant="outline" size="sm" onClick={goToPreviousDay} className="p-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {selectedDay.toLocaleDateString('fr-FR', { weekday: 'long' })}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {selectedDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={goToNextDay} className="p-2">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-2 snap-x snap-mandatory">
              {weekDays.map((day, index) => {
                const isSelected = index === selectedDayIndex;
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDayIndex(index)}
                    className={`flex-shrink-0 snap-start px-3 py-2 rounded-lg text-center min-w-[60px] transition-colors ${
                      isSelected
                        ? 'bg-builty-blue text-white shadow-md'
                        : isToday
                        ? 'bg-blue-50 text-builty-blue border-2 border-builty-blue'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {day.toLocaleDateString('fr-FR', { weekday: 'short' }).substring(0, 3)}
                    </div>
                    <div className="text-sm font-bold mt-0.5">
                      {day.getDate()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold">
              Semaine du {currentWeekStart.toLocaleDateString('fr-FR')}
            </div>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {projectsList.map((project) => {
            const isExpanded = expandedProjects.has(project.id);
            const projectResources = getResourcesForProject(project.id);
            const resourcesByTypeForProject = projectResources.reduce((acc, resource) => {
              if (!acc[resource.type]) acc[resource.type] = [];
              acc[resource.type].push(resource);
              return acc;
            }, {} as Record<ResourceType, Resource[]>);

            const hasAllocationsForDay = project.allocations.some(
              a => a.date === selectedDay.toISOString().split('T')[0]
            );

            if (!hasAllocationsForDay) return null;

            return (
              <Card key={project.id} className="overflow-hidden">
                <div
                  className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 cursor-pointer border-b-2 border-gray-200 active:bg-gray-200 transition-colors"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-builty-blue" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-builty-blue" />
                      )}
                      <span className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        {project.name}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="divide-y divide-gray-200">
                    {Object.entries(resourcesByTypeForProject).map(([type, typeResources]) => (
                      <div key={type}>
                        <div className="bg-builty-gray-lighter px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                          <span className="text-gray-600">{getResourceTypeIcon(type as ResourceType)}</span>
                          <span className="font-semibold text-sm text-gray-700">{type}s</span>
                        </div>
                        {typeResources.map((resource) => {
                          const dayAllocations = getAllocationsForProjectResourceAndDate(
                            project.id,
                            resource.id,
                            selectedDay
                          );
                          const dateStr = selectedDay.toISOString().split('T')[0];

                          if (dayAllocations.length === 0) return null;

                          return (
                            <div key={resource.id} className="bg-white">
                              <div className="px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-semibold text-sm text-gray-900">
                                    {resource.name}
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditResource(resource)}
                                      className="p-2 text-gray-400 hover:text-builty-blue hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Modifier"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleCreateAllocation(dateStr, resource.id)}
                                      className="p-2 text-gray-400 hover:text-builty-blue hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Ajouter une affectation"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {dayAllocations.map((alloc) => (
                                    <div
                                      key={alloc.id}
                                      className={`${getProjectColor(alloc.project_id)} text-white rounded-lg p-3 shadow-md active:shadow-lg transition-shadow`}
                                      onClick={() => handleViewAllocation(alloc)}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="font-semibold text-sm flex-1">
                                          {alloc.project_name}
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditAllocation(alloc);
                                            }}
                                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                                            title="Modifier"
                                          >
                                            <Edit className="h-3.5 w-3.5" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteAllocation(alloc.id, alloc.project_name || '');
                                            }}
                                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                                            title="Supprimer"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="text-xs opacity-95 font-medium">
                                        {alloc.start_time} - {alloc.end_time}
                                      </div>
                                      {alloc.notes && (
                                        <div className="text-xs opacity-90 mt-1 line-clamp-2">
                                          {alloc.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          {projectsList.filter(p =>
            p.allocations.some(a => a.date === selectedDay.toISOString().split('T')[0])
          ).length === 0 && (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Aucune affectation ce jour</p>
              <Button onClick={() => handleCreateAllocation(selectedDay.toISOString().split('T')[0])}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une affectation
              </Button>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="grid grid-cols-8 border-b-2 border-gray-300 bg-gradient-to-b from-gray-100 to-gray-50 sticky top-0 shadow-sm">
                <div className="px-4 py-4 text-sm font-bold text-gray-900 border-r border-gray-200 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-builty-blue" />
                  <span className="uppercase tracking-wide text-xs">Ressources</span>
                </div>
                {weekDays.map((day, index) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={index}
                      className={`px-4 py-3 text-center border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className={`text-xs font-semibold uppercase tracking-wide ${
                        isToday ? 'text-builty-blue' : 'text-gray-500'
                      }`}>
                        {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                      <div className={`text-sm font-bold mt-0.5 ${
                        isToday ? 'text-builty-blue' : 'text-gray-900'
                      }`}>
                        {day.getDate()}/{day.getMonth() + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {projectsList.map((project) => {
                const isExpanded = expandedProjects.has(project.id);
                const projectResources = getResourcesForProject(project.id);
                const resourcesByTypeForProject = projectResources.reduce((acc, resource) => {
                  if (!acc[resource.type]) acc[resource.type] = [];
                  acc[resource.type].push(resource);
                  return acc;
                }, {} as Record<ResourceType, Resource[]>);

                return (
                  <div key={project.id}>
                    <div
                      className="grid grid-cols-8 border-b-2 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 cursor-pointer transition-colors"
                      onClick={() => toggleProject(project.id)}
                    >
                      <div className="px-4 py-3.5 text-sm font-bold text-gray-900 border-r border-gray-200 flex items-center">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 mr-2 text-builty-blue" />
                        ) : (
                          <ChevronRight className="h-5 w-5 mr-2 text-builty-blue" />
                        )}
                        <span className="uppercase tracking-wide text-xs">{project.name}</span>
                      </div>
                      {weekDays.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="px-2 py-3 border-r border-gray-200 last:border-r-0"
                        />
                      ))}
                    </div>

                    {isExpanded && Object.entries(resourcesByTypeForProject).map(([type, typeResources]) => (
                      <div key={type}>
                        <div className="bg-builty-gray-lighter px-4 py-3 font-semibold text-sm text-gray-700 border-b border-gray-200 pl-8 flex items-center gap-2">
                          <span className="text-gray-600">{getResourceTypeIcon(type as ResourceType)}</span>
                          <span>{type}s</span>
                        </div>
                        {typeResources.map((resource) => (
                          <div key={resource.id} className="grid grid-cols-8 border-b border-gray-200 hover:bg-gray-50 transition-colors group">
                            <div className="px-4 py-3.5 border-r border-gray-200 flex items-center relative">
                              <div className="flex-1 flex items-center justify-center">
                                <span className="font-semibold text-sm text-gray-900 text-center">{resource.name}</span>
                              </div>
                              <div className="absolute right-2 hidden group-hover:flex gap-1 bg-white rounded-lg shadow-md border border-gray-200 p-1">
                                <button
                                  onClick={() => handleEditResource(resource)}
                                  className="p-1.5 text-gray-400 hover:text-builty-blue hover:bg-blue-50 rounded transition-colors"
                                  title="Modifier"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteResource(resource.id, resource.name)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {weekDays.map((day, dayIndex) => {
                              const dayAllocations = getAllocationsForProjectResourceAndDate(
                                project.id,
                                resource.id,
                                day
                              );
                              const dateStr = day.toISOString().split('T')[0];
                              const isToday = day.toDateString() === new Date().toDateString();
                              return (
                                <div
                                  key={dayIndex}
                                  className={`px-2 py-3 border-r border-gray-200 last:border-r-0 min-h-[80px] cursor-pointer hover:bg-blue-50 transition-colors ${
                                    isToday ? 'bg-blue-50/30 border-l-2 border-l-[#0D47A1]' : ''
                                  }`}
                                  onClick={() => handleCreateAllocation(dateStr, resource.id)}
                                >
                                  <div className="space-y-1.5">
                                    {dayAllocations.map((alloc) => (
                                      <div
                                        key={alloc.id}
                                        className={`${getProjectColor(alloc.project_id)} text-white text-xs rounded-md px-2.5 py-1.5 group relative shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewAllocation(alloc);
                                        }}
                                      >
                                        <div className="font-semibold truncate text-[11px] leading-tight mb-0.5">
                                          {alloc.project_name}
                                        </div>
                                        <div className="text-[10px] opacity-95 font-medium">
                                          {alloc.start_time} - {alloc.end_time}
                                        </div>
                                        <div className="absolute -top-1 -right-1 hidden group-hover:flex bg-white rounded-md shadow-lg border border-gray-200 divide-x divide-gray-200">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditAllocation(alloc);
                                            }}
                                            className="p-1.5 text-gray-600 hover:text-builty-blue hover:bg-blue-50 transition-colors rounded-l-md"
                                            title="Modifier"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteAllocation(alloc.id, alloc.project_name || '');
                                            }}
                                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors rounded-r-md"
                                            title="Supprimer"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {projectsList.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Aucun chantier avec des affectations cette semaine
            </div>
          )}
        </Card>
      )}

      <ResourceFormModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onSubmit={handleSubmitResource}
        resource={selectedResource}
      />

      <AllocationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitAllocation}
        allocation={selectedAllocation}
        preSelectedDate={preSelectedDate}
        preSelectedResourceId={preSelectedResourceId}
      />

      {selectedAllocation && (
        <AllocationViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          allocation={selectedAllocation}
          onEdit={() => {
            setIsViewModalOpen(false);
            setIsFormModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
