-- Migration: Add Course Pass support
-- Date: 2026-02-01

-- 1. Add has_course_pass to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_course_pass boolean DEFAULT false;

-- 2. Update Access Control Function
CREATE OR REPLACE FUNCTION public.check_access(check_user_id uuid, check_object_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_profile public.profiles%ROWTYPE;
    is_admin boolean;
    has_full_unlock boolean;
    has_course_pass boolean;
    is_standalone_course boolean;
BEGIN
    -- 1. Fetch User Profile
    SELECT * INTO user_profile FROM public.profiles WHERE id = check_user_id;
    
    -- If no profile, deny (unless anon logic handled elsewhere, but UUID implies auth)
    IF user_profile IS NULL THEN
        RETURN false;
    END IF;

    -- 2. Global Overrides
    IF user_profile.role = 'admin' THEN
        RETURN true;
    END IF;

    IF user_profile.has_full_unlock THEN
        RETURN true;
    END IF;

    -- 3. Course Pass Logic
    -- Check if object is a standalone course (chapter with is_standalone = true)
    IF user_profile.has_course_pass THEN
        SELECT EXISTS (
            SELECT 1 FROM public.chapters 
            WHERE id = check_object_id 
            AND is_standalone = true
        ) INTO is_standalone_course;

        IF is_standalone_course THEN
            RETURN true;
        END IF;
    END IF;

    -- 4. Direct Grant Check (Purchases, Bonus, etc.)
    -- Check specific grant for this object
    IF EXISTS (
        SELECT 1 FROM public.user_access_grants
        WHERE user_id = check_user_id
        AND (
            masterclass_id = check_object_id 
            OR chapter_id = check_object_id
        )
    ) THEN
        RETURN true;
    END IF;

    -- 5. Parent Masterclass check (if checking a chapter, check its parent)
    -- If checking a chapter, also check if user has access to the masterclass
    IF EXISTS (
        SELECT 1 FROM public.chapters c
        JOIN public.user_access_grants g ON g.masterclass_id = c.masterclass_id
        WHERE c.id = check_object_id
        AND g.user_id = check_user_id
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;
