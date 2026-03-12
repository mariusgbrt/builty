import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface UsageStats {
  employees: number
  activeProjects: number
}

export function useUsageStats() {
  const [stats, setStats] = useState<UsageStats>({
    employees: 0,
    activeProjects: 0
  })
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.company_id) {
      fetchUsageStats()
    }
  }, [profile?.company_id])

  const fetchUsageStats = async () => {
    if (!profile?.company_id) return

    try {
      setLoading(true)

      const [employeesResult, projectsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', profile.company_id)
          .eq('status', 'Active'),

        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', profile.company_id)
          .eq('status', 'En cours')
      ])

      setStats({
        employees: employeesResult.count || 0,
        activeProjects: projectsResult.count || 0
      })
    } catch (err) {
      console.error('Error fetching usage stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    refetch: fetchUsageStats
  }
}
