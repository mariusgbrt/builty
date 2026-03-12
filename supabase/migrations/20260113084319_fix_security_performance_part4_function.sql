/*
  # Fix Security and Performance Issues - Part 4: Fix Function

  ## Fix Function Search Path
  Sets immutable search_path for `get_user_company_id` function using CREATE OR REPLACE
*/

CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  );
END;
$$;