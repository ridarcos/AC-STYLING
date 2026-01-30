-- Add Spanish localization columns for content tables

-- 1. Masterclasses
ALTER TABLE public.masterclasses
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS subtitle_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- 2. Chapters (video_id_es already exists, adding metadata)
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS subtitle_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- 3. Services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS subtitle_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- 4. Offers
ALTER TABLE public.offers
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- 5. Boutique Items (optional but helpful)
ALTER TABLE public.boutique_items
ADD COLUMN IF NOT EXISTS curator_note_es text;
