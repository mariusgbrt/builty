import { useState } from 'react';
import { ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function FinalCTA() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !isSubmitting) {
      setIsSubmitting(true);

      try {
        await supabase.from('email_leads').insert({
          email: email,
          source: 'final_cta',
          accepted_rgpd: true
        });
      } catch (error) {
        console.error('Error saving email lead:', error);
      }

      window.location.href = `/signup?email=${encodeURIComponent(email)}`;
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-builty-gray">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-12 md:p-16 shadow-2xl border border-gray-200">
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl font-extrabold text-builty-gray mb-6 leading-tight">
              Prêt à passer à l'action ?
            </h2>
            
            <p className="text-xl text-builty-gray-light mb-10 leading-relaxed">
              Testez Builty gratuitement pendant 14 jours. Aucune carte bancaire requise.
            </p>

            {/* CTA Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="votre@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none text-lg"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-builty-blue text-white rounded-xl hover:bg-builty-blue-light hover:shadow-lg transition-all duration-200 font-bold text-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'En cours...' : 'Démarrer gratuitement'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-builty-gray text-sm">Essai gratuit</div>
                  <div className="text-xs text-builty-gray-light">14 jours complets</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-builty-blue" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-builty-gray text-sm">Sans engagement</div>
                  <div className="text-xs text-builty-gray-light">Résiliez quand vous voulez</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-builty-orange" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-builty-gray text-sm">Configuration rapide</div>
                  <div className="text-xs text-builty-gray-light">Opérationnel en 5 minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-400 mb-4">
            Vous préférez une démo personnalisée ?
          </p>
          <a
            href="https://calendly.com/builtypro/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white hover:text-builty-orange transition-colors font-semibold"
          >
            Réserver un créneau avec notre équipe
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
