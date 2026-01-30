-- Migration: Prevent Unauthorized Wardrobe Creation
-- Date: 2026-02-01
-- Description: Adds a guardrail to ensure only active studio clients get a tailor card.

-- 1. Create the Trigger Function
CREATE OR REPLACE FUNCTION public.check_wardrobe_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is an active studio client
    -- We assume the 'profiles' table is the source of truth
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = NEW.user_id
        AND active_studio_client = TRUE
    ) THEN
        -- Block creation silently (return NULL cancels the insert in BEFORE trigger)
        -- This prevents errors in the signup flow if some legacy logic tries to create it.
        RETURN NULL; 
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind the Trigger
DROP TRIGGER IF EXISTS ensure_studio_access ON public.tailor_cards;

CREATE TRIGGER ensure_studio_access
BEFORE INSERT ON public.tailor_cards
FOR EACH ROW
EXECUTE PROCEDURE public.check_wardrobe_eligibility();

-- 3. Cleanup: Remove existing invalid cards (Data Hygiene)
-- Only remove cards for users who are strictly NOT active studio clients
DELETE FROM public.tailor_cards
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE active_studio_client IS NOT TRUE
);
