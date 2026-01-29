-- Migration: Studio Access Logic (Happy Path & Manual Override)
-- Date: 2026-01-30
-- Description: Adds column to Services to flag "Access Granting" services, and a trigger on Purchases to auto-update user permissions.

-- 1. Add "Unlocks Studio Access" flag to Services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS unlocks_studio_access BOOLEAN DEFAULT FALSE;

-- 2. Create Trigger Function to Auto-Grant Access on Purchase
CREATE OR REPLACE FUNCTION public.handle_new_purchase()
RETURNS TRIGGER AS $$
DECLARE
    service_unlocks BOOLEAN;
BEGIN
    -- Check if the product purchased corresponds to a service that unlocks studio access
    -- We match purchases.product_id to services.price_id (Stripe Price ID)
    SELECT unlocks_studio_access INTO service_unlocks
    FROM public.services
    WHERE price_id = NEW.product_id
    LIMIT 1;

    -- If the service exists and unlocks access, update the user's profile
    IF service_unlocks = TRUE THEN
        UPDATE public.profiles
        SET studio_permissions = jsonb_set(
            COALESCE(studio_permissions, '{}'::jsonb),
            '{lookbook}', 'true'
        )
        WHERE id = NEW.user_id;

        UPDATE public.profiles
        SET studio_permissions = jsonb_set(
            COALESCE(studio_permissions, '{}'::jsonb),
            '{wardrobe}', 'true'
        )
        WHERE id = NEW.user_id;
        
        -- Alternatively, just set the whole object if you want to enforce specific defaults:
        -- SET studio_permissions = '{"lookbook": true, "wardrobe": true}'::jsonb
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger on Purchases table
DROP TRIGGER IF EXISTS on_purchase_created ON public.purchases;

CREATE TRIGGER on_purchase_created
AFTER INSERT ON public.purchases
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_purchase();
