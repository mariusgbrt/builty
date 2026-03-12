import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Sparkles } from 'lucide-react';
import { useQuotes, Quote, QuoteItem } from '../../hooks/useQuotes';
import { QuoteFormModal } from '../../components/quotes/QuoteFormModal';
import { QuoteViewModal } from '../../components/quotes/QuoteViewModal';
import { AIQuoteModal } from '../../components/quotes/AIQuoteModal';
import { formatCurrency } from '../../utils/format';

type QuoteStatus = 'Brouillon' | 'Envoye' | 'Accepte' | 'Rejete' | 'Converti';

const statusColors: Record<QuoteStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  'Brouillon': 'default',
  'Envoye': 'info',
  'Accepte': 'success',
  'Rejete': 'error',
  'Converti': 'warning',
};

export function Quotes() {
  const { quotes, loading, createQuote, updateQuote, deleteQuote, getQuoteItems } = useQuotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | 'all'>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>();
  const [selectedQuoteItems, setSelectedQuoteItems] = useState<QuoteItem[]>([]);
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);

  const filteredQuotes = quotes.filter((quote) => {
    const clientName = quote.client?.name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || quote.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quotes.reduce((sum, q) => sum + (q.amount_ht || 0), 0),
    accepted: quotes.filter(q => q.status === 'Accepte').length,
    pending: quotes.filter(q => q.status === 'Envoye').length,
    conversionRate: quotes.length > 0 ? (quotes.filter(q => q.status === 'Accepte').length / quotes.length * 100).toFixed(1) : '0',
  };

  const handleCreateQuote = () => {
    setSelectedQuote(undefined);
    setSelectedQuoteItems([]);
    setIsFormModalOpen(true);
  };

  const handleEditQuote = async (quote: Quote) => {
    const items = await getQuoteItems(quote.id);
    setSelectedQuote(quote);
    setSelectedQuoteItems(items);
    setIsFormModalOpen(true);
  };

  const handleViewQuote = async (quote: Quote) => {
    const items = await getQuoteItems(quote.id);
    setSelectedQuote(quote);
    setSelectedQuoteItems(items);
    setIsViewModalOpen(true);
  };

  const handleDeleteQuote = async (id: string, quoteNumber: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le devis ${quoteNumber} ?`)) {
      try {
        await deleteQuote(id);
      } catch (error: any) {
        alert(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleSubmitQuote = async (quoteData: Partial<Quote>, items: QuoteItem[]) => {
    if (selectedQuote) {
      await updateQuote(selectedQuote.id, quoteData, items);
    } else {
      await createQuote(quoteData, items);
    }
    setAiGeneratedData(null);
  };

  const handleAIQuoteGenerated = (quoteData: any) => {
    setAiGeneratedData(quoteData);
    setSelectedQuote(undefined);
    setIsAIModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Numéro', 'Client', 'Montant HT', 'Statut', 'Date création'].join(';'),
      ...filteredQuotes.map(q => [
        q.quote_number,
        q.client?.name || '',
        q.amount_ht?.toFixed(2) || '0',
        q.status,
        new Date(q.created_at).toLocaleDateString('fr-FR')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `devis_${new Date().toISOString().split('T')[0]}.csv`;
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
            <h1 className="text-4xl font-extrabold text-builty-gray mb-2">Devis</h1>
            <p className="text-builty-gray-light text-lg">Gérez vos devis et suivez leur conversion</p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" variant="outline" onClick={() => setIsAIModalOpen(true)} className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Créer avec IA
            </Button>
            <Button size="lg" onClick={handleCreateQuote} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouveau devis
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-builty-blue/30 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Total devis</p>
            <p className="text-3xl font-extrabold text-builty-gray">{formatCurrency(stats.total)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 hover:border-green-300 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Acceptés</p>
            <p className="text-3xl font-extrabold text-green-600">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-builty-blue/20 hover:border-builty-blue/40 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">En attente</p>
            <p className="text-3xl font-extrabold text-builty-blue">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-builty-orange/20 hover:border-builty-orange/40 transition-all">
            <p className="text-sm text-builty-gray-light font-medium mb-2">Taux conversion</p>
            <p className="text-3xl font-extrabold text-builty-orange">{stats.conversionRate}%</p>
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
                placeholder="Rechercher un devis ou un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none bg-white font-medium"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as QuoteStatus | 'all')}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none bg-white font-semibold"
              >
                <option value="all">Tous les statuts</option>
                <option value="Brouillon">Brouillon</option>
                <option value="Envoye">Envoyé</option>
                <option value="Accepte">Accepté</option>
                <option value="Rejete">Rejeté</option>
                <option value="Converti">Converti</option>
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
                  Montant HT
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Date création
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Score IA
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-builty-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-builty-gray-lighter/50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-builty-blue">
                    {quote.quote_number}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-builty-gray">
                    {quote.client?.name || 'Client inconnu'}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-builty-gray">
                    {formatCurrency(quote.amount_ht || 0)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-builty-gray-light">
                    {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge variant={statusColors[quote.status]}>
                      {quote.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm">
                    {quote.ai_confidence_score ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-builty-blue to-builty-blue-light h-2 rounded-full transition-all"
                            style={{ width: `${quote.ai_confidence_score}%` }}
                          />
                        </div>
                        <span className="text-builty-gray font-bold text-xs">{quote.ai_confidence_score}%</span>
                      </div>
                    ) : (
                      <span className="text-builty-gray-light text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewQuote(quote)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-builty-blue hover:bg-builty-blue/10 transition-all"
                        title="Voir le devis"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditQuote(quote)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-builty-blue hover:bg-builty-blue/10 transition-all"
                        title="Modifier le devis"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(quote.id, quote.quote_number)}
                        className="p-2 rounded-lg text-builty-gray-light hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Supprimer le devis"
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

        {filteredQuotes.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-builty-gray-lighter flex items-center justify-center">
              <Plus className="h-8 w-8 text-builty-gray-light" />
            </div>
            <p className="text-builty-gray font-semibold mb-1">Aucun devis trouvé</p>
            <p className="text-sm text-builty-gray-light">Créez votre premier devis pour commencer</p>
          </div>
        )}
      </Card>

      <AIQuoteModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onQuoteGenerated={handleAIQuoteGenerated}
      />

      <QuoteFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setAiGeneratedData(null);
        }}
        onSubmit={handleSubmitQuote}
        quote={selectedQuote}
        initialItems={selectedQuoteItems}
        aiGeneratedData={aiGeneratedData}
      />

      {selectedQuote && (
        <QuoteViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          quote={selectedQuote}
          items={selectedQuoteItems}
        />
      )}
    </div>
  );
}
