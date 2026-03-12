/*
  # Add Services/Tarifs Table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `name` (text, service name)
      - `description` (text, optional description)
      - `unit_price_ht` (numeric, price excluding tax)
      - `unit` (text, unit type: "Heure", "Jour", "Forfait", "Unite", etc.)
      - `default_tva_rate` (numeric, default VAT rate)
      - `is_active` (boolean, whether service is active)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `services` table
    - Add policy for authenticated users to read their company's services
    - Add policy for authenticated users to insert services for their company
    - Add policy for authenticated users to update their company's services
    - Add policy for authenticated users to delete their company's services

  3. Notes
    - Services are company-specific pricing items used for quote generation
    - The AI quote generator will use these services as a knowledge base
    - Default TVA rate is 20% (standard French rate)
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  unit_price_ht numeric(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'Unite',
  default_tva_rate numeric(5,2) NOT NULL DEFAULT 20,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's services"
  ON services FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM user_profiles
    WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert services for their company"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles
    WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their company's services"
  ON services FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM user_profiles
    WHERE id = auth.uid()
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles
    WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete their company's services"
  ON services FOR DELETE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM user_profiles
    WHERE id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_services_company_id ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
