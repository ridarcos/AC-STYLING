-- Remove invalid Zara links that cause Next.js image errors
DELETE FROM "public"."wardrobe_items"
WHERE "image_url" ILIKE '%static.zara.net%';
