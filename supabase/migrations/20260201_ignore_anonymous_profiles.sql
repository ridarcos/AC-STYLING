
-- Migration: Ignore Anonymous Users in Profile Creation
-- Date: 2026-02-01
-- Description: Updates handle_new_user trigger to skip profile creation for anonymous users.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- SKIP if the user is anonymous
  IF new.is_anonymous IS TRUE THEN
    RETURN new;
  END IF;

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
    FALSE, 
    '{"lookbook": false, "wardrobe": false}'::jsonb,
    FALSE,
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
