/*
  # Create email_leads table for marketing
  
  1. New Tables
    - `email_leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `email` (text, unique, not null) - Email address of the lead
      - `source` (text, not null) - Source of the lead (hero, final_cta)
      - `accepted_rgpd` (boolean, not null) - Whether the user accepted RGPD
      - `created_at` (timestamptz) - Timestamp when the lead was created
      - `converted` (boolean, default false) - Whether the lead converted to a signup
      
  2. Security
    - Enable RLS on `email_leads` table
    - Add policy for service role to manage leads (internal use only)
    - No public access - this is for internal marketing purposes only
    
  3. Indexes
    - Index on email for quick lookups
    - Index on created_at for filtering by date
*/

-- Create email_leads table
CREATE TABLE IF NOT EXISTS email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text NOT NULL,
  accepted_rgpd boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  converted boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE email_leads ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_leads_email ON email_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_leads_created_at ON email_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_leads_converted ON email_leads(converted);

-- Policy: Only service role can manage leads (no public access)
CREATE POLICY "Service role can manage all leads"
  ON email_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can insert their own email lead (for the form submission)
CREATE POLICY "Anyone can insert email lead"
  ON email_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);