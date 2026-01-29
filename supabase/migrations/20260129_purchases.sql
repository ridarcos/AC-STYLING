-- Migration: Purchases Table for Pay-Per-View Model
-- Date: 2026-01-29
-- Description: Tracks which users have purchased which products (e.g. Masterclasses).

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT NOT NULL, -- e.g. 'masterclass-audit', 'masterclass-foundations'
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_purchases_user_product ON public.purchases(user_id, product_id);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own purchases"
ON public.purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
ON public.purchases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Note: Inserts should happen via Service Role (Server Actions) to prevent client-side forgery.
-- So we generally DO NOT add an INSERT policy for public/authenticated users, 
-- unless we are using a client-side payment flow that we trust (which is rare).
-- We will stick to Server Action insertions.
