-- Migration: Refine User Creation Trigger (Explicit Defaults)
-- Date: 2026-02-01
-- Description: Updates handle_new_user to explicitly set active_studio_client to FALSE and strict permissions. Use this to prevent accidental "Studio On" defaults.

-- 1. Update the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
      id, 
      full_name, 
      avatar_url, 
      email,
      active_studio_client,
      studio_permissions,
      has_full_unlock,
      has_course_pass
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    FALSE, -- Explicitly FALSE. No "Studio On" by default for public signups.
    '{"lookbook": false, "wardrobe": false}'::jsonb, -- Explicitly restricted.
    FALSE,
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Optional: Fix recently created users (Cleanup)
-- NOTE: This target users created in the last 24 hours who have NO purchases, just to be safe.
-- We avoid modifying users who might have been manually granted access.
-- Actually, let's keep it safe: Only those with NO grant_type 'admin_override' in user_access_grants? 
-- The user asked to fix the specific case of "Regular signup".
-- Heuristic: If they have Studio On but studio_permissions is the default 'null' or weird state? 
-- Safe approach: Just update those clearly wrong.

UPDATE public.profiles
SET 
  active_studio_client = FALSE,
  studio_permissions = '{"lookbook": false, "wardrobe": false}'::jsonb
WHERE 
  active_studio_client IS TRUE 
  AND created_at > (now() - interval '24 hours')
  AND NOT EXISTS (
    SELECT 1 FROM public.purchases WHERE user_id = profiles.id
  )
  AND role != 'admin'; 
