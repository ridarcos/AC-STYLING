-- Migration: Enhance Wardrobe Items Schema
-- Date: 2026-02-01
-- Description: Adds metadata columns for Studio curation (Tags, Brand, Notes) and standardizes Status.

-- 1. Add Columns
ALTER TABLE public.wardrobe_items
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS notes text, -- Private admin notes
ADD COLUMN IF NOT EXISTS status text DEFAULT 'inbox'; 

-- 2. Backfill existing items
-- Assume existing items without status are 'keep' (safe default) or 'inbox'? 
-- "Keep" is safer for existing user content so it doesn't disappear.
UPDATE public.wardrobe_items 
SET status = 'keep' 
WHERE status IS NULL OR status = 'Keep'; -- Handle previous capitalized string

-- 3. Create Index for Feed Performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_status_created 
ON public.wardrobe_items(status, created_at DESC);
