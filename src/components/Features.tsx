import { useState } from 'react';
import { FileText, Camera, Calendar, Receipt, BarChart3, Users, Check, Sparkles } from 'lucide-react';

const features = [
  {
    id: 'devis',
    icon: FileText,
    title: 'Devis intelligents',
    subtitle: 'Des propositions pro en quelques clics',
    description: 'Créez des devis professionnels rapidement avec nos templates pré-configurés. L\'assistant intelligent suggère les lignes adaptées à votre métier.',
    benefits: [
      'Templates personnalisables par type de chantier',
      'Bibliothèque de prestations pré-remplies',
      'Calcul automatique des marges et rentabilité',
      'Export PDF avec votre charte graphique',
      'Envoi par email avec suivi d\'ouverture',
      'Transformation en projet en 1 clic'
    ],
    stats: { value: '7min', label: 'pour créer un devis' }
  },
  {
    id: 'planning',
    icon: Calendar,
    title: 'Planning & équipes',
    subtitle: 'Vue d\'ensemble sur tous vos chantiers',
    description: 'Planifiez vos chantiers et vos équipes avec un planning Gantt interactif. Anticipez les conflits et optimisez vos ressources.',
    benefits: [
      'Planning Gantt avec glisser-déposer',
      'Gestion multi-équipes et sous-traitants',
      'Détection automatique des conflits',
      'Vue calendrier mensuel/annuel',
      'Synchronisation mobile en temps réel',
      'Export planning PDF pour chantier'
    ],
    stats: { value: '-40%', label: 'de conflits de planning' }
  },
  {
    id: 'suivi',
    icon: Camera,
    title: 'Suivi chantier',
    subtitle: 'Tout le chantier dans votre poche',
    description: 'Photos, notes, incidents : centralisez toutes les infos terrain. L\'équipe et vous restez synchronisés en permanence.',
    benefits: [
      'Photos géolocalisées et horodatées',
      'Notes vocales converties en texte',
      'Timeline d\'avancement visuelle',
      'Rapports automatiques par chantier',
      'Partage avec clients et équipes',
      'Mode hors-ligne pour le terrain'
    ],
    stats: { value: '100%', label: 'de traçabilité' }
  },
  {
    id: 'facturation',
    icon: Receipt,
    title: 'Facturation',
    subtitle: 'Encaissez plus vite, sans relance',
    description: 'Transformez vos devis en factures automatiquement. Relances intelligentes et suivi des paiements pour une trésorerie saine.',
    benefits: [
      'Transformation devis → facture en 1 clic',
      'Acomptes et situations de travaux',
      'Relances automatiques avant échéance',
      'Suivi des paiements en temps réel',
      'Exports comptables FEC',
      'Archivage légal conforme'
    ],
    stats: { value: '-35%', label: 'de factures impayées' }
  },
  {
    id: 'compta',
    icon: BarChart3,
    title: 'Comptabilité',
    subtitle: 'Vos chiffres en temps réel',
    description: 'Suivez vos coûts, marges et rentabilité chantier par chantier. Prenez les bonnes décisions au bon moment.',
    benefits: [
      'Tableau de bord en temps réel',
      'Rentabilité par chantier',
      'Suivi budget vs dépensé',
      'Prévisionnel de trésorerie',
      'Export Excel pour comptable',
      'Intégration logiciels compta'
    ],
    stats: { value: '+22%', label: 'de marge nette' }
  },
  {
    id: 'portail',
    icon: Users,
    title: 'Portail client',
    subtitle: 'Vos clients autonomes et rassurés',
    description: 'Offrez à vos clients un espace dédié pour suivre leurs projets, consulter les documents et valider les étapes.',
    benefits: [
      'Accès sécurisé pour chaque client',
      'Consultation devis et factures',
      'Suivi d\'avancement en direct',
      'Galerie photos du chantier',
      'Messagerie intégrée',
      'Validation documents en ligne'
    ],
    stats: { value: '4.8/5', label: 'satisfaction client' }
  }
];

export function Features() {
  const [activeTab, setActiveTab] = useState('devis');
  const activeFeature = features.find(f => f.id === activeTab) || features[0];
  const Icon = activeFeature.icon;

  return (
    <section id="fonctionnalites" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-builty-orange/10 text-builty-orange font-semibold text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Fonctionnalités
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-builty-gray mb-6 tracking-tight">
            Tout ce dont vous avez besoin{' '}
            <span className="bg-gradient-to-r from-builty-blue to-builty-orange bg-clip-text text-transparent">
              dans un seul outil
            </span>
          </h2>
          <p className="text-xl text-builty-gray-light max-w-3xl mx-auto">
            Une suite complète et intégrée, pensée pour les artisans et TPE du bâtiment
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {features.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === feature.id
                    ? 'bg-builty-blue text-white shadow-lg scale-105'
                    : 'bg-builty-gray-lighter text-builty-gray hover:bg-builty-blue/10'
                }`}
              >
                <FeatureIcon className="w-5 h-5" />
                {feature.title}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Description */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-builty-blue to-builty-blue-light flex items-center justify-center shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-builty-gray">
                    {activeFeature.title}
                  </h3>
                  <p className="text-builty-gray-light font-medium">
                    {activeFeature.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-lg text-builty-gray-light leading-relaxed">
                {activeFeature.description}
              </p>
            </div>

            {/* Benefits list */}
            <div className="space-y-3">
              {activeFeature.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-200 transition-colors">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-builty-gray leading-relaxed">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Stat highlight */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-builty-blue/10 to-builty-orange/10 border-2 border-builty-blue/20">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-builty-blue to-builty-orange bg-clip-text text-transparent">
                {activeFeature.stats.value}
              </div>
              <div className="text-sm text-builty-gray-light font-medium">
                {activeFeature.stats.label}
              </div>
            </div>
          </div>

          {/* Right: Visual/Screenshot */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-builty-blue/20 to-builty-orange/20 rounded-3xl blur-2xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-builty-blue/5 to-builty-blue-light/5 aspect-[4/3]">
              {/* Screenshot placeholder */}
              <div className="w-full h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <Icon className="w-32 h-32 mx-auto mb-6 text-builty-blue/20" />
                  <p className="text-builty-gray-light font-medium mb-2">
                    Screenshot de la fonctionnalité
                  </p>
                  <p className="text-sm text-builty-gray-light/60">
                    "{activeFeature.title}"
                  </p>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-builty-orange text-white font-bold text-sm shadow-xl">
              Inclus dans tous les plans
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-builty-blue to-builty-blue-light text-white rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-200 font-bold text-lg group"
          >
            Découvrir toutes les fonctionnalités
            <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
