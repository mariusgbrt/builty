import { Clock, TrendingDown, Calendar, CreditCard, X, ArrowRight, CheckCircle2 } from 'lucide-react';

const challenges = [
  {
    icon: Clock,
    problem: 'Devis qui traînent',
    story: 'Vous passez 2 heures sur Excel pour faire un devis. Entre-temps, le client a déjà signé ailleurs.',
    solution: 'Templates intelligents : créez un devis pro en 7 minutes',
    impact: 'Répondez 3x plus vite aux demandes'
  },
  {
    icon: TrendingDown,
    problem: 'Marges invisibles',
    story: 'Le chantier est terminé. Vous calculez la rentabilité... surprise : vous avez à peine couvert vos frais.',
    solution: 'Suivi en temps réel : coûts et marges visibles à chaque instant',
    impact: '+22% de marge nette en moyenne'
  },
  {
    icon: Calendar,
    problem: 'Planning qui dérape',
    story: 'Jean est prévu sur 2 chantiers le même jour. Vous l\'apprenez le matin même. Tout le monde attend.',
    solution: 'Planning intelligent : détection automatique des conflits',
    impact: '-40% de conflits de planning'
  },
  {
    icon: CreditCard,
    problem: 'Factures impayées',
    story: 'La facture aurait dû être payée il y a 15 jours. Vous relancez à la main. Le client dit "je n\'ai rien reçu".',
    solution: 'Relances automatiques et suivi des paiements',
    impact: '-35% de factures impayées'
  }
];

export function Challenges() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-builty-gray-lighter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-builty-gray mb-6 tracking-tight">
            Vous reconnaissez{' '}
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              ces galères ?
            </span>
          </h2>
          <p className="text-xl text-builty-gray-light leading-relaxed">
            Ces problèmes du quotidien ne sont pas une fatalité. Voici comment Builty les résout.
          </p>
        </div>

        {/* Challenges grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {challenges.map((challenge, index) => {
            const Icon = challenge.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-builty-blue/20"
              >
                {/* Red accent line */}
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500 to-red-600"></div>
                
                <div className="p-8 pl-10">
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                      <Icon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-builty-gray mb-2 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        {challenge.problem}
                      </h3>
                    </div>
                  </div>

                  {/* Story - Problem */}
                  <div className="mb-6 pl-2 border-l-2 border-red-200">
                    <p className="text-builty-gray-light leading-relaxed pl-4 italic">
                      "{challenge.story}"
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-red-200 to-green-200"></div>
                    <ArrowRight className="w-5 h-5 text-builty-orange" />
                    <div className="h-px flex-1 bg-gradient-to-r from-green-200 to-green-200"></div>
                  </div>

                  {/* Solution */}
                  <div className="mb-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-builty-gray font-semibold mb-1">
                          {challenge.solution}
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700 font-medium">
                            {challenge.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-builty-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
