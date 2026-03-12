/*
  # Fix Security and Performance Issues - Part 2: Remove Duplicate RLS Policies

  ## Remove Duplicate Policies
  Removes older duplicate policies, keeping the newer ones
*/

-- Remove duplicate RLS policies for clients (keeping "in their company" versions)
DROP POLICY IF EXISTS "Users can delete clients from their company" ON clients;
DROP POLICY IF EXISTS "Users can create clients for their company" ON clients;
DROP POLICY IF EXISTS "Users can view clients from their company" ON clients;
DROP POLICY IF EXISTS "Users can update clients from their company" ON clients;

-- Remove duplicate RLS policies for invoice_items (keeping "in their company" versions)
DROP POLICY IF EXISTS "Users can delete invoice items from their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can create invoice items for their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can view invoice items from their company" ON invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items from their company" ON invoice_items;

-- Remove duplicate RLS policies for invoices (keeping "in their company" versions)
DROP POLICY IF EXISTS "Users can delete invoices from their company" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices for their company" ON invoices;
DROP POLICY IF EXISTS "Users can view invoices from their company" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices from their company" ON invoices;

-- Remove duplicate RLS policies for quote_items (keeping "in their company" versions)
DROP POLICY IF EXISTS "Users can delete quote items from their company" ON quote_items;
DROP POLICY IF EXISTS "Users can create quote items for their company" ON quote_items;
DROP POLICY IF EXISTS "Users can view quote items from their company" ON quote_items;
DROP POLICY IF EXISTS "Users can update quote items from their company" ON quote_items;

-- Remove duplicate RLS policies for quotes (keeping "in their company" versions)
DROP POLICY IF EXISTS "Users can delete quotes from their company" ON quotes;
DROP POLICY IF EXISTS "Users can create quotes for their company" ON quotes;
DROP POLICY IF EXISTS "Users can view quotes from their company" ON quotes;
DROP POLICY IF EXISTS "Users can update quotes from their company" ON quotes;