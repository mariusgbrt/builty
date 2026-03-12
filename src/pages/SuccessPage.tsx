import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'

export function SuccessPage() {
  const { refetch, isActive } = useSubscription()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000))

      await refetch()

      await new Promise(resolve => setTimeout(resolve, 1000))

      if (isActive()) {
        navigate('/')
      } else {
        setChecking(false)
      }
    }

    checkSubscription()
  }, [refetch, isActive, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            {checking ? (
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
          </div>

          <h1 className="text-4xl font-extrabold text-builty-gray mb-4">
            {checking ? 'Activation en cours...' : 'Paiement réussi !'}
          </h1>

          <p className="text-gray-600 mb-8">
            {checking
              ? 'Veuillez patienter pendant que nous activons votre abonnement...'
              : 'Votre abonnement a été activé avec succès. Redirection vers le tableau de bord...'
            }
          </p>
        </div>
      </div>
    </div>
  )
}