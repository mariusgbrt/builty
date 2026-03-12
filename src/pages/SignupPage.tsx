import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SignupForm } from '../components/auth/SignupForm'
import { ArrowLeft, Check, Sparkles, Rocket } from 'lucide-react'

export function SignupPage() {
  const navigate = useNavigate()

  const handleSignupSuccess = () => {
    navigate('/subscription')
  }

  return (
    <div className="min-h-screen bg-builty-gray-lighter flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-builty-orange via-builty-orange/90 to-builty-blue p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        {/* Content */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Retour à l'accueil</span>
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <img src="/logobuilty.png" alt="Builty" className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-extrabold">Builty</h1>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-bold">14 jours gratuits</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">
              Transformez votre gestion dès aujourd'hui
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Tout ce dont vous avez besoin pour gérer vos chantiers comme un pro
            </p>
          </div>

          {/* What's included */}
          <div className="space-y-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5" />
              <p className="font-bold text-lg">Démarrage immédiat</p>
            </div>
            {[
              'Créez votre compte en 2 minutes',
              'Accès à toutes les fonctionnalités premium',
              'Aucune carte bancaire requise',
              'Support et formation inclus',
              'Messagerie d\'équipe intégrée',
              'Photos de chantier illimitées',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="flex items-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-3xl font-extrabold mb-1">500+</p>
              <p className="text-white/60">Artisans</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold mb-1">4.9/5</p>
              <p className="text-white/60">Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold mb-1">10k+</p>
              <p className="text-white/60">Chantiers gérés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-builty-blue flex items-center justify-center">
                <img src="/logobuilty.png" alt="Builty" className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-builty-blue to-builty-blue-light bg-clip-text text-transparent">
                Builty
              </h1>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-builty-gray-light hover:text-builty-blue transition-colors text-sm font-semibold">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 lg:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-builty-orange/10 text-builty-orange rounded-lg mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-bold">14 jours gratuits</span>
              </div>
              <h2 className="text-3xl font-extrabold text-builty-gray mb-2">Créer un compte</h2>
              <p className="text-builty-gray-light text-lg">Commencez votre essai gratuit</p>
            </div>

            <SignupForm onSuccess={handleSignupSuccess} />

            <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
              <p className="text-builty-gray-light">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-builty-blue hover:text-builty-blue-light font-bold transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-6 text-sm text-builty-gray-light">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Annulable à tout moment</span>
              </div>
            </div>
            <p className="text-xs text-builty-gray-light">
              En créant un compte, vous acceptez nos{' '}
              <Link to="/cgv" className="text-builty-blue hover:underline">CGV</Link>
              {' '}et notre{' '}
              <Link to="/confidentialite" className="text-builty-blue hover:underline">politique de confidentialité</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}