-- Drop the restrictive constraint
ALTER TABLE wardrobe_items DROP CONSTRAINT IF EXISTS wardrobe_items_status_check;

-- Re-add with 'inbox' and lowercase variants for safety
ALTER TABLE wardrobe_items ADD CONSTRAINT wardrobe_items_status_check
CHECK (status IN (
    'Keep', 'Tailor', 'Donate', 'Archive',  -- Legacy / PascalCase
    'inbox',                                -- New "Unprocessed" state
    'keep', 'tailor', 'donate', 'archive'   -- Lowercase variants just in case
));
