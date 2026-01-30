
-- Migration: Add takeaways_es to Masterclasses
-- Date: 2026-02-01
-- Description: Adds missing localization column for takeaways (JSONB) to masterclasses table.

ALTER TABLE public.masterclasses
ADD COLUMN IF NOT EXISTS takeaways_es jsonb DEFAULT '[]'::jsonb;

-- Also ensure other columns exist just in case
ALTER TABLE public.masterclasses
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS subtitle_es text,
ADD COLUMN IF NOT EXISTS description_es text;
