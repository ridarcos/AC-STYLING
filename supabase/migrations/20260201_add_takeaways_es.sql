-- Add missing takeaways_es column to chapters table
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS takeaways_es jsonb DEFAULT '[]'::jsonb;
