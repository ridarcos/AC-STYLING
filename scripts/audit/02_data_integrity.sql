
-- 1. Orphaned Wardrobe Items (Items with no valid user profile)
SELECT 
    COUNT(*) as orphaned_wardrobe_count,
    array_agg(w.id) as sample_orphaned_ids
FROM wardrobe_items w
LEFT JOIN profiles p ON w.user_id = p.id
WHERE p.id IS NULL;

-- 2. Orphaned Access Grants (Grants for users that don't exist)
SELECT 
    COUNT(*) as orphaned_grants_count
FROM user_access_grants g
LEFT JOIN profiles p ON g.user_id = p.id
WHERE p.id IS NULL;

-- 3. Duplicate Profiles (by Email - if email is stored in public profile, distinct email check)
-- Note: Profiles usually use auth.uid as PK, so duplicates are rare unless logic is flawed.
-- Checking for duplicate intake tokens instead.
SELECT 
    intake_token, 
    COUNT(*) 
FROM profiles 
WHERE intake_token IS NOT NULL 
GROUP BY intake_token 
HAVING COUNT(*) > 1;

-- 4. Verify Invite Profiles (Should be Anonymous/Unclaimed)
-- Checking if any 'invite' profiles made it to full accounts without clearing the token?
-- Start with basic profile stats.
SELECT 
    status, 
    role, 
    COUNT(*) 
FROM profiles 
GROUP BY status, role;
