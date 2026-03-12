import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CompanySettings {
  id: string;
  company_id: string;
  invoice_number_pattern: string;
  quote_number_pattern: string;
  default_tva_rate: number;
  default_payment_terms: string;
  created_at: string;
  updated_at: string;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchSettings = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', profile.company_id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        const { data: newSettings, error: createError } = await supabase
          .from('company_settings')
          .insert({
            company_id: profile.company_id,
            invoice_number_pattern: 'FAC-{YYYY}-{0001}',
            quote_number_pattern: 'DEV-{YYYY}-{0001}',
            default_tva_rate: 20,
            default_payment_terms: '30 jours',
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [profile?.company_id]);

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    if (!settings) return;

    try {
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      await fetchSettings();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update settings');
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
