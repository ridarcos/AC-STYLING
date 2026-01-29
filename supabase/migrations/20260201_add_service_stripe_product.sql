-- Migration: Add Stripe Product ID to Services
-- Date: 2026-02-01

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS stripe_product_id text;
