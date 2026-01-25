-- Migration: Fix lesson_metadata schema for persistence
-- 1. Ensure columns are JSONB
-- 2. Set checking constraints or defaults if missing
-- 3. Ensure UNIQUE constraint on chapter_id

-- 1. Alter columns to JSONB if they were TEXT (using casting)
-- We handle potential conversion errors by being explicit
ALTER TABLE public.lesson_metadata 
ALTER COLUMN lab_questions TYPE jsonb USING lab_questions::jsonb,
ALTER COLUMN lab_questions SET DEFAULT '[]'::jsonb;

ALTER TABLE public.lesson_metadata 
ALTER COLUMN takeaways TYPE jsonb USING takeaways::jsonb,
ALTER COLUMN takeaways SET DEFAULT '[]'::jsonb;

ALTER TABLE public.lesson_metadata 
ALTER COLUMN resource_urls TYPE jsonb USING resource_urls::jsonb,
ALTER COLUMN resource_urls SET DEFAULT '[]'::jsonb;

-- 2. Ensure Constraints
-- Ensure chapter_id is unique so we can efficiently UPSERT
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_metadata_chapter_id_key') THEN
        ALTER TABLE public.lesson_metadata ADD CONSTRAINT lesson_metadata_chapter_id_key UNIQUE (chapter_id);
    END IF;
END $$;

-- 3. Notify (Optional, just for verification log)
DO $$
BEGIN
    RAISE NOTICE 'Migration 20250124_fix_chapter_schema completed successfully.';
END $$;
