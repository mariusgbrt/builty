/*
  # Fix Security and Performance Issues - Part 3: Optimize RLS Policies

  ## Optimize RLS Policies with SELECT auth Functions
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation for each row
*/

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Allow profile creation during signup"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- stripe_customers policies
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- stripe_subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stripe_customers
      WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id
      AND stripe_customers.user_id = (select auth.uid())
    )
  );

-- stripe_orders policies
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stripe_customers
      WHERE stripe_customers.customer_id = stripe_orders.customer_id
      AND stripe_customers.user_id = (select auth.uid())
    )
  );

-- companies policies - optimize existing ones
DROP POLICY IF EXISTS "Admins can update their company" ON companies;

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.company_id = companies.id
      AND user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

-- company_settings policies
DROP POLICY IF EXISTS "Admins can update settings in their company" ON company_settings;

CREATE POLICY "Admins can update settings in their company"
  ON company_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.company_id = company_settings.company_id
      AND user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

-- services policies
DROP POLICY IF EXISTS "Users can view their company's services" ON services;
DROP POLICY IF EXISTS "Users can insert services for their company" ON services;
DROP POLICY IF EXISTS "Users can update their company's services" ON services;
DROP POLICY IF EXISTS "Users can delete their company's services" ON services;

CREATE POLICY "Users can view their company's services"
  ON services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.company_id = services.company_id
      AND user_profiles.id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert services for their company"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.company_id = services.company_id
      AND user_profiles.id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update their company's services"
  ON services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.company_id = services.company_id
      AND user_profiles.id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete their company's services"
  ON services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.company_id = services.company_id
      AND user_profiles.id = (select auth.uid())
    )
  );

-- invitations policies
DROP POLICY IF EXISTS "Admins can create invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON invitations;

CREATE POLICY "Admins can create invitations"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.company_id = invitations.company_id
      AND user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update invitations"
  ON invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.company_id = invitations.company_id
      AND user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
    )
  );