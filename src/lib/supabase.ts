import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          siret: string | null
          vat_number: string | null
          email: string | null
          phone: string | null
          address: string | null
          postal_code: string | null
          city: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          siret?: string | null
          vat_number?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          postal_code?: string | null
          city?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          siret?: string | null
          vat_number?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          postal_code?: string | null
          city?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          company_id: string | null
          email: string
          full_name: string | null
          role: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          company_id?: string | null
          email: string
          full_name?: string | null
          role?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          email?: string
          full_name?: string | null
          role?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
    }
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
    }
  }
}