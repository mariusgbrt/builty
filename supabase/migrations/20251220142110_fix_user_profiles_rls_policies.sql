/*
  # Fix User Profiles RLS Policies

  ## Problem
  The existing policy "Users can view profiles in their company" causes infinite recursion
  because it queries user_profiles within a policy on user_profiles itself.

  ## Solution
  1. Drop the problematic policies
  2. Create simpler, non-recursive policies
  3. Users can only view their own profile (no company-wide access needed for basic operations)
  4. Add INSERT policy for signup process

  ## Security
  - Users can only read their own profile
  - Users can update their own profile
  - System can insert profiles during signup
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Allow profile creation during signup"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
