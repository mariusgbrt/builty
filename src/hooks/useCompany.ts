import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Company {
  id: string;
  name: string;
  siret: string | null;
  vat_number: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (!profile?.company_id) {
        throw new Error('No company found for user');
      }

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setCompany(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const updateCompany = async (updates: Partial<Company>) => {
    if (!company) return;

    try {
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id);

      if (updateError) throw updateError;

      await fetchCompany();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update company');
    }
  };

  const uploadLogo = async (file: File) => {
    if (!company) throw new Error('No company found');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${company.id}/logo.${fileExt}`;

      const { data: existingFiles } = await supabase.storage
        .from('company-logos')
        .list(company.id);

      if (existingFiles && existingFiles.length > 0) {
        for (const existingFile of existingFiles) {
          await supabase.storage
            .from('company-logos')
            .remove([`${company.id}/${existingFile.name}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      await updateCompany({ logo_url: urlData.publicUrl });

      return urlData.publicUrl;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to upload logo');
    }
  };

  return {
    company,
    loading,
    error,
    updateCompany,
    uploadLogo,
    refetch: fetchCompany,
  };
}
