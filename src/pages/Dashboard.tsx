import { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { FileText, HardHat, Receipt, DollarSign, Wallet, FileCheck, Clock, Crown, Users } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useInvoices } from '../hooks/useInvoices';
import { useQuotes } from '../hooks/useQuotes';
import { useClients } from '../hooks/useClients';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionCard } from '../components/subscription/SubscriptionCard';
import { stripeProducts } from '../stripe-config';
import { supabase } from '../lib/supabase';
import { MarginChart } from '../components/MarginChart';
import { formatCurrency } from '../utils/format';

export function Dashboard() {
  const { projects, loading: loadingProjects } = useProjects();
  const { invoices, loading: loadingInvoices } = useInvoices();
  const { quotes, loading: loadingQuotes } = useQuotes();
  const { clients, loading: loadingClients } = useClients();
  const { subscription, loading: loadingSubscription, isActive } = useSubscription();

  const kpis = useMemo(() => {
    const totalInvoiced = invoices
      .filter(inv => inv.status === 'Payee')
      .reduce((sum, inv) => sum + Number(inv.amount_ttc), 0);

    const totalRevenue = invoices
      .reduce((sum, inv) => sum + Number(inv.amount_ttc), 0);

    const pendingQuotes = quotes.filter(q => q.status === 'Envoye').length;
    const activeProjects = projects.filter(p => p.status === 'En cours').length;
    const clientsCount = clients.length;

    return [
      {
        label: 'Chiffre d\'affaires',
        value: formatCurrency(Math.round(totalRevenue)),
        icon: DollarSign,
        color: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      {
        label: 'Encaissé',
        value: formatCurrency(Math.round(totalInvoiced)),
        icon: Wallet,
        color: 'bg-green-100',
        iconColor: 'text-green-600',
      },
      {
        label: 'Projets actifs',
        value: activeProjects.toString(),
        icon: HardHat,
        color: 'bg-orange-100',
        iconColor: 'text-orange-600',
      },
      {
        label: 'Devis en attente',
        value: pendingQuotes.toString(),
        icon: FileCheck,
        color: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
      },
      {
        label: 'Clients',
        value: clientsCount.toString(),
        icon: Users,
        color: 'bg-purple-100',
        iconColor: 'text-purple-600',
      },
    ];
  }, [invoices, quotes, projects, clients]);

  const alerts = useMemo(() => {
    const alertsList: Array<{ id: string; type: 'warning' | 'info'; message: string }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    invoices.forEach(invoice => {
      if (invoice.status === 'Envoyee' && invoice.due_date) {
        const dueDate = new Date(invoice.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          alertsList.push({
            id: `invoice-overdue-${invoice.id}`,
            type: 'warning',
            message: `Facture ${invoice.invoice_number} en retard de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''} (${formatCurrency(Number(invoice.amount_ttc), 2)})`,
          });
        } else if (diffDays <= 3 && diffDays >= 0) {
          alertsList.push({
            id: `invoice-due-${invoice.id}`,
            type: 'warning',
            message: `Facture ${invoice.invoice_number} échéance dans ${diffDays} jour${diffDays > 1 ? 's' : ''} (${formatCurrency(Number(invoice.amount_ttc), 2)})`,
          });
        }
      }
    });

    const oldQuotes = quotes.filter(quote => {
      if (quote.status === 'Envoye' && quote.created_at) {
        const createdDate = new Date(quote.created_at);
        const diffTime = today.getTime() - createdDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7;
      }
      return false;
    });

    if (oldQuotes.length > 0) {
      alertsList.push({
        id: 'old-quotes',
        type: 'info',
        message: `${oldQuotes.length} devis en attente de relance depuis plus de 7 jours`,
      });
    }

    return alertsList;
  }, [invoices, quotes]);

  const quickActions = [
    { id: 1, label: 'Créer devis', icon: FileText, color: 'bg-blue-500', path: '#/sales/quotes' },
    { id: 2, label: 'Nouveau projet', icon: HardHat, color: 'bg-green-500', path: '#/projects' },
    { id: 3, label: 'Ajouter facture', icon: Receipt, color: 'bg-purple-500', path: '#/sales/invoices' },
  ];

  const handleSubscribe = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        return
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/`,
          mode: 'subscription',
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  const loading = loadingProjects || loadingInvoices || loadingQuotes || loadingClients || loadingSubscription;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const hasActiveSubscription = isActive()

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {!hasActiveSubscription && (
        <div className="mb-10 bg-white rounded-2xl p-10 border-2 border-builty-blue/20 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-builty-blue/10 flex items-center justify-center">
                <Crown className="w-9 h-9 text-builty-blue" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-builty-gray text-center mb-3">
              Bienvenue sur Builty
            </h2>
            <p className="text-center text-builty-gray-light mb-10 max-w-2xl mx-auto text-lg">
              Vous explorez actuellement votre tableau de bord. Activez votre abonnement pour débloquer toutes les fonctionnalités.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {stripeProducts.map((product, index) => (
                <div key={product.id} className="transition-transform hover:scale-105">
                  <SubscriptionCard
                    product={product}
                    isPopular={index === 0}
                    onSubscribe={handleSubscribe}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-builty-gray mb-2">Tableau de bord</h1>
            <p className="text-builty-gray-light text-lg">Vue d'ensemble de votre activité</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-builty-gray-light">Aujourd'hui</p>
            <p className="text-lg font-bold text-builty-gray">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <div 
              key={index} 
              className={`relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-builty-blue/30 transition-all duration-200 hover:shadow-lg group overflow-hidden ${!hasActiveSubscription ? 'opacity-50' : ''}`}
            >
              {!hasActiveSubscription && (
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="bg-builty-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Preview
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${kpi.color} flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
              </div>
              <p className="text-sm text-builty-gray-light font-medium mb-2 leading-tight">{kpi.label}</p>
              <p className="text-2xl font-extrabold text-builty-gray whitespace-nowrap">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Alerts */}
        <div className={`lg:col-span-2 relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-builty-blue/20 transition-all ${!hasActiveSubscription ? 'opacity-50' : ''}`}>
          {!hasActiveSubscription && (
            <div className="absolute -top-2 -right-2">
              <span className="bg-builty-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Preview
              </span>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-builty-gray">Centre d'alertes</h2>
            {alerts.length > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-builty-gray font-semibold mb-1">Tout est à jour</p>
                <p className="text-sm text-builty-gray-light">Aucune alerte pour le moment</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-xl border-l-4 ${
                    alert.type === 'warning'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-blue-50 border-builty-blue'
                  }`}
                >
                  <p className={`text-sm font-medium ${
                    alert.type === 'warning' ? 'text-orange-900' : 'text-blue-900'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-builty-blue/20 transition-all ${!hasActiveSubscription ? 'opacity-50' : ''}`}>
          {!hasActiveSubscription && (
            <div className="absolute -top-2 -right-2">
              <span className="bg-builty-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Preview
              </span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-builty-gray mb-6">Actions rapides</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.id}
                  href={hasActiveSubscription ? action.path : '#'}
                  onClick={(e) => {
                    if (!hasActiveSubscription) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                    !hasActiveSubscription 
                      ? 'cursor-not-allowed bg-gray-50 border-gray-200' 
                      : 'cursor-pointer bg-white border-gray-200 hover:border-builty-blue hover:shadow-md'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-bold text-builty-gray">{action.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className={`relative bg-white rounded-2xl p-8 border-2 border-gray-100 ${!hasActiveSubscription ? 'opacity-50' : ''}`}>
          {!hasActiveSubscription && (
            <div className="absolute -top-2 -right-2">
              <span className="bg-builty-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Preview
              </span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-builty-gray mb-6">Analyse des marges</h2>
          <MarginChart projects={projects} />
        </div>
      </div>
    </div>
  );
}
