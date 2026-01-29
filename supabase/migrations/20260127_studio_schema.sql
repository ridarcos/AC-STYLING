-- Migration: The Studio Schema
-- Date: 2026-01-27
-- Description: Adds tables for Guest profiles, Measurements (Tailor Cards), Wardrobe Assets, and Lookbooks.

-- 1. Update Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS intake_token UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS studio_permissions JSONB DEFAULT '{"lookbook": true, "wardrobe": true}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_intake_token ON public.profiles(intake_token);

-- 2. Tailor Cards (Technical Profile)
CREATE TABLE IF NOT EXISTS public.tailor_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    measurements JSONB NOT NULL DEFAULT '{}'::jsonb, -- Stores bust, waist, hips, inseam, etc.
    last_updated_by UUID REFERENCES auth.users(id), -- Alejandra's ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.tailor_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tailor card" 
ON public.tailor_cards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tailor cards" 
ON public.tailor_cards FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 3. Wardrobe Items (Asset Manager)
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Can be NULL for Ale's general library
    image_url TEXT NOT NULL,
    category TEXT,
    client_note TEXT,
    internal_note TEXT,
    status TEXT DEFAULT 'Keep' CHECK (status IN ('Keep', 'Tailor', 'Donate', 'Archive')),
    product_link_id UUID REFERENCES public.boutique_items(id) ON DELETE SET NULL, -- Boutique Hook
    is_general_library BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wardrobe items" 
ON public.wardrobe_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items during intake" 
ON public.wardrobe_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all wardrobe items" 
ON public.wardrobe_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Lookbooks (Outfit Builder)
CREATE TABLE IF NOT EXISTS public.lookbooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    collection_name TEXT, -- e.g. "Winter '26 Capsule"
    status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Published')),
    metadata JSONB DEFAULT '{}'::jsonb, -- For future Canva embed links or ordering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lookbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their published lookbooks" 
ON public.lookbooks FOR SELECT 
USING (auth.uid() = user_id AND status = 'Published');

CREATE POLICY "Admins can manage all lookbooks" 
ON public.lookbooks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 5. Lookbook Items (Junction Table)
CREATE TABLE IF NOT EXISTS public.lookbook_items (
    lookbook_id UUID REFERENCES public.lookbooks(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
    position INTEGER DEFAULT 0, -- For ordering in the outfit
    PRIMARY KEY (lookbook_id, item_id)
);

ALTER TABLE public.lookbook_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in their lookbooks" 
ON public.lookbook_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.lookbooks 
        WHERE lookbooks.id = lookbook_items.lookbook_id 
        AND lookbooks.user_id = auth.uid()
        AND lookbooks.status = 'Published'
    )
);

CREATE POLICY "Admins can manage all lookbook items" 
ON public.lookbook_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 6. Updated At Triggers
CREATE TRIGGER handle_updated_at_tailor_cards BEFORE UPDATE ON public.tailor_cards FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_wardrobe_items BEFORE UPDATE ON public.wardrobe_items FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at_lookbooks BEFORE UPDATE ON public.lookbooks FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 7. Storage Bucket for Wardrobe
-- Note: This might need to be run separately or via Supabase UI, but adding here as reference
INSERT INTO storage.buckets (id, name, public) 
VALUES ('studio-wardrobe', 'studio-wardrobe', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Wardrobe assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'studio-wardrobe' );

CREATE POLICY "Anyone can upload wardrobe assets (protected by app logic)"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'studio-wardrobe' );
