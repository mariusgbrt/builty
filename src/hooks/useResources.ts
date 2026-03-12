import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Resource {
  id: string;
  company_id: string;
  type: 'Ouvrier' | 'Independant' | 'Sous-traitant' | 'Vehicule' | 'Outil';
  name: string;
  email: string | null;
  phone: string | null;
  status: 'Actif' | 'Inactif';
  created_at: string;
}

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchResources = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [profile?.company_id]);

  const createResource = async (resourceData: Partial<Resource>) => {
    if (!profile?.company_id) throw new Error('Company ID not found');

    try {
      const { data, error } = await supabase
        .from('resources')
        .insert({
          company_id: profile.company_id,
          type: resourceData.type,
          name: resourceData.name,
          email: resourceData.email,
          phone: resourceData.phone,
          status: resourceData.status || 'Actif',
        })
        .select()
        .single();

      if (error) throw error;
      await fetchResources();
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateResource = async (id: string, resourceData: Partial<Resource>) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          type: resourceData.type,
          name: resourceData.name,
          email: resourceData.email,
          phone: resourceData.phone,
          status: resourceData.status,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchResources();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchResources();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    resources,
    loading,
    error,
    createResource,
    updateResource,
    deleteResource,
    refreshResources: fetchResources,
  };
}
