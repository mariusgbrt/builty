import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src="/logobuilty.png" alt="Builty" className="w-10 h-10 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-builty-blue to-builty-blue-light bg-clip-text text-transparent">
              Builty
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a 
              href="#fonctionnalites" 
              className="text-builty-gray hover:text-builty-blue transition-colors font-medium"
            >
              Fonctionnalités
            </a>
            <a 
              href="#tarifs" 
              className="text-builty-gray hover:text-builty-blue transition-colors font-medium"
            >
              Tarifs
            </a>
            <a 
              href="#faq" 
              className="text-builty-gray hover:text-builty-blue transition-colors font-medium"
            >
              FAQ
            </a>
            <a
              href="https://calendly.com/builtypro/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="text-builty-gray hover:text-builty-blue transition-colors font-medium"
            >
              Démo
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            <a
              href="/login"
              className="px-5 py-2.5 text-builty-blue font-semibold hover:bg-builty-blue/5 rounded-lg transition-colors"
            >
              Connexion
            </a>
            <a
              href="/signup"
              className="px-6 py-2.5 bg-gradient-to-r from-builty-orange to-builty-orange-light text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-bold flex items-center gap-2 group"
            >
              Essai gratuit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-builty-gray" />
            ) : (
              <Menu className="h-6 w-6 text-builty-gray" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-6 space-y-4">
            <a
              href="#fonctionnalites"
              className="block px-4 py-3 text-builty-gray hover:bg-builty-blue/5 hover:text-builty-blue transition-colors rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fonctionnalités
            </a>
            <a
              href="#tarifs"
              className="block px-4 py-3 text-builty-gray hover:bg-builty-blue/5 hover:text-builty-blue transition-colors rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tarifs
            </a>
            <a
              href="#faq"
              className="block px-4 py-3 text-builty-gray hover:bg-builty-blue/5 hover:text-builty-blue transition-colors rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <a
              href="https://calendly.com/builtypro/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-builty-gray hover:bg-builty-blue/5 hover:text-builty-blue transition-colors rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demander une démo
            </a>
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <a
                href="/login"
                className="block w-full px-4 py-3 text-center text-builty-blue border-2 border-builty-blue rounded-lg hover:bg-builty-blue/5 transition-colors font-semibold"
              >
                Connexion
              </a>
              <a
                href="/signup"
                className="block w-full px-4 py-3 text-center bg-gradient-to-r from-builty-orange to-builty-orange-light text-white rounded-lg hover:shadow-lg transition-all font-bold"
              >
                Essai gratuit 14j
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
