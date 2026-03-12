/*
  # Add RLS Policies for Quotes and Clients

  ## Tables Affected
  - `quotes` - Quote records with RLS policies
  - `quote_items` - Quote line items with RLS policies
  - `clients` - Client records with RLS policies

  ## Security Policies

  ### Quotes Table
  - Users can view quotes from their company
  - Users can create quotes for their company
  - Users can update quotes from their company
  - Users can delete quotes from their company

  ### Quote Items Table
  - Users can view quote items for quotes from their company
  - Users can create quote items for quotes from their company
  - Users can update quote items for quotes from their company
  - Users can delete quote items for quotes from their company

  ### Clients Table
  - Users can view clients from their company
  - Users can create clients for their company
  - Users can update clients from their company
  - Users can delete clients from their company
*/

-- Quotes policies
CREATE POLICY "Users can view quotes from their company"
  ON quotes FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create quotes for their company"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update quotes from their company"
  ON quotes FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete quotes from their company"
  ON quotes FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- Quote items policies
CREATE POLICY "Users can view quote items from their company"
  ON quote_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can create quote items for their company"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update quote items from their company"
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

CREATE POLICY "Users can delete quote items from their company"
  ON quote_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.company_id = get_user_company_id()
    )
  );

-- Clients policies
CREATE POLICY "Users can view clients from their company"
  ON clients FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can create clients for their company"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update clients from their company"
  ON clients FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can delete clients from their company"
  ON clients FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());
