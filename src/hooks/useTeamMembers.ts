import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: string
  status: string
  created_at: string
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.company_id) {
      fetchMembers()
    }
  }, [profile?.company_id])

  const fetchMembers = async () => {
    if (!profile?.company_id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      console.error('Error fetching team members:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    members,
    loading,
    refetch: fetchMembers
  }
}
