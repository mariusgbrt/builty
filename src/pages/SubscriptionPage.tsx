import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SubscriptionCard } from '../components/subscription/SubscriptionCard'
import { stripeProducts } from '../stripe-config'
import { supabase } from '../lib/supabase'
import { Shield, Zap, HeadphonesIcon } from 'lucide-react'

export function SubscriptionPage() {
  const navigate = useNavigate()

  const handleSubscribe = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        navigate('/login')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/subscription`,
          mode: 'subscription',
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Choisissez votre abonnement
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Sélectionnez le plan qui correspond le mieux à vos besoins
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Paiement sécurisé</p>
                <p className="text-sm text-gray-600">Via Stripe</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-builty-blue" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Sans engagement</p>
                <p className="text-sm text-gray-600">Résiliable à tout moment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <HeadphonesIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Support dédié</p>
                <p className="text-sm text-gray-600">7j/7</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {stripeProducts.map((product, index) => (
            <SubscriptionCard
              key={product.id}
              product={product}
              isPopular={index === 0}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Des questions sur nos offres ?
          </p>
          <a
            href="mailto:builtypro@gmail.com"
            className="inline-flex items-center text-builty-blue font-semibold hover:underline"
          >
            builtypro@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}