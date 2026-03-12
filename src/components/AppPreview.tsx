import { Monitor, Smartphone, Tablet, Star } from 'lucide-react';

export function AppPreview() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-builty-gray-lighter via-white to-builty-gray-lighter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm mb-6">
            <Star className="w-4 h-4 fill-green-700" />
            Interface primée
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-builty-gray mb-6 tracking-tight">
            Une interface{' '}
            <span className="bg-gradient-to-r from-builty-blue to-builty-orange bg-clip-text text-transparent">
              intuitive et moderne
            </span>
          </h2>
          <p className="text-xl text-builty-gray-light max-w-3xl mx-auto leading-relaxed">
            Gérez tous vos projets, devis, factures et plannings depuis une seule plateforme. 
            Design pensé pour gagner du temps.
          </p>
        </div>

        {/* Screenshot showcase */}
        <div className="relative mb-16">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-3/4 h-3/4 bg-gradient-to-r from-builty-blue/10 to-builty-orange/10 blur-3xl rounded-full"></div>
          </div>

          {/* Main screenshot */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-builty-blue/20 to-builty-orange/20 rounded-3xl blur-2xl"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
              {/* Browser chrome */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="px-4 py-1 bg-white rounded-lg text-xs text-builty-gray-light font-medium">
                    app.builty.fr/dashboard
                  </div>
                </div>
              </div>
              
              {/* Screenshot */}
              <img
                src="/dashboard-preview.png"
                alt="Interface de l'application Builty - Tableau de bord"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Device compatibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-builty-blue/10 flex items-center justify-center group-hover:bg-builty-blue/20 transition-colors">
              <Monitor className="w-8 h-8 text-builty-blue" />
            </div>
            <h3 className="font-bold text-builty-gray mb-2">Bureau</h3>
            <p className="text-sm text-builty-gray-light">
              Interface complète sur Mac, Windows et Linux
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-builty-orange/10 flex items-center justify-center group-hover:bg-builty-orange/20 transition-colors">
              <Smartphone className="w-8 h-8 text-builty-orange" />
            </div>
            <h3 className="font-bold text-builty-gray mb-2">Mobile</h3>
            <p className="text-sm text-builty-gray-light">
              Application iOS et Android pour le terrain
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-builty-blue/10 flex items-center justify-center group-hover:bg-builty-blue/20 transition-colors">
              <Tablet className="w-8 h-8 text-builty-blue" />
            </div>
            <h3 className="font-bold text-builty-gray mb-2">Tablette</h3>
            <p className="text-sm text-builty-gray-light">
              Optimisé pour iPad et tablettes Android
            </p>
          </div>
        </div>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border-2 border-builty-blue/20 shadow-lg">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-builty-orange fill-builty-orange" />
              ))}
            </div>
            <div className="text-left">
              <div className="font-bold text-builty-gray">4.8/5</div>
              <div className="text-sm text-builty-gray-light">sur 120+ avis</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
