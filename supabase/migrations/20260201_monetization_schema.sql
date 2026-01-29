-- Migration: Monetization System (Paywalls & Access Control)

-- 1. Update Masterclasses Table
ALTER TABLE public.masterclasses
ADD COLUMN IF NOT EXISTS stripe_product_id text,
ADD COLUMN IF NOT EXISTS price_id text;

-- 2. Update Chapters Table (for standalone Courses)
ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS stripe_product_id text,
ADD COLUMN IF NOT EXISTS price_id text;

-- 3. Update Profiles Table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_full_unlock boolean DEFAULT false;

-- 4. Create User Access Grants Table
-- This table decouples "ownership" from "purchase history", allowing for bonuses, ease of management, etc.
CREATE TABLE IF NOT EXISTS public.user_access_grants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    masterclass_id uuid REFERENCES public.masterclasses(id) ON DELETE CASCADE,
    chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
    granted_at timestamp with time zone DEFAULT now(),
    grant_type text DEFAULT 'purchase' CHECK (grant_type IN ('purchase', 'bonus', 'admin_override')),
    
    -- Ensure either masterclass_id or chapter_id is set, but not both (or both if designing differently, but usually one grant per object)
    -- Simpler constraint: just ensure at least one is not null
    CONSTRAINT valid_grant_target CHECK (masterclass_id IS NOT NULL OR chapter_id IS NOT NULL)
);

-- RLS for Access Grants
ALTER TABLE public.user_access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own grants"
    ON public.user_access_grants
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage grants"
    ON public.user_access_grants
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 5. Create Check Access Function
CREATE OR REPLACE FUNCTION public.check_access(check_user_id uuid, check_object_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_has_full_unlock boolean;
    grant_exists boolean;
BEGIN
    -- 1. Check if user has global full unlock
    SELECT has_full_unlock INTO user_has_full_unlock
    FROM public.profiles
    WHERE id = check_user_id;

    IF user_has_full_unlock THEN
        RETURN true;
    END IF;

    -- 2. Check for specific grant
    -- We check both masterclass_id and chapter_id columns for the object_id
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_access_grants
        WHERE user_id = check_user_id
        AND (masterclass_id = check_object_id OR chapter_id = check_object_id)
    ) INTO grant_exists;

    RETURN grant_exists;
END;
$$;
