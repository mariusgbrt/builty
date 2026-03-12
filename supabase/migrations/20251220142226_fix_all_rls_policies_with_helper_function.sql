/*
  # Fix All RLS Policies Using Helper Function

  ## Problem
  Many policies query user_profiles to get company_id, which can cause:
  - Performance issues
  - Potential recursion problems
  - Complexity

  ## Solution
  1. Create a helper function that returns the current user's company_id
  2. Update all policies to use this function instead of subqueries
  3. This makes policies simpler and more efficient

  ## Security
  - Function uses SECURITY DEFINER to bypass RLS when getting company_id
  - All existing security rules are maintained
*/

-- Create helper function to get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Update companies policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;

CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  TO authenticated
  USING (id = get_user_company_id());

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  )
  WITH CHECK (
    id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Update clients policies
DROP POLICY IF EXISTS "Users can view clients in their company" ON clients;
DROP POLICY IF EXISTS "Users can create clients in their company" ON clients;
DROP POLICY IF EXISTS "Users can update clients in their company" ON clients;
DROP POLICY IF EXISTS "Users can delete clients in their company" ON clients;

CREATE POLICY "Users can view clients in their company"
  ON clients FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create clients in their company"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update clients in their company"
  ON clients FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete clients in their company"
  ON clients FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Update projects policies
DROP POLICY IF EXISTS "Users can view projects in their company" ON projects;
DROP POLICY IF EXISTS "Users can create projects in their company" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their company" ON projects;
DROP POLICY IF EXISTS "Users can delete projects in their company" ON projects;

CREATE POLICY "Users can view projects in their company"
  ON projects FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create projects in their company"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update projects in their company"
  ON projects FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete projects in their company"
  ON projects FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Update quotes policies
DROP POLICY IF EXISTS "Users can view quotes in their company" ON quotes;
DROP POLICY IF EXISTS "Users can create quotes in their company" ON quotes;
DROP POLICY IF EXISTS "Users can update quotes in their company" ON quotes;
DROP POLICY IF EXISTS "Users can delete quotes in their company" ON quotes;

CREATE POLICY "Users can view quotes in their company"
  ON quotes FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create quotes in their company"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update quotes in their company"
  ON quotes FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete quotes in their company"
  ON quotes FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Update invoices policies
DROP POLICY IF EXISTS "Users can view invoices in their company" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices in their company" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices in their company" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices in their company" ON invoices;

CREATE POLICY "Users can view invoices in their company"
  ON invoices FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create invoices in their company"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update invoices in their company"
  ON invoices FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete invoices in their company"
  ON invoices FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Update payments policies
DROP POLICY IF EXISTS "Users can view payments in their company" ON payments;
DROP POLICY IF EXISTS "Users can create payments in their company" ON payments;
DROP POLICY IF EXISTS "Users can update payments in their company" ON payments;
DROP POLICY IF EXISTS "Users can delete payments in their company" ON payments;

CREATE POLICY "Users can view payments in their company"
  ON payments FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create payments in their company"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update payments in their company"
  ON payments FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete payments in their company"
  ON payments FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Update resources policies
DROP POLICY IF EXISTS "Users can view resources in their company" ON resources;
DROP POLICY IF EXISTS "Users can create resources in their company" ON resources;
DROP POLICY IF EXISTS "Users can update resources in their company" ON resources;
DROP POLICY IF EXISTS "Users can delete resources in their company" ON resources;

CREATE POLICY "Users can view resources in their company"
  ON resources FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create resources in their company"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update resources in their company"
  ON resources FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete resources in their company"
  ON resources FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Update allocations policies
DROP POLICY IF EXISTS "Users can view allocations in their company" ON allocations;
DROP POLICY IF EXISTS "Users can create allocations in their company" ON allocations;
DROP POLICY IF EXISTS "Users can update allocations in their company" ON allocations;
DROP POLICY IF EXISTS "Users can delete allocations in their company" ON allocations;

CREATE POLICY "Users can view allocations in their company"
  ON allocations FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create allocations in their company"
  ON allocations FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update allocations in their company"
  ON allocations FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete allocations in their company"
  ON allocations FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Update company_settings policies
DROP POLICY IF EXISTS "Users can view settings in their company" ON company_settings;
DROP POLICY IF EXISTS "Admins can update settings in their company" ON company_settings;
DROP POLICY IF EXISTS "System can create settings" ON company_settings;

CREATE POLICY "Users can view settings in their company"
  ON company_settings FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can update settings in their company"
  ON company_settings FOR UPDATE
  TO authenticated
  USING (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  )
  WITH CHECK (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "System can create settings"
  ON company_settings FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

-- Update quote_items policies to check parent quote's company
DROP POLICY IF EXISTS "Users can view quote items in their company" ON quote_items;
DROP POLICY IF EXISTS "Users can create quote items in their company" ON quote_items;
DROP POLICY IF EXISTS "Users can update quote items in their company" ON quote_items;
DROP POLICY IF EXISTS "Users can delete quote items in their company" ON quote_items;

CREATE POLICY "Users can view quote items in their company"
  ON quote_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can create quote items in their company"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update quote items in their company"
  ON quote_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.company_id = get_user_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can delete quote items in their company"
  ON quote_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.company_id = get_user_company_id()
    )
  );

-- Update invoice_items policies to check parent invoice's company
DROP POLICY IF EXISTS "Users can view invoice items in their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can create invoice items in their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items in their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items in their company" ON invoice_items;

CREATE POLICY "Users can view invoice items in their company"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can create invoice items in their company"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update invoice items in their company"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.company_id = get_user_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can delete invoice items in their company"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.company_id = get_user_company_id()
    )
  );
