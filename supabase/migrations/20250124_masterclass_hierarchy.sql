-- Migration: Masterclass Hierarchy
-- 1. Create masterclasses table
-- 2. Add relation to chapters
-- 3. Add RLS policies

-- 1. Create Masterclasses Table
CREATE TABLE IF NOT EXISTS public.masterclasses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    subtitle text,
    description text,
    thumbnail_url text,
    order_index int DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Update Chapters Table
ALTER TABLE public.chapters 
ADD COLUMN IF NOT EXISTS masterclass_id uuid REFERENCES public.masterclasses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_standalone boolean DEFAULT true;

-- 3. RLS for Masterclasses
ALTER TABLE public.masterclasses ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Anyone can view masterclasses"
  ON public.masterclasses FOR SELECT
  USING (true);

-- Admin Write Access
CREATE POLICY "Admins can insert masterclasses"
  ON public.masterclasses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update masterclasses"
  ON public.masterclasses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete masterclasses"
  ON public.masterclasses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Notify
DO $$
BEGIN
    RAISE NOTICE 'Migration 20250124_masterclass_hierarchy completed.';
END $$;
