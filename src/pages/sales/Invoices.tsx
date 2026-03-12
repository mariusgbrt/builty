import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Filter, Download, Eye, Send, Edit, Trash2 } from 'lucide-react';
import { useInvoices, Invoice, InvoiceItem } from '../../hooks/useInvoices';
import { InvoiceFormModal } from '../../components/invoices/InvoiceFormModal';
import { InvoiceViewModal } from '../../components/invoices/InvoiceViewModal';
import { formatCurrency } from '../../utils/format';

type InvoiceStatus = 'Brouillon' | 'Envoyee' | 'Partielle' | 'Payee' | 'En retard' | 'Annulee';

const statusColors: Record<InvoiceStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  'Brouillon': 'default',
  'Envoyee': 'info',
  'Partielle': 'warning',
  'Payee': 'success',
  'En retard': 'error',
  'Annulee': 'default',
};

export function Invoices() {
  const { invoices, loading, createInvoice, updateInvoice, deleteInvoice, getInvoiceItems } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState<InvoiceItem[]>([]);

  const filteredInvoices = invoices.filter((invoice) => {
    const clientName = invoice.client?.name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.reduce((sum, inv) => sum + (inv.amount_ttc || 0), 0),
    paid: invoices.filter(inv => inv.status === 'Payee').length,
    overdue: invoices.filter(inv => inv.status === 'En retard').length,
    recoveryRate: invoices.reduce((sum, inv) => sum + (inv.amount_ttc || 0), 0) > 0
      ? (invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) /
         invoices.reduce((sum, inv) => sum + (inv.amount_ttc || 0), 0) * 100).toFixed(1)
      : '0',
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(undefined);
    setSelectedInvoiceItems([]);
    setIsFormModalOpen(true);
  };

  const handleEditInvoice = async (invoice: Invoice) => {
    const items = await getInvoiceItems(invoice.id);
    setSelectedInvoice(invoice);
    setSelectedInvoiceItems(items);
    setIsFormModalOpen(true);
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    const items = await getInvoiceItems(invoice.id);
    setSelectedInvoice(invoice);
    setSelectedInvoiceItems(items);
    setIsViewModalOpen(true);
  };

  const handleDeleteInvoice = async (id: string, invoiceNumber: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoiceNumber} ?`)) {
      try {
        await deleteInvoice(id);
      } catch (error: any) {
        alert(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleSubmitInvoice = async (invoiceData: Partial<Invoice>, items: InvoiceItem[]) => {
    if (selectedInvoice) {
      await updateInvoice(selectedInvoice.id, invoiceData, items);
    } else {
      await createInvoice(invoiceData, items);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Numéro', 'Client', 'Montant TTC', 'Montant payé', 'Statut', 'Date émission', 'Échéance'].join(';'),
      ...filteredInvoices.map(inv => [
        inv.invoice_number,
        inv.client?.name || '',
        inv.amount_ttc?.toFixed(2) || '0',
        inv.amount_paid?.toFixed(2) || '0',
        inv.status,
        new Date(inv.issue_date).toLocaleDateString('fr-FR'),
        new Date(inv.due_date).toLocaleDateString('fr-FR')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `factures_${new Date().toISOString().split('T')[0]}.csv`;
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
            <h1 className="text-4xl font-extrabold text-builty-gray mb-2">Factures</h1>
            <p className="text-builty-gray-light text-lg">Gérez vos factures et suivez les paiements</p>
          </div>
          <Button size="lg" onClick={handleCreateInvoice} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouvelle facture
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-builty-blue/30 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Total factures</p>
            <p className="text-3xl font-extrabold text-builty-gray">{formatCurrency(stats.total)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 hover:border-green-300 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Payées</p>
            <p className="text-3xl font-extrabold text-green-600">{stats.paid}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-red-200 hover:border-red-300 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">En retard</p>
            <p className="text-3xl font-extrabold text-red-600">{stats.overdue}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-builty-blue/20 hover:border-builty-blue/40 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Taux recouvrement</p>
            <p className="text-3xl font-extrabold text-builty-blue">{stats.recoveryRate}%</p>
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
                placeholder="Rechercher une facture ou un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none bg-white font-medium"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as InvoiceStatus | 'all')}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none bg-white font-semibold"
              >
                <option value="all">Tous les statuts</option>
                <option value="Brouillon">Brouillon</option>
                <option value="Envoyee">Envoyée</option>
                <option value="Partielle">Partielle</option>
                <option value="Payee">Payée</option>
                <option value="En retard">En retard</option>
                <option value="Annulee">Annulée</option>
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
                  Numéro
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Montant TTC
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Date émission
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-builty-gray-lighter/50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-builty-blue">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-builty-gray">
                    {invoice.client?.name || 'Client inconnu'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm">
                    <div>
                      <p className="font-bold text-builty-gray">{formatCurrency(invoice.amount_ttc || 0)}</p>
                      {(invoice.amount_paid || 0) > 0 && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          Payé: {formatCurrency(invoice.amount_paid || 0)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-builty-gray-light">
                    {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-builty-gray-light">
                    {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge variant={statusColors[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-builty-blue hover:bg-builty-blue/10 transition-all"
                        title="Voir la facture"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-builty-blue hover:bg-builty-blue/10 transition-all"
                        title="Modifier la facture"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id, invoice.invoice_number)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Supprimer la facture"
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

        {filteredInvoices.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-builty-gray-lighter flex items-center justify-center">
              <Plus className="h-8 w-8 text-builty-gray-light" />
            </div>
            <p className="text-builty-gray font-semibold mb-1">Aucune facture trouvée</p>
            <p className="text-sm text-builty-gray-light">Créez votre première facture pour commencer</p>
          </div>
        )}
      </Card>

      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitInvoice}
        invoice={selectedInvoice}
        initialItems={selectedInvoiceItems}
      />

      {selectedInvoice && (
        <InvoiceViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          invoice={selectedInvoice}
          items={selectedInvoiceItems}
        />
      )}
    </div>
  );
}
