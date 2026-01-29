-- Migration: Fix Studio Access Defaults & Triggers (Corrected)
-- Date: 2026-02-01

-- 0. Ensure active_studio_client column exists (Must run first)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_studio_client BOOLEAN DEFAULT FALSE;

-- 1. Fix Defaults for Studio Permissions
ALTER TABLE public.profiles 
ALTER COLUMN studio_permissions SET DEFAULT '{"lookbook": false, "wardrobe": false}'::jsonb;

-- 2. Retroactive Cleanup: If active_studio_client is FALSE, revoke permissions.
UPDATE public.profiles
SET studio_permissions = '{"lookbook": false, "wardrobe": false}'::jsonb
WHERE active_studio_client = false AND role != 'admin';

-- 3. Update the Purchase Trigger to toggle active_studio_client AND permissions
CREATE OR REPLACE FUNCTION public.handle_new_purchase()
RETURNS TRIGGER AS $$
DECLARE
    service_unlocks BOOLEAN;
BEGIN
    -- Check if service unlocks studio
    SELECT unlocks_studio_access INTO service_unlocks
    FROM public.services
    WHERE price_id = NEW.product_id
    LIMIT 1;

    IF service_unlocks = TRUE THEN
        -- Update Profile: Enable Flag AND Permissions
        UPDATE public.profiles
        SET 
            active_studio_client = TRUE,
            studio_permissions = jsonb_set(
                jsonb_set(
                    COALESCE(studio_permissions, '{}'::jsonb),
                    '{lookbook}', 'true'
                ),
                '{wardrobe}', 'true'
            )
        WHERE id = NEW.user_id;

        -- Optionally, we could create an empty "Tailor Card" here if one doesn't exist
        INSERT INTO public.tailor_cards (user_id)
        VALUES (NEW.user_id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
