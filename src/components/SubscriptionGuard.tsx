import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'
import { Loader2 } from 'lucide-react'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { subscription, loading } = useSubscription()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      const isActive = subscription?.subscription_status === 'active'

      if (!isActive) {
        navigate('/subscription')
      }
    }
  }, [loading, subscription, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Vérification de l'abonnement...</span>
        </div>
      </div>
    )
  }

  const isActive = subscription?.subscription_status === 'active'

  if (!isActive) {
    return null
  }

  return <>{children}</>
}
