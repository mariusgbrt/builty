import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Invoice {
  id: string;
  company_id: string;
  client_id: string | null;
  quote_id: string | null;
  project_id: string | null;
  invoice_number: string;
  status: 'Brouillon' | 'Envoyee' | 'Partielle' | 'Payee' | 'En retard' | 'Annulee';
  amount_ht: number;
  amount_ttc: number;
  tva_amount: number;
  tva_rate: number;
  amount_paid: number;
  issue_date: string;
  due_date: string;
  payment_terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  paid_at: string | null;
  client?: {
    id: string;
    name: string;
  };
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price_ht: number;
  tva_rate: number;
  total_ht: number;
  display_order: number;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchInvoices = async () => {
    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(id, name)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [profile?.company_id]);

  const createInvoice = async (invoiceData: Partial<Invoice>, items: InvoiceItem[]) => {
    if (!profile?.company_id) throw new Error('Company ID not found');

    try {
      const invoiceNumber = await generateInvoiceNumber();

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          company_id: profile.company_id,
          client_id: invoiceData.client_id,
          quote_id: invoiceData.quote_id,
          project_id: invoiceData.project_id,
          invoice_number: invoiceNumber,
          status: invoiceData.status || 'Brouillon',
          amount_ht: invoiceData.amount_ht || 0,
          amount_ttc: invoiceData.amount_ttc || 0,
          tva_amount: invoiceData.tva_amount || 0,
          tva_rate: invoiceData.tva_rate || 20,
          amount_paid: invoiceData.amount_paid || 0,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          payment_terms: invoiceData.payment_terms,
          notes: invoiceData.notes,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price_ht: item.unit_price_ht,
          tva_rate: item.tva_rate,
          total_ht: item.total_ht,
          display_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      await fetchInvoices();
      return invoice;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>, items: InvoiceItem[]) => {
    try {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          client_id: invoiceData.client_id,
          quote_id: invoiceData.quote_id,
          project_id: invoiceData.project_id,
          status: invoiceData.status,
          amount_ht: invoiceData.amount_ht,
          amount_ttc: invoiceData.amount_ttc,
          tva_amount: invoiceData.tva_amount,
          tva_rate: invoiceData.tva_rate,
          amount_paid: invoiceData.amount_paid,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          payment_terms: invoiceData.payment_terms,
          notes: invoiceData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) throw deleteError;

      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price_ht: item.unit_price_ht,
          tva_rate: item.tva_rate,
          total_ht: item.total_ht,
          display_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      await fetchInvoices();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (itemsError) throw itemsError;

      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      await fetchInvoices();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    if (!profile?.company_id) throw new Error('Company ID not found');

    const { data: settings } = await supabase
      .from('company_settings')
      .select('invoice_number_pattern')
      .eq('company_id', profile.company_id)
      .maybeSingle();

    const pattern = settings?.invoice_number_pattern || 'FAC-{YYYY}-{0001}';
    const year = new Date().getFullYear();

    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('company_id', profile.company_id)
      .like('invoice_number', `%${year}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastInvoice?.invoice_number) {
      const match = lastInvoice.invoice_number.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return pattern
      .replace('{YYYY}', year.toString())
      .replace('{0001}', nextNumber.toString().padStart(4, '0'));
  };

  const getInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('display_order');

    if (error) throw error;
    return data || [];
  };

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceItems,
    refreshInvoices: fetchInvoices,
  };
}
