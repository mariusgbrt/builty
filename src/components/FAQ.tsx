import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Puis-je résilier mon abonnement à tout moment ?',
    answer: 'Oui, absolument. Builty fonctionne sans engagement. Vous pouvez résilier votre abonnement à tout moment depuis votre espace client en 2 clics. La résiliation prend effet à la fin de votre période de facturation en cours, et vous gardez accès à vos données.'
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'La sécurité de vos données est notre priorité absolue. Nous utilisons un chiffrement de niveau bancaire (SSL/TLS), hébergeons vos données en France sur des serveurs certifiés ISO 27001, et effectuons des sauvegardes quotidiennes. Nous sommes 100% conformes au RGPD français.'
  },
  {
    question: 'Builty s\'intègre-t-il avec mon logiciel de comptabilité ?',
    answer: 'Oui, Builty génère des exports au format FEC (Fichier des Écritures Comptables) compatible avec tous les logiciels de comptabilité français : Sage, Cegid, EBP, QuickBooks, etc. Pour les clients PRO et ENTREPRISE, nous proposons également des connecteurs API directs.'
  },
  {
    question: 'Quel type de support proposez-vous ?',
    answer: 'Tous nos clients bénéficient d\'un support par email en français avec réponse sous 24h ouvrées. Les clients PRO ont un support prioritaire (4h). Les clients ENTREPRISE ont un account manager dédié + support téléphonique 7j/7. Nous proposons aussi une base de connaissances complète et des tutoriels vidéo.'
  },
  {
    question: 'Est-ce que mes collaborateurs ont besoin d\'une formation ?',
    answer: 'Builty est conçu pour être intuitif et simple d\'utilisation. La plupart de nos clients sont opérationnels en moins d\'une heure. Nous proposons des tutoriels vidéo et une formation d\'1h pour tous les plans. Les clients ENTREPRISE bénéficient d\'une formation complète sur-mesure pour toute l\'équipe.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-builty-blue/10 text-builty-blue font-semibold text-sm mb-6">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-builty-gray mb-6 tracking-tight">
            Questions fréquentes
          </h2>
          <p className="text-xl text-builty-gray-light">
            Vous avez une question ? On a sûrement la réponse.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-200 ${
                openIndex === index
                  ? 'border-builty-blue shadow-lg'
                  : 'border-gray-200 hover:border-builty-blue/30 shadow-sm'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-builty-blue/5 transition-colors"
              >
                <span className="font-bold text-builty-gray pr-8 text-lg">
                  {faq.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    openIndex === index
                      ? 'bg-builty-blue text-white rotate-180'
                      : 'bg-builty-gray-lighter text-builty-gray-light'
                  }`}
                >
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 animate-fade-in">
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-builty-gray-light leading-relaxed text-lg">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA footer */}
        <div className="mt-12 text-center">
          <p className="text-builty-gray-light mb-4">
            Vous ne trouvez pas la réponse à votre question ?
          </p>
          <a
            href="https://calendly.com/builtypro/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-builty-gray-lighter text-builty-gray rounded-xl hover:bg-builty-blue/10 hover:text-builty-blue transition-colors font-semibold"
          >
            <HelpCircle className="w-5 h-5" />
            Contactez notre équipe
          </a>
        </div>
      </div>
    </section>
  );
}
