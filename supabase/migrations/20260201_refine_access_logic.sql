-- Migration: Refine Access Logic (Fix Inheritance)
-- Date: 2026-02-01

-- Update Access Control Function with explicit variable lookup for parent
CREATE OR REPLACE FUNCTION public.check_access(check_user_id uuid, check_object_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_profile public.profiles%ROWTYPE;
    is_standalone_course boolean;
    parent_masterclass_id uuid;
BEGIN
    -- 1. Fetch User Profile
    SELECT * INTO user_profile FROM public.profiles WHERE id = check_user_id;
    
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

    -- 3. Course Pass Logic (Standalone Only)
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

    -- 4. Direct Grant Check (Grant for THIS object)
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

    -- 5. Parent Masterclass Check (Inheritance)
    -- Explicitly get the masterclass_id of the chapter
    SELECT masterclass_id INTO parent_masterclass_id 
    FROM public.chapters 
    WHERE id = check_object_id;

    -- If the chapter has a parent masterclass, check if user has access to THAT masterclass
    IF parent_masterclass_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.user_access_grants
            WHERE user_id = check_user_id
            AND masterclass_id = parent_masterclass_id
        ) THEN
            RETURN true;
        END IF;
    END IF;

    RETURN false;
END;
$$;
