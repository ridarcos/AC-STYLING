
-- Revert: Remove lab_questions_es column
ALTER TABLE public.chapters
DROP COLUMN IF EXISTS lab_questions_es;
