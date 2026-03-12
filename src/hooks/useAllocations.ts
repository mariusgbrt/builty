import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Allocation {
  id: string;
  company_id: string;
  project_id: string;
  resource_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'Planifie' | 'En cours' | 'Termine' | 'Annule';
  notes: string | null;
  created_at: string;
}

export interface AllocationWithDetails extends Allocation {
  project_name?: string;
  resource_name?: string;
  resource_type?: string;
}

export function useAllocations() {
  const [allocations, setAllocations] = useState<AllocationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchAllocations = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('allocations')
        .select(`
          *,
          projects (
            name
          ),
          resources (
            name,
            type
          )
        `)
        .eq('company_id', profile.company_id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      const allocationsWithDetails = (data || []).map(allocation => ({
        ...allocation,
        project_name: allocation.projects?.name || 'Projet inconnu',
        resource_name: allocation.resources?.name || 'Ressource inconnue',
        resource_type: allocation.resources?.type || '',
      }));

      setAllocations(allocationsWithDetails);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [profile?.company_id]);

  const createAllocation = async (allocationData: Partial<Allocation>) => {
    if (!profile?.company_id) throw new Error('Company ID not found');

    try {
      const { data, error } = await supabase
        .from('allocations')
        .insert({
          company_id: profile.company_id,
          project_id: allocationData.project_id,
          resource_id: allocationData.resource_id,
          date: allocationData.date,
          start_time: allocationData.start_time,
          end_time: allocationData.end_time,
          status: allocationData.status || 'Planifie',
          notes: allocationData.notes,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAllocations();
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateAllocation = async (id: string, allocationData: Partial<Allocation>) => {
    try {
      const { error } = await supabase
        .from('allocations')
        .update({
          project_id: allocationData.project_id,
          resource_id: allocationData.resource_id,
          date: allocationData.date,
          start_time: allocationData.start_time,
          end_time: allocationData.end_time,
          status: allocationData.status,
          notes: allocationData.notes,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchAllocations();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteAllocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('allocations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAllocations();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    allocations,
    loading,
    error,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    refreshAllocations: fetchAllocations,
  };
}
