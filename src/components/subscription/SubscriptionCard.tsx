import React, { useState } from 'react'
import { StripeProduct } from '../../stripe-config'
import { Check, Loader2, Users, FolderKanban } from 'lucide-react'

interface SubscriptionCardProps {
  product: StripeProduct
  isPopular?: boolean
  onSubscribe: (priceId: string) => Promise<void>
}

export function SubscriptionCard({ product, isPopular, onSubscribe }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      await onSubscribe(product.priceId)
    } finally {
      setLoading(false)
    }
  }

  const isPro = product.name === 'Builty PRO'

  const features = [
    'Accès complet à la plateforme',
    'Support client prioritaire',
    'Mises à jour automatiques',
    ...(isPro ? ['Fonctionnalités avancées', 'Rapports détaillés'] : [])
  ]

  return (
    <div className={`relative bg-white rounded-2xl transition-all duration-300 ${
      isPopular
        ? 'shadow-2xl border-2 border-builty-blue transform scale-105 hover:scale-[1.07]'
        : 'shadow-lg border border-gray-200 hover:shadow-xl hover:scale-[1.02]'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-builty-blue text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            Populaire
          </span>
        </div>
      )}

      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-6">{product.description}</p>

          <div className="mb-8">
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-bold text-builty-blue">{product.price}€</span>
              <span className="text-gray-600 text-lg ml-2">/mois</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-builty-blue" />
                <span className="text-2xl font-bold text-gray-900">{product.limits.employees}</span>
              </div>
              <p className="text-xs text-gray-600">employés max</p>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FolderKanban className="w-4 h-4 text-builty-blue" />
                <span className="text-2xl font-bold text-gray-900">{product.limits.activeProjects}</span>
              </div>
              <p className="text-xs text-gray-600">projets actifs</p>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
              isPopular
                ? 'bg-builty-blue text-white hover:bg-blue-800'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              'S\'abonner'
            )}
          </button>
        </div>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="ml-3 text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}