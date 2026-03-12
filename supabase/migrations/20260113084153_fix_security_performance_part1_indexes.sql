/*
  # Fix Security and Performance Issues - Part 1: Indexes

  ## Add Missing Indexes on Foreign Keys
  - Add index on `invitations.invited_by`
  - Add index on `invoices.project_id`
  - Add index on `invoices.quote_id`

  ## Remove Unused Indexes
  - Drop `idx_payments_company`
  - Drop `idx_allocations_date`
  - Drop `idx_services_is_active`
  - Drop `idx_invitations_email`
  - Drop `idx_invitations_status`
*/

-- Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);

-- Drop unused indexes
DROP INDEX IF EXISTS idx_payments_company;
DROP INDEX IF EXISTS idx_allocations_date;
DROP INDEX IF EXISTS idx_services_is_active;
DROP INDEX IF EXISTS idx_invitations_email;
DROP INDEX IF EXISTS idx_invitations_status;