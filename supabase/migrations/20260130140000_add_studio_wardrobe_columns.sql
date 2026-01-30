-- Add new columns for Studio Wardrobe management
ALTER TABLE "public"."wardrobe_items" 
ADD COLUMN IF NOT EXISTS "notes" text,
ADD COLUMN IF NOT EXISTS "brand" text,
ADD COLUMN IF NOT EXISTS "tags" text[];

-- Optional: Rename internal_note to notes if data conservation is needed, but we used 'notes' in new code.
-- Existing 'internal_note' data should probably be migrated manually if critical.
-- For now, we just add 'notes' as the primary field.
