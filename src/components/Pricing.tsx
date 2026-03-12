import { useState } from 'react';
import { Check, Star, Zap, Building2, ArrowRight, Shield, Users, TrendingUp, User } from 'lucide-react';

const plans = [
  {
    name: 'SOLO',
    description: 'Pour les entrepreneurs solo',
    monthlyPrice: 49,
    annualPrice: 39,
    icon: User,
    tagline: 'Idéal micro-entreprise',
    features: [
      '1 utilisateur',
      '3 chantiers actifs simultanés',
      'Devis professionnels illimités',
      'Facturation simplifiée',
      'Planning personnel',
      'Suivi de chantier photo',
      'Application mobile',
      'Support email'
    ],
    cta: 'Commencer gratuitement',
    highlighted: false
  },
  {
    name: 'REGULAR',
    description: 'Idéal pour démarrer efficacement',
    monthlyPrice: 89,
    annualPrice: 71,
    icon: Zap,
    tagline: 'L\'essentiel pour bien gérer',
    features: [
      'Jusqu\'à 8 collaborateurs',
      '5 chantiers actifs simultanés',
      'Tout de SOLO, plus :',
      'Gestion multi-utilisateurs',
      'Planning visuel des équipes',
      'Facturation automatique avancée',
      'Exports PDF personnalisés',
      'Support réactif sous 24h'
    ],
    cta: 'Commencer l\'essai gratuit',
    highlighted: false
  },
  {
    name: 'PRO',
    description: 'Pour développer votre activité',
    monthlyPrice: 169,
    annualPrice: 135,
    icon: Star,
    badge: 'Recommandé',
    tagline: 'La solution complète',
    features: [
      'Jusqu\'à 15 collaborateurs',
      '8 chantiers actifs simultanés',
      'Tout de REGULAR, plus :',
      'Bibliothèque de templates',
      'Planning optimisé et prévisionnel',
      'Portail client personnalisé',
      'Exports comptables FEC',
      'Rapports de rentabilité',
      'Accès API pour intégrations',
      'Support prioritaire sous 4h'
    ],
    cta: 'Démarrer avec PRO',
    highlighted: true
  },
  {
    name: 'ENTREPRISE',
    description: 'Solution sur mesure pour PME',
    monthlyPrice: null,
    annualPrice: null,
    icon: Building2,
    tagline: 'Accompagnement personnalisé',
    features: [
      'Utilisateurs illimités',
      'Chantiers illimités',
      'Tout de PRO, plus :',
      'Intégrations personnalisées',
      'Formation complète sur site',
      'Account manager dédié',
      'Garantie disponibilité 99,9%',
      'Hébergement France sécurisé',
      'Audit de sécurité annuel',
      'Support premium 7j/7'
    ],
    cta: 'Parler à un expert',
    highlighted: false
  }
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const savings = isAnnual ? 20 : 0;

  return (
    <section id="tarifs" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-builty-gray mb-6 tracking-tight leading-tight">
            Des tarifs <span className="text-builty-blue">simples et transparents</span>
          </h2>
          <p className="text-xl text-builty-gray-light mb-10 max-w-3xl mx-auto">
            Choisissez la formule adaptée à la taille de votre entreprise
          </p>
          
          {/* Trust badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-4 bg-builty-gray-lighter rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 text-builty-gray text-sm font-medium">
              <Check className="w-5 h-5 text-builty-blue" />
              <span>Essai 14 jours gratuit</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-builty-gray text-sm font-medium">
              <Check className="w-5 h-5 text-builty-blue" />
              <span>Sans engagement</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2 text-builty-gray text-sm font-medium">
              <Check className="w-5 h-5 text-builty-blue" />
              <span>Résiliation en 1 clic</span>
            </div>
          </div>

          {/* Toggle Annual/Monthly */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-lg font-medium ${!isAnnual ? 'text-builty-gray' : 'text-builty-gray-light'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                isAnnual ? 'bg-builty-blue' : 'bg-builty-gray-light'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-0'
                }`}
              ></div>
            </button>
            <span className={`text-lg font-medium ${isAnnual ? 'text-builty-gray' : 'text-builty-gray-light'}`}>
              Annuel
            </span>
            {isAnnual && (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                -{savings}% 🎉
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {plans.map((plan, index) => {
            const PlanIcon = plan.icon;
            const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            
            return (
              <div
                key={index}
                className={`relative bg-white rounded-3xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'scale-105 shadow-2xl border-4 border-builty-blue ring-4 ring-builty-blue/10'
                    : 'shadow-lg hover:shadow-xl border-2 border-gray-100'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="px-5 py-2 rounded-full bg-gradient-to-r from-builty-orange to-builty-orange-light text-white font-bold text-sm shadow-lg flex items-center gap-2 whitespace-nowrap">
                      <Star className="w-4 h-4 fill-white" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Icon & Tagline */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-xl ${
                    plan.highlighted 
                      ? 'bg-builty-blue' 
                      : 'bg-builty-gray-lighter border-2 border-gray-200'
                  } flex items-center justify-center flex-shrink-0`}>
                    <PlanIcon className={`w-7 h-7 ${plan.highlighted ? 'text-white' : 'text-builty-blue'}`} />
                  </div>
                  {plan.tagline && (
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                      plan.highlighted 
                        ? 'bg-builty-orange text-white border-builty-orange' 
                        : 'bg-white text-builty-blue border-builty-blue'
                    }`}>
                      {plan.tagline}
                    </span>
                  )}
                </div>

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-3xl font-extrabold text-builty-gray mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-builty-gray-light">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {displayPrice ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-extrabold text-builty-blue">
                          {displayPrice}€
                        </span>
                        <span className="text-builty-gray-light text-lg font-medium">
                          /mois
                        </span>
                      </div>
                      {isAnnual && plan.annualPrice && (
                        <p className="text-sm text-green-600 font-semibold mt-2">
                          Économisez {(plan.monthlyPrice * 12) - (plan.annualPrice * 12)}€/an
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-builty-gray">
                      Sur devis
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className={`text-builty-gray ${
                        feature.includes('Tout ') ? 'font-semibold' : ''
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => {
                    if (plan.name === 'ENTREPRISE') {
                      window.open('https://calendly.com/builtypro/30min', '_blank', 'noopener,noreferrer');
                    } else {
                      window.location.href = '/signup';
                    }
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 group ${
                    plan.highlighted
                      ? 'bg-builty-blue text-white hover:bg-builty-blue-light hover:shadow-lg'
                      : 'bg-white text-builty-blue border-2 border-builty-blue hover:bg-builty-blue hover:text-white'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {plan.name !== 'ENTREPRISE' && (
                  <p className="text-center text-xs text-builty-gray-light mt-4">
                    Essai 14j gratuit • Sans carte bancaire
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust section */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="bg-builty-gray-lighter rounded-2xl p-12 border border-gray-200">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-builty-gray mb-3">
                Pourquoi plus de 500 entreprises nous font confiance
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-builty-blue/10 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-builty-blue" />
                </div>
                <div className="text-xl font-bold text-builty-gray mb-2">Sécurité garantie</div>
                <p className="text-sm text-builty-gray-light">Hébergement France · RGPD · Sauvegarde quotidienne</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-builty-blue/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-builty-blue" />
                </div>
                <div className="text-xl font-bold text-builty-gray mb-2">Support réactif</div>
                <p className="text-sm text-builty-gray-light">Réponse en français sous 24h · Documentation complète</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-builty-blue/10 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-builty-blue" />
                </div>
                <div className="text-xl font-bold text-builty-gray mb-2">Résultats mesurables</div>
                <p className="text-sm text-builty-gray-light">+22% de marge · 15h gagnées/mois en moyenne</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ link */}
        <div className="text-center mt-12">
          <p className="text-builty-gray-light mb-4">
            Des questions sur nos offres ?
          </p>
          <a 
            href="#faq" 
            className="inline-flex items-center gap-2 text-builty-blue hover:text-builty-blue-light font-semibold transition-colors"
          >
            Consultez notre FAQ
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
