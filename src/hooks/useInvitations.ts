import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface Invitation {
  id: string
  company_id: string
  email: string
  role: string
  token: string
  invited_by: string
  status: 'Pending' | 'Accepted' | 'Expired' | 'Cancelled'
  expires_at: string
  created_at: string
  accepted_at?: string
  invited_by_profile?: {
    full_name: string
    email: string
  }
}

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.company_id) {
      fetchInvitations()
    }
  }, [profile?.company_id])

  const fetchInvitations = async () => {
    if (!profile?.company_id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          invited_by_profile:user_profiles!invitations_invited_by_fkey(
            full_name,
            email
          )
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (err) {
      console.error('Error fetching invitations:', err)
    } finally {
      setLoading(false)
    }
  }

  const createInvitation = async (data: { email: string; role: string }) => {
    if (!profile?.company_id || !profile?.id) {
      throw new Error('User not authenticated or missing company')
    }

    try {
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          company_id: profile.company_id,
          email: data.email.toLowerCase(),
          role: data.role,
          invited_by: profile.id
        })
        .select()
        .single()

      if (error) throw error

      await fetchInvitations()
      return invitation
    } catch (err: any) {
      if (err.code === '23505') {
        throw new Error('Une invitation en attente existe déjà pour cet email')
      }
      throw err
    }
  }

  const cancelInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'Cancelled' })
        .eq('id', id)

      if (error) throw error
      await fetchInvitations()
    } catch (err) {
      console.error('Error cancelling invitation:', err)
      throw err
    }
  }

  const getInvitationByToken = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          company:companies(
            id,
            name,
            logo_url
          )
        `)
        .eq('token', token)
        .eq('status', 'Pending')
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching invitation by token:', err)
      return null
    }
  }

  const acceptInvitation = async (token: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({
          status: 'Accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('token', token)

      if (error) throw error
    } catch (err) {
      console.error('Error accepting invitation:', err)
      throw err
    }
  }

  return {
    invitations,
    loading,
    createInvitation,
    cancelInvitation,
    getInvitationByToken,
    acceptInvitation,
    refetch: fetchInvitations
  }
}
