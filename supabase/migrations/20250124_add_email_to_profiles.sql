
-- Migration: Add email to profiles
-- Purpose: Ensure we can identify users even if full_name is missing.

-- 1. Add Email Column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Backfill from auth.users (Requires access to auth schema)
-- Note: We use a secure function or direct SQL if permissions allow. 
-- In Supabase SQL Editor this works. Via migrations it usually works if roles are correct.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 3. Update the handle_new_user trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. (Optional) Create trigger to sync email changes if user updates auth email
-- For simplicity, skipping complex update triggers for now, 
-- but ideally we'd watch auth.users updates too.
