/*
  # Fix Security and Performance Issues - Part 5: Restrict Company Creation Policy

  ## Restrict Company Creation
  Users can only create a company if they are authenticated.
  This is necessary for the signup flow but prevents abuse.
*/

DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON companies;

CREATE POLICY "Allow authenticated users to create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.company_id IS NOT NULL
    )
  );