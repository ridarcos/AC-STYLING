-- Migration: Fix Access Inheritance Logic

CREATE OR REPLACE FUNCTION public.check_access(check_user_id uuid, check_object_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_has_full_unlock boolean;
    grant_exists boolean;
    parent_masterclass_id uuid;
BEGIN
    -- 1. Check if user has global full unlock
    SELECT has_full_unlock INTO user_has_full_unlock
    FROM public.profiles
    WHERE id = check_user_id;

    IF user_has_full_unlock THEN
        RETURN true;
    END IF;

    -- 2. Check for specific grant (Direct Ownership)
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_access_grants
        WHERE user_id = check_user_id
        AND (masterclass_id = check_object_id OR chapter_id = check_object_id)
    ) INTO grant_exists;

    IF grant_exists THEN
        RETURN true;
    END IF;

    -- 3. Check for Parent Masterclass Ownership (Inheritance)
    -- Try to find if this object_id is a chapter with a masterclass_id
    SELECT masterclass_id INTO parent_masterclass_id
    FROM public.chapters
    WHERE id = check_object_id;

    IF parent_masterclass_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1
            FROM public.user_access_grants
            WHERE user_id = check_user_id
            AND masterclass_id = parent_masterclass_id
        ) INTO grant_exists;

        IF grant_exists THEN
            RETURN true;
        END IF;
    END IF;

    RETURN false;
END;
$$;
