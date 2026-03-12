import { useState } from 'react';
import { ArrowRight, Play, CheckCircle2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Hero() {
  const [email, setEmail] = useState('');
  const [acceptRGPD, setAcceptRGPD] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && acceptRGPD && !isSubmitting) {
      setIsSubmitting(true);

      try {
        await supabase.from('email_leads').insert({
          email: email,
          source: 'hero',
          accepted_rgpd: acceptRGPD
        });
      } catch (error) {
        console.error('Error saving email lead:', error);
      }

      window.location.href = `/signup?email=${encodeURIComponent(email)}`;
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-blue-50/30 to-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-builty-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-builty-orange/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Badge social proof */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-builty-blue/20 shadow-sm">
            <Users className="w-4 h-4 text-builty-orange" />
            <span className="text-sm font-medium text-builty-gray">
              Rejoint par <span className="text-builty-blue font-semibold">500+ artisans</span> du BTP
            </span>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-12">
          {/* Headline principal */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-builty-gray mb-6 leading-[1.1] tracking-tight animate-slide-up">
            Gérez vos chantiers de A à Z avec{' '}
            <span className="relative inline-block pb-2">
              <span className="relative bg-gradient-to-r from-builty-blue to-builty-blue-light bg-clip-text text-transparent">
                confiance
              </span>
              <span className="absolute bottom-0 left-0 w-full h-2 bg-builty-blue rounded-full"></span>
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xl sm:text-2xl text-builty-gray-light mb-8 leading-relaxed max-w-3xl mx-auto">
            <span className="font-semibold text-builty-gray">Devis • Planning • Facturation</span>
            <br />
            Le SaaS tout-en-un pensé pour les artisans et TPE du bâtiment
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <form onSubmit={handleSubmit} className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Votre email professionnel"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-transparent outline-none text-base min-w-[300px] bg-white shadow-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-gradient-to-r from-builty-orange to-builty-orange-light text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center font-bold text-base uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap"
                >
                  {isSubmitting ? 'En cours...' : 'Essai gratuit 14j'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="flex items-start mt-3 text-left max-w-md">
                <input
                  type="checkbox"
                  id="rgpd"
                  checked={acceptRGPD}
                  onChange={(e) => setAcceptRGPD(e.target.checked)}
                  className="mt-1 mr-2"
                  required
                />
                <label htmlFor="rgpd" className="text-xs text-builty-gray-light">
                  J'accepte de recevoir des informations sur Builty et la politique de confidentialité
                </label>
              </div>
            </form>
          </div>

          <button
            onClick={() => window.open('https://www.loom.com/share/6e85e0b5ddae432a8f8cc9dfd0419e12', '_blank')}
            className="inline-flex items-center gap-2 text-builty-blue hover:text-builty-blue-light transition-colors font-semibold group"
          >
            <div className="w-10 h-10 rounded-full bg-builty-blue/10 flex items-center justify-center group-hover:bg-builty-blue/20 transition-colors">
              <Play className="w-5 h-5 fill-builty-blue" />
            </div>
            Voir la démo en vidéo
          </button>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-builty-gray-light">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Carte bancaire optionnelle</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Support en français</span>
            </div>
          </div>
        </div>

        {/* Screenshot avec effet glassmorphism */}
        <div className="relative max-w-6xl mx-auto mt-16 animate-fade-in">
          <div className="absolute -inset-4 bg-gradient-to-r from-builty-blue/20 to-builty-orange/20 rounded-3xl blur-2xl"></div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-100 to-transparent flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <img
              src="/dashboard-preview.png"
              alt="Interface Builty - Dashboard de gestion de chantiers"
              className="w-full h-auto object-contain"
              loading="eager"
            />
          </div>
          
          {/* Floating cards */}
          <div className="hidden lg:block absolute -right-8 top-20 bg-white rounded-xl shadow-xl p-4 border border-gray-100 animate-scale-in" style={{animationDelay: '0.3s'}}>
            <div className="text-sm font-semibold text-builty-gray mb-1">Nouveau devis créé</div>
            <div className="text-xs text-builty-gray-light">Rénovation appartement • 15 430€</div>
          </div>
          
          <div className="hidden lg:block absolute -left-8 bottom-20 bg-white rounded-xl shadow-xl p-4 border border-gray-100 animate-scale-in" style={{animationDelay: '0.5s'}}>
            <div className="text-sm font-semibold text-builty-gray mb-1">Facture payée</div>
            <div className="text-xs text-builty-gray-light">Chantier Villa Dupont • 8 500€</div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-builty-blue to-builty-blue-light bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                15h
              </div>
              <div className="text-builty-gray font-semibold mb-1">gagnées par mois</div>
              <div className="text-sm text-builty-gray-light">sur la gestion administrative</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-builty-orange to-builty-orange-light bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                +22%
              </div>
              <div className="text-builty-gray font-semibold mb-1">de marge nette</div>
              <div className="text-sm text-builty-gray-light">grâce au suivi des coûts</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-builty-blue to-builty-blue-light bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                7min
              </div>
              <div className="text-builty-gray font-semibold mb-1">pour créer un devis</div>
              <div className="text-sm text-builty-gray-light">avec templates intelligents</div>
            </div>
          </div>

          <p className="text-center text-sm text-builty-gray-light mt-8">
            Moyennes constatées auprès de 500+ professionnels du BTP utilisant Builty
          </p>
        </div>
      </div>
    </section>
  );
}
