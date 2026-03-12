/*
  # Add RLS Policies for Invoices

  ## Tables Affected
  - `invoices` - Invoice records with RLS policies
  - `invoice_items` - Invoice line items with RLS policies

  ## Security Policies

  ### Invoices Table
  - Users can view invoices from their company
  - Users can create invoices for their company
  - Users can update invoices from their company
  - Users can delete invoices from their company

  ### Invoice Items Table
  - Users can view invoice items for invoices from their company
  - Users can create invoice items for invoices from their company
  - Users can update invoice items for invoices from their company
  - Users can delete invoice items for invoices from their company
*/

-- Invoices policies
CREATE POLICY "Users can view invoices from their company"
  ON invoices FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create invoices for their company"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update invoices from their company"
  ON invoices FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete invoices from their company"
  ON invoices FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Invoice items policies
CREATE POLICY "Users can view invoice items from their company"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can create invoice items for their company"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update invoice items from their company"
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

CREATE POLICY "Users can delete invoice items from their company"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.company_id = get_user_company_id()
    )
  );
