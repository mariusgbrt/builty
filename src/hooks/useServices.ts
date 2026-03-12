import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Service {
  id: string;
  company_id: string;
  name: string;
  description: string;
  unit_price_ht: number;
  unit: string;
  default_tva_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  unit_price_ht: number;
  unit: string;
  default_tva_rate?: number;
  is_active?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  unit_price_ht?: number;
  unit?: string;
  default_tva_rate?: number;
  is_active?: boolean;
}

export function useServices() {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [profile?.company_id]);

  const createService = async (serviceData: CreateServiceData): Promise<Service | null> => {
    if (!profile?.company_id) {
      setError('No company found');
      return null;
    }

    try {
      const { data, error: createError } = await supabase
        .from('services')
        .insert({
          company_id: profile.company_id,
          ...serviceData,
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchServices();
      return data;
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  const updateService = async (id: string, serviceData: UpdateServiceData): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('services')
        .update({
          ...serviceData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchServices();
      return true;
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchServices();
      return true;
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  const toggleServiceStatus = async (id: string, is_active: boolean): Promise<boolean> => {
    return updateService(id, { is_active });
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    refetch: fetchServices,
  };
}
