
-- Migration: Create Storage Bucket for Boutique
-- Purpose: Host partner logos and product images.

-- 1. Create Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('boutique', 'boutique', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Security Policies
-- Enable RLS on objects (it's enabled by default usually, but good to be sure)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'boutique' );

-- Policy: Admin Upload/Delete/Update
CREATE POLICY "Admin All Access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'boutique' 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
)
WITH CHECK (
  bucket_id = 'boutique' 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
