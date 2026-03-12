import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-builty-gray text-gray-300 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logobuilty.png" alt="Builty" className="w-10 h-10" />
              <span className="text-3xl font-extrabold text-white">Builty</span>
            </div>
            <p className="text-gray-400 max-w-md mb-6 leading-relaxed">
              La plateforme tout-en-un pour piloter vos chantiers, optimiser vos marges et satisfaire vos clients. Conçue par des professionnels du BTP, pour les professionnels du BTP.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:builtypro@gmail.com"
                className="flex items-center gap-3 text-gray-400 hover:text-builty-orange transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-builty-orange/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span>builtypro@gmail.com</span>
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>Fait en France 🇫🇷</span>
              </div>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Produit</h4>
            <ul className="space-y-3">
              <li>
                <a href="#fonctionnalites" className="text-gray-400 hover:text-white transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#tarifs" className="text-gray-400 hover:text-white transition-colors">
                  Tarifs
                </a>
              </li>
              <li>
                <a
                  href="https://calendly.com/builtypro/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Demander une démo
                </a>
              </li>
              <li>
                <a href="/signup" className="text-gray-400 hover:text-white transition-colors">
                  Essai gratuit
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://calendly.com/builtypro/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Tutoriels vidéo
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Builty. Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <a href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
                Mentions légales
              </a>
              <a href="/confidentialite" className="text-gray-400 hover:text-white transition-colors">
                Confidentialité
              </a>
              <a href="/cgv" className="text-gray-400 hover:text-white transition-colors">
                CGV
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
