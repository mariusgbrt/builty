import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { ArrowLeft, Shield, Zap, Users } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-builty-gray-lighter flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-builty-blue to-builty-blue-light p-12 flex-col justify-between text-white relative overflow-hidden">
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

          <h2 className="text-3xl font-extrabold mb-4 leading-tight">
            Gérez vos chantiers avec confiance
          </h2>
          <p className="text-xl text-white/90 mb-12">
            La solution complète pour les artisans et TPE du bâtiment
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Démarrage instantané</h3>
                <p className="text-white/80">Créez votre premier devis en moins de 5 minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Données sécurisées</h3>
                <p className="text-white/80">Vos informations sont protégées et chiffrées</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Équipe collaborative</h3>
                <p className="text-white/80">Invitez vos collaborateurs et travaillez ensemble</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            Rejoignez 500+ artisans qui font confiance à Builty
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-builty-blue flex items-center justify-center">
                <img src="/logobuilty.png" alt="Builty" className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-builty-blue to-builty-blue-light bg-clip-text text-transparent">
                Builty
              </h1>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-builty-gray-light hover:text-builty-blue transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-builty-gray mb-2">Connexion</h2>
              <p className="text-builty-gray-light">Accédez à votre espace de gestion</p>
            </div>

            <LoginForm onSuccess={handleLoginSuccess} />

            <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
              <p className="text-builty-gray-light">
                Pas encore de compte ?{' '}
                <Link to="/signup" className="text-builty-blue hover:text-builty-blue-light font-bold transition-colors">
                  Créer un compte gratuitement
                </Link>
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-builty-gray-light">
              ✓ 14 jours d'essai gratuit • Sans engagement • Support français
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}