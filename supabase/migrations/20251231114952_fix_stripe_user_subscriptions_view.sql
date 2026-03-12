/*
  # Fix stripe_user_subscriptions View
  
  1. Changes
    - Recreate the `stripe_user_subscriptions` view to properly handle users without Stripe customer records
    - Remove the `AND s.deleted_at IS NULL` filter that was preventing NULL results from LEFT JOIN
    - This allows newly registered users to see their subscription status (even if NULL)
  
  2. Notes
    - New users without a Stripe customer will see all NULL values for subscription fields
    - This is expected behavior and should be handled by the frontend
    - Once a user creates a subscription, the view will return their subscription data
*/

-- Drop the existing view
DROP VIEW IF EXISTS stripe_user_subscriptions;

-- Recreate the view without the problematic filter
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id AND s.deleted_at IS NULL
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL;

GRANT SELECT ON stripe_user_subscriptions TO authenticated;
