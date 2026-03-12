import React from 'react'
import { Link } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'
import { BarChart3, Users, FileText, Calendar, Crown, ArrowRight } from 'lucide-react'

export function DashboardPage() {
  const { getActivePlan, isActive } = useSubscription()

  const activePlan = getActivePlan()
  const hasActiveSubscription = isActive()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-builty-gray mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue sur votre espace Builty</p>
      </div>

      {!hasActiveSubscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-blue-900">
                  Activez votre abonnement
                </h3>
                <p className="text-blue-700">
                  Choisissez un plan pour accéder à toutes les fonctionnalités
                </p>
              </div>
            </div>
            <Link
              to="/subscription"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Voir les plans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {hasActiveSubscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-green-900">
                Abonnement actif : {activePlan}
              </h3>
              <p className="text-green-700">
                Vous avez accès à toutes les fonctionnalités
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">€0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clients</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Devis</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projets</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Aucune activité récente
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/sales/quotes"
              className="w-full block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Créer un devis</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
            <Link
              to="/sales/clients"
              className="w-full block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Ajouter un client</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
            <Link
              to="/projects"
              className="w-full block p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Nouveau projet</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}