-- Migration: Create Offers Table for Full Access & Special bundles
-- Date: 2026-02-01

CREATE TABLE IF NOT EXISTS public.offers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text UNIQUE NOT NULL, -- e.g. 'full_access'
    title text NOT NULL,
    description text,
    price_display text, -- e.g. "$2,500 One-time"
    stripe_product_id text,
    price_id text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active offers"
    ON public.offers FOR SELECT
    USING (active = true OR (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    ));

CREATE POLICY "Admins can manage offers"
    ON public.offers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Trigger
CREATE TRIGGER on_offers_update
    BEFORE UPDATE ON public.offers
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
