
-- Migration: The Boutique Schema
-- Purpose: Store partner brands and curated boutique items.

-- 1. Partner Brands Table
CREATE TABLE IF NOT EXISTS public.partner_brands (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    logo_url text, -- Store monochromatic version ideally
    website_url text,
    order_index integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Boutique Items Table
CREATE TABLE IF NOT EXISTS public.boutique_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id uuid REFERENCES public.partner_brands(id) ON DELETE CASCADE,
    name text NOT NULL,
    image_url text NOT NULL,
    curator_note text, -- "Liquid Glass" tip text
    affiliate_url_usa text,
    affiliate_url_es text,
    category text, -- e.g. 'Accessories', 'Shoes'
    order_index integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE public.partner_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boutique_items ENABLE ROW LEVEL SECURITY;

-- Public Read
CREATE POLICY "Public view brands" ON public.partner_brands FOR SELECT USING (true);
CREATE POLICY "Public view items" ON public.boutique_items FOR SELECT USING (true);

-- Admin Write (Brands)
CREATE POLICY "Admins manage brands" ON public.partner_brands FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Admin Write (Items)
CREATE POLICY "Admins manage items" ON public.boutique_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 4. Indexes
CREATE INDEX idx_brands_order ON public.partner_brands(order_index);
CREATE INDEX idx_items_brand ON public.boutique_items(brand_id);
CREATE INDEX idx_items_order ON public.boutique_items(order_index);
