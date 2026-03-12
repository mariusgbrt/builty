/*
  # Fix user_profiles RLS policies to allow team visibility

  ## Problem
  Current policy only allows users to view their own profile (id = auth.uid()).
  This prevents users from viewing other team members in their company,
  causing pages to hang while trying to load team data.

  ## Solution
  Add a policy that allows users to view all profiles within their company.

  ## Security
  - Users can only view profiles from their own company
  - Uses get_user_company_id() helper function for efficient company lookup
*/

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

CREATE POLICY "Users can view profiles in their company"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());
