-- Migration: Enforce Wardrobe RLS
-- Date: 2026-02-01

-- 1. Enable RLS (Idempotent)
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential rogue policies
DROP POLICY IF EXISTS "Public view" ON public.wardrobe_items;
DROP POLICY IF EXISTS "Anon view" ON public.wardrobe_items;

-- 3. Re-assert Owner Policy
DROP POLICY IF EXISTS "Users can view own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can view own wardrobe items" 
ON public.wardrobe_items FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Re-assert Admin Policy
DROP POLICY IF EXISTS "Admins can manage all wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Admins can manage all wardrobe items" 
ON public.wardrobe_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
