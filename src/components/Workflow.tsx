import { FileText, Calendar, Camera, Receipt, ArrowRight, Sparkles, Clock, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Créer un devis',
    subtitle: 'En 7 minutes chrono',
    description: 'Templates pré-remplis et suggestions intelligentes pour des devis cohérents qui rassurent vos clients',
    features: ['Templates personnalisables', 'Calcul automatique des marges', 'Export PDF professionnel'],
    highlight: 'Templates IA',
    color: 'blue',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Planifier',
    subtitle: 'Vue d\'ensemble claire',
    description: 'Organisez vos chantiers et équipes avec un planning Gantt interactif. Anticipez les conflits de ressources',
    features: ['Planning Gantt visuel', 'Gestion des équipes', 'Alertes automatiques'],
    highlight: 'Vue équipe',
    color: 'orange',
  },
  {
    number: '03',
    icon: Camera,
    title: 'Suivre le chantier',
    subtitle: 'En temps réel',
    description: 'Photos, notes et avancement centralisés. Toute l\'équipe voit où en est le chantier à chaque instant',
    features: ['Photos géolocalisées', 'Timeline interactive', 'Rapports automatiques'],
    highlight: 'Temps réel',
    color: 'blue',
  },
  {
    number: '04',
    icon: Receipt,
    title: 'Facturer & encaisser',
    subtitle: 'Sans relance',
    description: 'Factures automatiques, relances intelligentes et suivi des paiements pour une trésorerie saine',
    features: ['Facturation automatique', 'Relances auto', 'Suivi paiements'],
    highlight: 'Auto-relance',
    color: 'orange',
  },
];

export function Workflow() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-builty-gray-lighter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-builty-blue/10 text-builty-blue font-semibold text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Comment ça marche
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-builty-gray mb-6 tracking-tight">
            Du devis à l'encaissement,{' '}
            <span className="bg-gradient-to-r from-builty-blue to-builty-orange bg-clip-text text-transparent">
              tout est connecté
            </span>
          </h2>
          <p className="text-xl text-builty-gray-light max-w-3xl mx-auto leading-relaxed">
            Un workflow fluide et sans friction, spécialement conçu pour les professionnels du BTP
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 items-center`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`text-6xl font-black ${
                      step.color === 'blue'
                        ? 'text-builty-blue/10'
                        : 'text-builty-orange/10'
                    }`}
                  >
                    {step.number}
                  </div>
                  <div
                    className={`w-16 h-16 rounded-2xl ${
                      step.color === 'blue'
                        ? 'bg-builty-blue'
                        : 'bg-builty-orange'
                    } flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold text-builty-gray">
                      {step.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        step.color === 'blue'
                          ? 'bg-builty-blue/10 text-builty-blue'
                          : 'bg-builty-orange/10 text-builty-orange'
                      }`}
                    >
                      {step.highlight}
                    </span>
                  </div>
                  <p className="text-lg text-builty-gray-light font-medium">
                    {step.subtitle}
                  </p>
                </div>

                <p className="text-lg text-builty-gray-light leading-relaxed">
                  {step.description}
                </p>

                <ul className="space-y-3">
                  {step.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-3 text-builty-gray"
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${
                          step.color === 'blue'
                            ? 'bg-builty-blue/10'
                            : 'bg-builty-orange/10'
                        } flex items-center justify-center flex-shrink-0`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            step.color === 'blue'
                              ? 'bg-builty-blue'
                              : 'bg-builty-orange'
                          }`}
                        ></div>
                      </div>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {index < steps.length - 1 && (
                  <div className="flex items-center gap-3 pt-4">
                    <ArrowRight className="w-5 h-5 text-builty-gray-light" />
                    <span className="text-sm text-builty-gray-light font-medium">
                      Puis automatiquement
                    </span>
                  </div>
                )}
              </div>

              {/* Visual/Screenshot placeholder */}
              <div className="flex-1 w-full">
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-2xl border-4 ${
                    step.color === 'blue'
                      ? 'border-builty-blue/20'
                      : 'border-builty-orange/20'
                  } bg-gradient-to-br ${
                    step.color === 'blue'
                      ? 'from-builty-blue/5 to-builty-blue-light/5'
                      : 'from-builty-orange/5 to-builty-orange-light/5'
                  } aspect-[4/3] group hover:shadow-3xl transition-shadow duration-300`}
                >
                  {/* Screenshots réels */}
                  {index === 0 ? (
                    <img 
                      src="/ai-quote-modal.png" 
                      alt="Interface de création de devis avec l'IA"
                      className="w-full h-full object-cover"
                    />
                  ) : index === 1 ? (
                    <img 
                      src="/planning-screenshot.png" 
                      alt="Planning Gantt avec gestion des équipes et ressources"
                      className="w-full h-full object-cover"
                    />
                  ) : index === 2 ? (
                    <img 
                      src="/project-details-screenshot.png" 
                      alt="Détails et suivi d'un chantier en temps réel"
                      className="w-full h-full object-cover"
                    />
                  ) : index === 3 ? (
                    <img 
                      src="/invoices-screenshot.png" 
                      alt="Gestion et suivi des factures avec paiements"
                      className="w-full h-full object-cover"
                    />
                  ) : null}

                  {/* Overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Floating badge */}
                <div
                  className={`absolute -top-4 -right-4 px-4 py-2 rounded-full ${
                    step.color === 'blue'
                      ? 'bg-builty-blue'
                      : 'bg-builty-orange'
                  } text-white font-bold text-sm shadow-lg flex items-center gap-2`}
                >
                  {step.color === 'blue' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {step.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <a
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-builty-blue to-builty-blue-light text-white rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-200 font-bold text-lg flex items-center gap-2 group"
            >
              Tester gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button
              onClick={() => window.open('https://calendly.com/builtypro/30min', '_blank')}
              className="px-8 py-4 bg-white border-2 border-builty-gray-light/30 text-builty-gray rounded-xl hover:border-builty-blue hover:bg-builty-blue/5 transition-all duration-200 font-bold text-lg"
            >
              Demander une démo
            </button>
          </div>
          <p className="text-sm text-builty-gray-light mt-4">
            14 jours d'essai gratuit • Sans carte bancaire • Support en français
          </p>
        </div>
      </div>
    </section>
  );
}
