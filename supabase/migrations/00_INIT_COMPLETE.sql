-- ============================================
-- MIGRATION COMPLÈTE BUILTY - INITIALISATION
-- Exécutez ce fichier UNE SEULE FOIS pour créer toute la structure
-- ============================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLES DE BASE
-- ============================================

-- Table companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'REGULAR',
  subscription_status VARCHAR(50) DEFAULT 'trial',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table profiles (utilisateurs)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Member',
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Renommer en user_profiles si besoin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles') THEN
    CREATE TABLE user_profiles AS SELECT * FROM profiles WHERE 1=0;
    INSERT INTO user_profiles SELECT * FROM profiles;
  END IF;
END $$;

-- Table clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  client_type VARCHAR(50) DEFAULT 'individual',
  siret VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table projects (chantiers)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table quotes (devis)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_amount DECIMAL(15,2) NOT NULL,
  items JSONB,
  notes TEXT,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table invoices (factures)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'unpaid',
  total_amount DECIMAL(15,2) NOT NULL,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  items JSONB,
  notes TEXT,
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table resources (ressources)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  availability_status VARCHAR(50) DEFAULT 'available',
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table allocations
CREATE TABLE IF NOT EXISTS allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours_allocated INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Member',
  status VARCHAR(50) DEFAULT 'pending',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table email_leads
CREATE TABLE IF NOT EXISTS email_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(100),
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. INDEXES POUR PERFORMANCES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_resources_company_id ON resources(company_id);
CREATE INDEX IF NOT EXISTS idx_allocations_company_id ON allocations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON invitations(company_id);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_leads ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour vérifier l'appartenance à une entreprise
CREATE OR REPLACE FUNCTION user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Policies pour companies
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id = user_company_id());

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  USING (id = user_company_id());

CREATE POLICY "Users can insert their company"
  ON companies FOR INSERT
  WITH CHECK (true);

-- Policies pour profiles
CREATE POLICY "Users can view profiles in their company"
  ON profiles FOR SELECT
  USING (company_id = user_company_id());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Policies pour clients
CREATE POLICY "Users can view clients in their company"
  ON clients FOR SELECT
  USING (company_id = user_company_id());

CREATE POLICY "Users can insert clients in their company"
  ON clients FOR INSERT
  WITH CHECK (company_id = user_company_id());

CREATE POLICY "Users can update clients in their company"
  ON clients FOR UPDATE
  USING (company_id = user_company_id());

CREATE POLICY "Users can delete clients in their company"
  ON clients FOR DELETE
  USING (company_id = user_company_id());

-- Policies pour projects
CREATE POLICY "Users can view projects in their company"
  ON projects FOR SELECT
  USING (company_id = user_company_id());

CREATE POLICY "Users can insert projects in their company"
  ON projects FOR INSERT
  WITH CHECK (company_id = user_company_id());

CREATE POLICY "Users can update projects in their company"
  ON projects FOR UPDATE
  USING (company_id = user_company_id());

CREATE POLICY "Users can delete projects in their company"
  ON projects FOR DELETE
  USING (company_id = user_company_id());

-- Policies similaires pour quotes, invoices, resources, allocations
CREATE POLICY "Users can manage quotes in their company" ON quotes FOR ALL USING (company_id = user_company_id());
CREATE POLICY "Users can manage invoices in their company" ON invoices FOR ALL USING (company_id = user_company_id());
CREATE POLICY "Users can manage resources in their company" ON resources FOR ALL USING (company_id = user_company_id());
CREATE POLICY "Users can manage allocations in their company" ON allocations FOR ALL USING (company_id = user_company_id());
CREATE POLICY "Users can manage invitations in their company" ON invitations FOR ALL USING (company_id = user_company_id());

-- Policy pour email_leads (public)
CREATE POLICY "Anyone can insert email leads" ON email_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update email leads" ON email_leads FOR UPDATE USING (true);

-- ============================================
-- 4. TRIGGERS POUR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER allocations_updated_at BEFORE UPDATE ON allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invitations_updated_at BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ✅ MIGRATION COMPLÈTE - TERMINÉE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION BUILTY COMPLÈTE - SUCCÈS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables créées: companies, profiles, clients, projects, quotes, invoices, resources, allocations, invitations, email_leads';
  RAISE NOTICE 'RLS activé sur toutes les tables';
  RAISE NOTICE 'Prochaine étape: Exécutez create_channels.sql puis fix_channels.sql';
  RAISE NOTICE '========================================';
END $$;
