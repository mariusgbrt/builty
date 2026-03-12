import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Download, Building2 } from 'lucide-react';
import { Quote, QuoteItem } from '../../hooks/useQuotes';
import { useCompany } from '../../hooks/useCompany';
import { generateQuotePDF } from '../../lib/pdfGenerator';

interface QuoteViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  items: QuoteItem[];
}

const statusColors: Record<Quote['status'], 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  'Brouillon': 'default',
  'Envoye': 'info',
  'Accepte': 'success',
  'Rejete': 'error',
  'Converti': 'warning',
};

export function QuoteViewModal({ isOpen, onClose, quote, items }: QuoteViewModalProps) {
  const { company } = useCompany();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!company) {
      alert('Informations entreprise manquantes');
      return;
    }

    try {
      setDownloading(true);
      await generateQuotePDF(quote, items, company, quote.client);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setDownloading(false);
    }
  };

  const primaryColor = company?.primary_color || '#0D47A1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du devis">
      <div className="space-y-6">
        {company && (
          <div className="flex items-center justify-between p-4 bg-builty-gray-lighter rounded-lg border">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{company.name}</h4>
                {company.email && (
                  <p className="text-sm text-gray-600">{company.email}</p>
                )}
                {company.phone && (
                  <p className="text-sm text-gray-600">{company.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-builty-gray">{quote.quote_number}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <Badge variant={statusColors[quote.status]}>{quote.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-builty-gray-lighter rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Client</p>
            <p className="font-medium text-gray-900">
              {quote.client?.name || 'Client inconnu'}
            </p>
          </div>
          {quote.ai_confidence_score && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Score IA</p>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${quote.ai_confidence_score}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{quote.ai_confidence_score}%</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Lignes du devis</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qté</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">PU HT</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">TVA</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {item.unit_price_ht.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{item.tva_rate}%</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {item.total_ht.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total HT:</span>
            <span className="font-semibold">{quote.amount_ht?.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA:</span>
            <span className="font-semibold">{quote.tva_amount?.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total TTC:</span>
            <span style={{ color: primaryColor }}>{quote.amount_ttc?.toFixed(2)} €</span>
          </div>
        </div>

        {quote.notes && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Génération...' : 'Télécharger PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
