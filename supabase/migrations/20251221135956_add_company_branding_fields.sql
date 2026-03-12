/*
  # Add Company Branding Fields

  1. Changes
    - Add `primary_color` column to companies table (default: #0D47A1)
    - Add `secondary_color` column to companies table (default: #1976D2)
  
  2. Storage
    - Create storage bucket for company logos
    - Add RLS policies for logo uploads and downloads

  3. Security
    - Only authenticated users from the company can upload/update logos
    - Anyone can view company logos (for quotes, invoices visibility)
*/

-- Add color columns to companies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'primary_color'
  ) THEN
    ALTER TABLE companies ADD COLUMN primary_color text DEFAULT '#0D47A1';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'secondary_color'
  ) THEN
    ALTER TABLE companies ADD COLUMN secondary_color text DEFAULT '#1976D2';
  END IF;
END $$;

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos for their company
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload logos for their company'
  ) THEN
    CREATE POLICY "Users can upload logos for their company"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'company-logos' AND
        (storage.foldername(name))[1] IN (
          SELECT company_id::text FROM user_profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow authenticated users to update logos for their company
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update logos for their company'
  ) THEN
    CREATE POLICY "Users can update logos for their company"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'company-logos' AND
        (storage.foldername(name))[1] IN (
          SELECT company_id::text FROM user_profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow authenticated users to delete logos for their company
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete logos for their company'
  ) THEN
    CREATE POLICY "Users can delete logos for their company"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'company-logos' AND
        (storage.foldername(name))[1] IN (
          SELECT company_id::text FROM user_profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow anyone to view logos (public access for quotes/invoices)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view company logos'
  ) THEN
    CREATE POLICY "Anyone can view company logos"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'company-logos');
  END IF;
END $$;
