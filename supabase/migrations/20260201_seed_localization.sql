
-- Migration: Seed Missing Localization Data
-- Date: 2026-02-01
-- Description: Backfills missing Spanish titles with English values + suffix to prevent UI blanks.

-- 1. Masterclasses
UPDATE public.masterclasses
SET 
  title_es = COALESCE(title_es, title || ' (ES)'),
  description_es = COALESCE(description_es, description),
  takeaways_es = COALESCE(takeaways_es, '[]'::jsonb)
WHERE title_es IS NULL;

-- 2. Chapters
UPDATE public.chapters
SET 
  title_es = COALESCE(title_es, title || ' (ES)'),
  subtitle_es = COALESCE(subtitle_es, subtitle)
WHERE title_es IS NULL;

-- 3. Services
UPDATE public.services
SET 
  title_es = COALESCE(title_es, title || ' (ES)'),
  description_es = COALESCE(description_es, description)
WHERE title_es IS NULL;
