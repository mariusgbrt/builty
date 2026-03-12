import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { SubscriptionStatus } from '../subscription/SubscriptionStatus'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img src="/logobuilty.png" alt="Builty" className="w-8 h-8" />
            <h1 className="text-xl font-bold text-gray-900">Builty</h1>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
              <SubscriptionStatus />
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}