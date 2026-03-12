/*
  # Add invitations table

  1. New Tables
    - `invitations`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `email` (text) - Email of the invited user
      - `role` (text) - Role to assign (Admin, Membre, etc.)
      - `token` (text, unique) - Unique token for the invitation link
      - `invited_by` (uuid, foreign key to user_profiles) - Who sent the invitation
      - `status` (text) - Status: Pending, Accepted, Expired, Cancelled
      - `expires_at` (timestamptz) - Expiration date
      - `created_at` (timestamptz)
      - `accepted_at` (timestamptz)

  2. Security
    - Enable RLS on `invitations` table
    - Add policies for company members to view invitations
    - Add policies for admins to create and manage invitations
    - Add policy for anyone to view invitation by token (for accepting)
*/

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'Membre',
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Expired', 'Cancelled')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_company ON invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations for their company"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = get_user_company_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can update invitations"
  ON invitations
  FOR UPDATE
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

CREATE POLICY "Anyone can view invitation by token"
  ON invitations
  FOR SELECT
  TO anon, authenticated
  USING (status = 'Pending' AND expires_at > now());
