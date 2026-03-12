import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { supabase } from '../../lib/supabase'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Operator')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      setSubmitting(true)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Vous devez être connecté')
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-team-member`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            role,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création du compte')
      }

      alert('Compte créé avec succès ! Le membre peut maintenant se connecter.')
      handleClose()
      onSuccess()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création du compte')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setRole('Operator')
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Créer un compte membre"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom complet"
          type="text"
          placeholder="Jean Dupont"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Adresse email"
          type="email"
          placeholder="membre@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="Minimum 6 caractères"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Select
          label="Rôle"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Operator">Operator</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </Select>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Le membre pourra se connecter immédiatement avec l'email et le mot de passe que vous avez définis.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Création...' : 'Créer le compte'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
