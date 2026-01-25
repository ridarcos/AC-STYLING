
-- Migration: Add created_at to profiles
-- Purpose: Fix sorting issue in Client List and track user creation.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill existing NULLs (though default handles new ones, existing rows need value)
UPDATE public.profiles 
SET created_at = NOW() 
WHERE created_at IS NULL;
