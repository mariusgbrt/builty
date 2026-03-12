import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Quote {
  id: string;
  company_id: string;
  client_id: string | null;
  quote_number: string;
  status: 'Brouillon' | 'Envoye' | 'Accepte' | 'Rejete' | 'Converti';
  amount_ht: number;
  amount_ttc: number;
  tva_amount: number;
  tva_rate: number;
  notes: string | null;
  ai_confidence_score: number | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  accepted_at: string | null;
  client?: {
    id: string;
    name: string;
  };
}

export interface QuoteItem {
  id?: string;
  quote_id?: string;
  description: string;
  quantity: number;
  unit_price_ht: number;
  tva_rate: number;
  total_ht: number;
  display_order: number;
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchQuotes = async () => {
    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(id, name)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [profile?.company_id]);

  const createQuote = async (quoteData: Partial<Quote>, items: QuoteItem[]) => {
    if (!profile?.company_id) throw new Error('Company ID not found');

    try {
      const quoteNumber = await generateQuoteNumber();

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          company_id: profile.company_id,
          client_id: quoteData.client_id,
          quote_number: quoteNumber,
          status: quoteData.status || 'Brouillon',
          amount_ht: quoteData.amount_ht || 0,
          amount_ttc: quoteData.amount_ttc || 0,
          tva_amount: quoteData.tva_amount || 0,
          tva_rate: quoteData.tva_rate || 20,
          notes: quoteData.notes,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          quote_id: quote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price_ht: item.unit_price_ht,
          tva_rate: item.tva_rate,
          total_ht: item.total_ht,
          display_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      await fetchQuotes();
      return quote;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateQuote = async (id: string, quoteData: Partial<Quote>, items: QuoteItem[]) => {
    try {
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          client_id: quoteData.client_id,
          status: quoteData.status,
          amount_ht: quoteData.amount_ht,
          amount_ttc: quoteData.amount_ttc,
          tva_amount: quoteData.tva_amount,
          tva_rate: quoteData.tva_rate,
          notes: quoteData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (quoteError) throw quoteError;

      const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', id);

      if (deleteError) throw deleteError;

      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          quote_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price_ht: item.unit_price_ht,
          tva_rate: item.tva_rate,
          total_ht: item.total_ht,
          display_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      await fetchQuotes();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error: itemsError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', id);

      if (itemsError) throw itemsError;

      const { error: quoteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (quoteError) throw quoteError;

      await fetchQuotes();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const generateQuoteNumber = async (): Promise<string> => {
    if (!profile?.company_id) throw new Error('Company ID not found');

    const { data: settings } = await supabase
      .from('company_settings')
      .select('quote_number_pattern')
      .eq('company_id', profile.company_id)
      .maybeSingle();

    const pattern = settings?.quote_number_pattern || 'DEV-{YYYY}-{0001}';
    const year = new Date().getFullYear();

    const { data: lastQuote } = await supabase
      .from('quotes')
      .select('quote_number')
      .eq('company_id', profile.company_id)
      .like('quote_number', `%${year}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastQuote?.quote_number) {
      const match = lastQuote.quote_number.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return pattern
      .replace('{YYYY}', year.toString())
      .replace('{0001}', nextNumber.toString().padStart(4, '0'));
  };

  const getQuoteItems = async (quoteId: string): Promise<QuoteItem[]> => {
    const { data, error } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)
      .order('display_order');

    if (error) throw error;
    return data || [];
  };

  return {
    quotes,
    loading,
    error,
    createQuote,
    updateQuote,
    deleteQuote,
    getQuoteItems,
    refreshQuotes: fetchQuotes,
  };
}
