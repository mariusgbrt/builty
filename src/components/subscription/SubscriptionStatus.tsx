import React from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { Crown, AlertCircle, Loader2 } from 'lucide-react'

export function SubscriptionStatus() {
  const { subscription, loading, error, getActivePlan, isActive } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Chargement...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span>Erreur de chargement</span>
      </div>
    )
  }

  const activePlan = getActivePlan()

  if (!activePlan || !isActive()) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <span>Aucun abonnement actif</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Crown className="w-4 h-4 text-yellow-500" />
      <span className="text-gray-900 font-medium">{activePlan}</span>
    </div>
  )
}