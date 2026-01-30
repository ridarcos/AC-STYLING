
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'wardrobe_items'::regclass;
