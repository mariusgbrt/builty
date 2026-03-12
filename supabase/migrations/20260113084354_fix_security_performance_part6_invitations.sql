/*
  # Fix Security and Performance Issues - Part 6: Fix Invitations Policies

  ## Remove Duplicate Policy
  Keep only "Anyone can view invitation by token" for invitations
*/

DROP POLICY IF EXISTS "Users can view invitations for their company" ON invitations;