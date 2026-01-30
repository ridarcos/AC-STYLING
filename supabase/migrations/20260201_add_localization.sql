-- Migration: Add Localization Support (Spanish)
-- Date: 2026-02-01
-- Description: Adds Spanish translation columns to content tables for user-generated text.

-- 1. Masterclasses
ALTER TABLE public.masterclasses
ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS subtitle_es TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT;

-- 2. Chapters (Lessons)
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS subtitle_es TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS takeaways_es JSONB DEFAULT '[]'::jsonb;

-- 3. Services (Offers)
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS subtitle_es TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS price_display_es TEXT; -- e.g. "€500" vs "$500" if needed, or just translated text
