import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

interface SignupFormProps {
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte')
      }

      // Create company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
        })
        .select()
        .single()

      if (companyError) {
        throw companyError
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          company_id: companyData.id,
          email: authData.user.email!,
          full_name: fullName,
          role: 'Admin',
          status: 'Active',
        })

      if (profileError) {
        throw profileError
      }

      // Mark email lead as converted if exists
      try {
        await supabase
          .from('email_leads')
          .update({ converted: true })
          .eq('email', email)
      } catch (error) {
        console.error('Error updating email lead:', error)
      }

      setMessage({ type: 'success', text: 'Compte créé avec succès!' })
      onSuccess?.()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de la création du compte'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div className={`p-5 rounded-xl border-l-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-900 border-green-500' 
            : 'bg-red-50 text-red-900 border-red-500'
        }`}>
          <p className="font-semibold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-bold text-builty-gray mb-2">
            Nom complet
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-builty-gray-light w-5 h-5" />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none font-medium transition-all bg-white hover:border-gray-300"
              placeholder="Jean Dupont"
            />
          </div>
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-bold text-builty-gray mb-2">
            Entreprise
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-builty-gray-light w-5 h-5" />
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none font-medium transition-all bg-white hover:border-gray-300"
              placeholder="Mon Entreprise"
            />
          </div>
        </div>
      </div>

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
          <span className="text-xs font-normal text-builty-gray-light ml-2">(minimum 6 caractères)</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-builty-gray-light w-5 h-5" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
        className="w-full bg-gradient-to-r from-builty-orange to-builty-orange/80 text-white py-4 px-6 rounded-xl hover:shadow-lg focus:ring-2 focus:ring-builty-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg mt-6"
      >
        {loading ? 'Création en cours...' : 'Créer mon compte gratuit'}
      </button>
    </form>
  )
}