-- Fix Storage RLS for Studio Wardrobe
-- Ensure Anonymous users can upload to the studio-wardrobe bucket

-- 1. Ensure Bucket Exists and is Public
INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-wardrobe', 'studio-wardrobe', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts/duplication
DROP POLICY IF EXISTS "Wardrobe assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload wardrobe assets (protected by app logic)" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload wardrobe assets" ON storage.objects;
DROP POLICY IF EXISTS "Anon users can upload wardrobe assets" ON storage.objects;

-- 3. Create Robust Policies

-- ALLOW SELECT (Public Read)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'studio-wardrobe' );

-- ALLOW INSERT (Authenticated + Anon Uploads)
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'studio-wardrobe' );

-- ALLOW UPDATE (Owner Only - based on path convention user_id/...)
CREATE POLICY "Owner Update Access"
ON storage.objects FOR UPDATE
TO public
USING ( bucket_id = 'studio-wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text );

-- ALLOW DELETE (Owner Only)
CREATE POLICY "Owner Delete Access"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'studio-wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text );
