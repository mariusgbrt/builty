import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Project {
  id: string;
  company_id: string;
  client_id: string | null;
  name: string;
  status: 'En attente' | 'En cours' | 'Termine' | 'Annule';
  amount_ht: number;
  expected_margin_rate: number | null;
  actual_margin_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  address: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithClient extends Project {
  client_name?: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchProjects = async () => {
    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithClients = (data || []).map(project => ({
        ...project,
        client_name: project.clients?.name || 'Client inconnu'
      }));

      setProjects(projectsWithClients);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [profile?.company_id]);

  const createProject = async (projectData: Partial<Project>) => {
    if (!profile?.company_id) throw new Error('Company ID not found');

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          company_id: profile.company_id,
          client_id: projectData.client_id,
          name: projectData.name,
          status: projectData.status || 'En attente',
          amount_ht: projectData.amount_ht,
          expected_margin_rate: projectData.expected_margin_rate,
          actual_margin_rate: projectData.actual_margin_rate,
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          address: projectData.address,
          description: projectData.description,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchProjects();
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          client_id: projectData.client_id,
          name: projectData.name,
          status: projectData.status,
          amount_ht: projectData.amount_ht,
          expected_margin_rate: projectData.expected_margin_rate,
          actual_margin_rate: projectData.actual_margin_rate,
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          address: projectData.address,
          description: projectData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchProjects();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProjects();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
  };
}
