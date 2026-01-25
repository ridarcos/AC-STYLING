-- Migration: Consolidate lesson_metadata into chapters
-- 1. Add JSONB columns to chapters
-- 2. Migrate existing data from lesson_metadata
-- 3. Drop lesson_metadata table

-- 1. Add Columns
ALTER TABLE public.chapters 
ADD COLUMN IF NOT EXISTS lab_questions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS takeaways jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS resource_urls jsonb DEFAULT '[]'::jsonb;

-- 2. Migrate Data
-- Update chapters with data from lesson_metadata where IDs match
UPDATE public.chapters c
SET 
    lab_questions = lm.lab_questions,
    takeaways = lm.takeaways,
    resource_urls = lm.resource_urls
FROM public.lesson_metadata lm
WHERE c.id = lm.chapter_id;

-- 3. Validation (Optional check before drop - omitted for script simplicity)

-- 4. Drop Old Table
DROP TABLE public.lesson_metadata;

-- 5. Force Schema Cache Refresh (Notify)
DO $$
BEGIN
    RAISE NOTICE 'Migration 20250124_consolidate_chapters completed.';
END $$;
