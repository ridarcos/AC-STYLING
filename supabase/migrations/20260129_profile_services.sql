-- Migration: Active Studio Client Flag
-- Date: 2026-01-29
-- Description: Adds a flag to determine if a user has access to the Studio/Wardrobe collaboration tools.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS active_studio_client BOOLEAN DEFAULT FALSE;

-- Notify for dev environment
DO $$
BEGIN
    RAISE NOTICE 'Added active_studio_client to profiles table.';
END $$;
