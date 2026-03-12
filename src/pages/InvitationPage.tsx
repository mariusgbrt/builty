import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Building2, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useInvitations } from '../hooks/useInvitations'

export function InvitationPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { getInvitationByToken, acceptInvitation } = useInvitations()

  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (token) {
      loadInvitation()
    }
  }, [token])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      const data = await getInvitationByToken(token!)
      if (!data) {
        setError('Invitation invalide ou expirée')
      } else {
        setInvitation(data)
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      setSubmitting(true)

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            company_id: invitation.company_id,
            email: invitation.email,
            full_name: formData.fullName,
            role: invitation.role,
            status: 'Active'
          })

        if (profileError) throw profileError

        await acceptInvitation(token!)

        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('Error accepting invitation:', err)
      alert(err.message || 'Erreur lors de la création du compte')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Invitation invalide</h2>
            <p className="mt-2 text-gray-600">{error || 'Cette invitation n\'existe pas ou a expiré.'}</p>
            <Button
              onClick={() => navigate('/login')}
              className="mt-6"
            >
              Retour à la connexion
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            {invitation.company?.logo_url ? (
              <img
                src={invitation.company.logo_url}
                alt={invitation.company.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Rejoindre {invitation.company?.name}
          </h2>
          <p className="mt-2 text-gray-600">
            Vous êtes invité à rejoindre l'organisation en tant que <span className="font-semibold">{invitation.role}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            placeholder="Jean Dupont"
            required
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          />

          <Input
            label="Email"
            type="email"
            value={invitation.email}
            disabled
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="Min. 6 caractères"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="Retapez votre mot de passe"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          />

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Création du compte...' : 'Créer mon compte'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Vous avez déjà un compte ?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}
