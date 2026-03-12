/*
  # Create Builty Schema

  ## 1. New Tables

  ### companies
  - `id` (uuid, primary key)
  - `name` (text) - Raison sociale
  - `siret` (text, unique)
  - `vat_number` (text) - TVA intracommunautaire
  - `email` (text)
  - `phone` (text)
  - `address` (text)
  - `postal_code` (text)
  - `city` (text)
  - `logo_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### user_profiles
  - `id` (uuid, primary key, references auth.users)
  - `company_id` (uuid, references companies)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - Admin, Manager, Operator
  - `status` (text) - Active, Invited, Inactive
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### clients
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `type` (text) - Particulier, Entreprise
  - `name` (text)
  - `email` (text)
  - `phone` (text)
  - `address` (text)
  - `postal_code` (text)
  - `city` (text)
  - `siret` (text)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### quotes (devis)
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `client_id` (uuid, references clients)
  - `quote_number` (text, unique)
  - `status` (text) - Brouillon, Envoye, Accepte, Rejete, Converti
  - `amount_ht` (numeric)
  - `amount_ttc` (numeric)
  - `tva_amount` (numeric)
  - `tva_rate` (numeric, default 20)
  - `notes` (text)
  - `ai_confidence_score` (numeric)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `sent_at` (timestamptz)
  - `accepted_at` (timestamptz)

  ### quote_items
  - `id` (uuid, primary key)
  - `quote_id` (uuid, references quotes)
  - `description` (text)
  - `quantity` (numeric)
  - `unit_price_ht` (numeric)
  - `tva_rate` (numeric)
  - `total_ht` (numeric)
  - `display_order` (integer)

  ### invoices (factures)
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `client_id` (uuid, references clients)
  - `quote_id` (uuid, references quotes, nullable)
  - `project_id` (uuid, references projects, nullable)
  - `invoice_number` (text, unique)
  - `status` (text) - Brouillon, Envoyee, Partielle, Payee, En retard, Annulee
  - `amount_ht` (numeric)
  - `amount_ttc` (numeric)
  - `tva_amount` (numeric)
  - `tva_rate` (numeric, default 20)
  - `amount_paid` (numeric, default 0)
  - `issue_date` (date)
  - `due_date` (date)
  - `payment_terms` (text)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `sent_at` (timestamptz)
  - `paid_at` (timestamptz)

  ### invoice_items
  - `id` (uuid, primary key)
  - `invoice_id` (uuid, references invoices)
  - `description` (text)
  - `quantity` (numeric)
  - `unit_price_ht` (numeric)
  - `tva_rate` (numeric)
  - `total_ht` (numeric)
  - `display_order` (integer)

  ### payments
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `invoice_id` (uuid, references invoices)
  - `amount` (numeric)
  - `payment_date` (date)
  - `payment_method` (text) - Virement, Cheque, Especes, CB
  - `notes` (text)
  - `created_at` (timestamptz)

  ### projects (chantiers)
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `client_id` (uuid, references clients)
  - `name` (text)
  - `status` (text) - En attente, En cours, Termine, Annule
  - `amount_ht` (numeric)
  - `expected_margin_rate` (numeric) - Taux de marge prévu
  - `actual_margin_rate` (numeric) - Taux de marge réel
  - `start_date` (date)
  - `end_date` (date)
  - `address` (text)
  - `description` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### resources
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `type` (text) - Ouvrier, Independant, Sous-traitant, Vehicule, Outil
  - `name` (text)
  - `email` (text)
  - `phone` (text)
  - `status` (text) - Actif, Inactif
  - `created_at` (timestamptz)

  ### allocations (affectations planning)
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `project_id` (uuid, references projects)
  - `resource_id` (uuid, references resources)
  - `date` (date)
  - `start_time` (time)
  - `end_time` (time)
  - `status` (text) - Planifie, En cours, Termine, Annule
  - `notes` (text)
  - `created_at` (timestamptz)

  ### company_settings
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies, unique)
  - `invoice_number_pattern` (text, default 'FAC-{YYYY}-{0001}')
  - `quote_number_pattern` (text, default 'DEV-{YYYY}-{0001}')
  - `default_tva_rate` (numeric, default 20)
  - `default_payment_terms` (text, default '30 jours')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security

  All tables have RLS enabled with policies ensuring:
  - Users can only access data from their own company
  - Proper role-based access control
  - Authenticated users only
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  siret text UNIQUE,
  vat_number text,
  email text,
  phone text,
  address text,
  postal_code text,
  city text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_id uuid REFERENCES companies ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'Operator' CHECK (role IN ('Admin', 'Manager', 'Operator')),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Invited', 'Inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'Particulier' CHECK (type IN ('Particulier', 'Entreprise')),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  postal_code text,
  city text,
  siret text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies ON DELETE CASCADE,
  client_id uuid REFERENCES clients ON DELETE SET NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'En cours', 'Termine', 'Annule')),
  amount_ht numeric DEFAULT 0,
  expected_margin_rate numeric DEFAULT 0,
  actual_margin_rate numeric DEFAULT 0,
  start_date date,
  end_date date,
  address text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies ON DELETE CASCADE,
  client_id uuid REFERENCES clients ON DELETE SET NULL,
  quote_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'Brouillon' CHECK (status IN ('Brouillon', 'Envoye', 'Accepte', 'Rejete', 'Converti')),
  amount_ht numeric DEFAULT 0,
  amount_ttc numeric DEFAULT 0,
  tva_amount numeric DEFAULT 0,
  tva_rate numeric DEFAULT 20,
  notes text,
  ai_confidence_score numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  accepted_at timestamptz
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create quote_items table
CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price_ht numeric NOT NULL DEFAULT 0,
  tva_rate numeric NOT NULL DEFAULT 20,
  total_ht numeric NOT NULL DEFAULT 0,
  display_order integer DEFAULT 0
);

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies ON DELETE CASCADE,
  client_id uuid REFERENCES clients ON DELETE SET NULL,
  quote_id uuid REFERENCES quotes ON DELETE SET NULL,
  project_id uuid REFERENCES projects ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'Brouillon' CHECK (status IN ('Brouillon', 'Envoyee', 'Partielle', 'Payee', 'En retard', 'Annulee')),
  amount_ht numeric DEFAULT 0,
  amount_ttc numeric DEFAULT 0,
  tva_amount numeric DEFAULT 0,
  tva_rate numeric DEFAULT 20,
  amount_paid numeric DEFAULT 0,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  payment_terms text DEFAULT '30 jours',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  paid_at timestamptz
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price_ht numeric NOT NULL DEFAULT 0,
  tva_rate numeric NOT NULL DEFAULT 20,
  total_ht numeric NOT NULL DEFAULT 0,
  display_order integer DEFAULT 0
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES invoices ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text DEFAULT 'Virement' CHECK (payment_method IN ('Virement', 'Cheque', 'Especes', 'CB')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Ouvrier', 'Independant', 'Sous-traitant', 'Vehicule', 'Outil')),
  name text NOT NULL,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'Actif' CHECK (status IN ('Actif', 'Inactif')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create allocations table
CREATE TABLE IF NOT EXISTS allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies ON DELETE CASCADE,
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  resource_id uuid REFERENCES resources ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'Planifie' CHECK (status IN ('Planifie', 'En cours', 'Termine', 'Annule')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE NOT NULL REFERENCES companies ON DELETE CASCADE,
  invoice_number_pattern text DEFAULT 'FAC-{YYYY}-{0001}',
  quote_number_pattern text DEFAULT 'DEV-{YYYY}-{0001}',
  default_tva_rate numeric DEFAULT 20,
  default_payment_terms text DEFAULT '30 jours',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  )
  WITH CHECK (
    id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view profiles in their company"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for clients
CREATE POLICY "Users can view clients in their company"
  ON clients FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create clients in their company"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update clients in their company"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete clients in their company"
  ON clients FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their company"
  ON projects FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their company"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects in their company"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete projects in their company"
  ON projects FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for quotes
CREATE POLICY "Users can view quotes in their company"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create quotes in their company"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotes in their company"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quotes in their company"
  ON quotes FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for quote_items
CREATE POLICY "Users can view quote items in their company"
  ON quote_items FOR SELECT
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create quote items in their company"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update quote items in their company"
  ON quote_items FOR UPDATE
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete quote items in their company"
  ON quote_items FOR DELETE
  TO authenticated
  USING (
    quote_id IN (
      SELECT id FROM quotes 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices in their company"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices in their company"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices in their company"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoices in their company"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for invoice_items
CREATE POLICY "Users can view invoice items in their company"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create invoice items in their company"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update invoice items in their company"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete invoice items in their company"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE company_id IN (
        SELECT company_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view payments in their company"
  ON payments FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments in their company"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments in their company"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payments in their company"
  ON payments FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for resources
CREATE POLICY "Users can view resources in their company"
  ON resources FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create resources in their company"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update resources in their company"
  ON resources FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete resources in their company"
  ON resources FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for allocations
CREATE POLICY "Users can view allocations in their company"
  ON allocations FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create allocations in their company"
  ON allocations FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update allocations in their company"
  ON allocations FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete allocations in their company"
  ON allocations FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for company_settings
CREATE POLICY "Users can view settings in their company"
  ON company_settings FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update settings in their company"
  ON company_settings FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "System can create settings"
  ON company_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_company ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_resources_company ON resources(company_id);
CREATE INDEX IF NOT EXISTS idx_allocations_company ON allocations(company_id);
CREATE INDEX IF NOT EXISTS idx_allocations_project ON allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_allocations_resource ON allocations(resource_id);
CREATE INDEX IF NOT EXISTS idx_allocations_date ON allocations(date);
