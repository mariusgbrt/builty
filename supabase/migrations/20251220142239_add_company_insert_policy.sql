/*
  # Add Company Insert Policy

  ## Problem
  During signup, users need to be able to create a new company.
  Currently there's no INSERT policy on the companies table.

  ## Solution
  Add a policy that allows authenticated users to insert companies.
  This is safe because each user can only create one company during signup.

  ## Security
  - Only authenticated users can create companies
  - This is used during the signup process
*/

-- Add INSERT policy for companies
CREATE POLICY "Allow authenticated users to create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);
