import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Client {
  id: string;
  company_id: string;
  type: 'Particulier' | 'Entreprise';
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  siret: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchClients = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [profile?.company_id]);

  const createClient = async (clientData: Partial<Client>) => {
    if (!profile?.company_id) throw new Error('Company ID not found');

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          company_id: profile.company_id,
          type: clientData.type || 'Particulier',
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          postal_code: clientData.postal_code,
          city: clientData.city,
          siret: clientData.siret,
          notes: clientData.notes,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchClients();
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          type: clientData.type,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          postal_code: clientData.postal_code,
          city: clientData.city,
          siret: clientData.siret,
          notes: clientData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchClients();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchClients();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const getClientStats = async (clientId: string) => {
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', clientId);

    const { data: quotes } = await supabase
      .from('quotes')
      .select('id')
      .eq('client_id', clientId);

    const { data: invoices } = await supabase
      .from('invoices')
      .select('id')
      .eq('client_id', clientId);

    return {
      projectsCount: projects?.length || 0,
      quotesCount: quotes?.length || 0,
      invoicesCount: invoices?.length || 0,
    };
  };

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    getClientStats,
    refreshClients: fetchClients,
  };
}
