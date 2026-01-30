
-- 1. Clean up Webhook Logs (Safe to delete all)
TRUNCATE TABLE webhook_events;

-- 2. Clean up Purchases and Grants
-- Note: This deletes ALL purchases and grants. 
-- If you want to keep the Admin's purchase history, uncomment the WHERE clause and replace the ID.

DELETE FROM purchases
-- WHERE user_id != 'YOUR_ADMIN_ID_HERE'
;

DELETE FROM user_access_grants
-- WHERE user_id != 'YOUR_ADMIN_ID_HERE'
;

DELETE FROM user_progress
-- WHERE user_id != 'YOUR_ADMIN_ID_HERE'
;

-- 3. Clean up orphaned profiles (if any users were deleted but profiles remain)
-- Only run this if you are sure you want to remove profiles not in auth.users
DELETE FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- 4. Clean up Studio/Wardrobe items for deleted users
DELETE FROM wardrobe_items
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM lookbooks
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM tailor_cards
WHERE user_id NOT IN (SELECT id FROM auth.users);
