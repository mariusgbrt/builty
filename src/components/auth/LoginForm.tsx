import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Connexion réussie!' })
      onSuccess?.()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur de connexion'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-5 rounded-xl border-l-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-900 border-green-500' 
            : 'bg-red-50 text-red-900 border-red-500'
        }`}>
          <p className="font-semibold">{message.text}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-bold text-builty-gray mb-2">
          Adresse email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-builty-gray-light w-5 h-5" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none font-medium transition-all bg-white hover:border-gray-300"
            placeholder="votre@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-bold text-builty-gray mb-2">
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-builty-gray-light w-5 h-5" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none font-medium transition-all bg-white hover:border-gray-300"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-builty-gray-light hover:text-builty-blue transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-builty-blue text-white py-4 px-6 rounded-xl hover:bg-builty-blue-light hover:shadow-lg focus:ring-2 focus:ring-builty-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg"
      >
        {loading ? 'Connexion en cours...' : 'Se connecter'}
      </button>
    </form>
  )
}