import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Filter, Edit, Trash2, Building2, User, Eye, Download } from 'lucide-react';
import { useClients, Client } from '../../hooks/useClients';
import { ClientFormModal } from '../../components/clients/ClientFormModal';
import { ClientViewModal } from '../../components/clients/ClientViewModal';

type ClientType = 'Particulier' | 'Entreprise';

interface ClientWithStats extends Client {
  projectsCount: number;
  quotesCount: number;
  invoicesCount: number;
}

export function Clients() {
  const { clients, loading, createClient, updateClient, deleteClient, getClientStats } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ClientType | 'all'>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [clientsWithStats, setClientsWithStats] = useState<ClientWithStats[]>([]);
  const [selectedClientStats, setSelectedClientStats] = useState({ projectsCount: 0, quotesCount: 0, invoicesCount: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const withStats = await Promise.all(
        clients.map(async (client) => {
          const stats = await getClientStats(client.id);
          return { ...client, ...stats };
        })
      );
      setClientsWithStats(withStats);
    };

    if (clients.length > 0) {
      loadStats();
    }
  }, [clients]);

  const filteredClients = clientsWithStats.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || client.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateClient = () => {
    setSelectedClient(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };

  const handleViewClient = async (client: Client) => {
    const stats = await getClientStats(client.id);
    setSelectedClient(client);
    setSelectedClientStats(stats);
    setIsViewModalOpen(true);
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${name}" ?`)) {
      try {
        await deleteClient(id);
      } catch (error: any) {
        alert(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleSubmitClient = async (clientData: Partial<Client>) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, clientData);
    } else {
      await createClient(clientData);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nom', 'Type', 'Email', 'Téléphone', 'Ville', 'Projets', 'Devis', 'Factures'].join(';'),
      ...filteredClients.map(client => [
        client.name,
        client.type,
        client.email || '',
        client.phone || '',
        client.city || '',
        client.projectsCount.toString(),
        client.quotesCount.toString(),
        client.invoicesCount.toString()
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
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
            <h1 className="text-4xl font-extrabold text-builty-gray mb-2">Clients</h1>
            <p className="text-builty-gray-light text-lg">Gérez votre portefeuille clients</p>
          </div>
          <Button size="lg" onClick={handleCreateClient} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouveau client
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-builty-blue/30 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Total clients</p>
            <p className="text-3xl font-extrabold text-builty-gray">{clientsWithStats.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-builty-blue/20 hover:border-builty-blue/40 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Entreprises</p>
            <p className="text-3xl font-extrabold text-builty-blue">{clientsWithStats.filter(c => c.type === 'Entreprise').length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-300 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Particuliers</p>
            <p className="text-3xl font-extrabold text-purple-600">{clientsWithStats.filter(c => c.type === 'Particulier').length}</p>
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
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none bg-white font-medium"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ClientType | 'all')}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none bg-white font-semibold"
              >
                <option value="all">Tous les types</option>
                <option value="Particulier">Particulier</option>
                <option value="Entreprise">Entreprise</option>
              </select>
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-builty-gray-lighter border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-builty-gray-lighter/50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        client.type === 'Entreprise' ? 'bg-builty-blue/10' : 'bg-purple-100'
                      }`}>
                        {client.type === 'Entreprise' ? (
                          <Building2 className="h-5 w-5 text-builty-blue" />
                        ) : (
                          <User className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-builty-gray">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge variant={client.type === 'Entreprise' ? 'info' : 'default'}>
                      {client.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-builty-gray-light">
                    {client.email || '-'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-builty-gray-light">
                    {client.phone || '-'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-builty-gray-light">
                    {client.city || '-'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm">
                    <div className="flex gap-3">
                      <div className="px-2.5 py-1 bg-builty-blue/10 rounded-lg">
                        <span className="text-xs font-bold text-builty-blue">{client.projectsCount} projet{client.projectsCount > 1 ? 's' : ''}</span>
                      </div>
                      <div className="px-2.5 py-1 bg-green-50 rounded-lg">
                        <span className="text-xs font-bold text-green-700">{client.quotesCount} devis</span>
                      </div>
                      <div className="px-2.5 py-1 bg-builty-orange/10 rounded-lg">
                        <span className="text-xs font-bold text-builty-orange">{client.invoicesCount} facture{client.invoicesCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewClient(client)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-builty-blue hover:bg-builty-blue/10 transition-all"
                        title="Voir le client"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-builty-blue hover:bg-builty-blue/10 transition-all"
                        title="Modifier le client"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Supprimer le client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-builty-gray-lighter flex items-center justify-center">
              <Building2 className="h-8 w-8 text-builty-gray-light" />
            </div>
            <p className="text-builty-gray font-semibold mb-1">Aucun client trouvé</p>
            <p className="text-sm text-builty-gray-light">Ajoutez votre premier client pour commencer</p>
          </div>
        )}
      </Card>

      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitClient}
        client={selectedClient}
      />

      {selectedClient && (
        <ClientViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          client={selectedClient}
          onEdit={() => {
            setIsViewModalOpen(false);
            setIsFormModalOpen(true);
          }}
          stats={selectedClientStats}
        />
      )}
    </div>
  );
}
