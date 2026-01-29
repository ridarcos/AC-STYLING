-- Migration: Virtual Profiles & Warehouse Support
-- Date: 2026-01-28
-- Description: Decouples profiles from auth.users to allow "Managed" (Virtual) profiles and adds Warehouse/Cloning support.

-- 1. Drop the strict dependency between profiles and auth.users
-- This allows us to create profiles that don't have a login (Virtual Clients)
-- Note: We use conditional drop to be safe
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Update child tables to reference profiles(id) instead of auth.users(id)
-- This ensures that items created for a Virtual Client are linked to their Profile, not a non-existent User.

-- Tailor Cards
ALTER TABLE public.tailor_cards
DROP CONSTRAINT IF EXISTS tailor_cards_user_id_fkey,
ADD CONSTRAINT tailor_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Wardrobe Items
ALTER TABLE public.wardrobe_items
DROP CONSTRAINT IF EXISTS wardrobe_items_user_id_fkey,
ADD CONSTRAINT wardrobe_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Lookbooks
ALTER TABLE public.lookbooks
DROP CONSTRAINT IF EXISTS lookbooks_user_id_fkey,
ADD CONSTRAINT lookbooks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. RLS UPDATES (CRITICAL FOR INSERTING VIRTUAL PROFILES)
-- Allow Admins to insert ANY profile (violating the auth.uid() = id check which usually exists)

CREATE POLICY "Admins can insert any profile" 
ON public.profiles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete any profile" 
ON public.profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Add cloning functions for Warehouse Management

-- Function to clone a wardrobe item to another profile
CREATE OR REPLACE FUNCTION public.clone_wardrobe_item(
    item_id UUID,
    target_profile_id UUID
) RETURNS UUID AS $$
DECLARE
    new_item_id UUID;
BEGIN
    INSERT INTO public.wardrobe_items (
        user_id, image_url, category, client_note, internal_note, status, product_link_id, is_general_library
    )
    SELECT
        target_profile_id, -- New owner
        image_url,
        category,
        client_note,
        internal_note,
        'Keep', -- Default status for cloned items
        product_link_id,
        FALSE -- Cloned items are specific to the client, not general library (unless specified otherwise)
    FROM public.wardrobe_items
    WHERE id = item_id
    RETURNING id INTO new_item_id;

    RETURN new_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clone a lookbook AND its items to another profile
CREATE OR REPLACE FUNCTION public.clone_lookbook(
    lookbook_id UUID,
    target_profile_id UUID
) RETURNS UUID AS $$
DECLARE
    new_lookbook_id UUID;
    item_record RECORD;
    new_item_id UUID;
    original_item_owner UUID;
BEGIN
    -- 1. Get original lookbook owner to check if we need to clone items too
    SELECT user_id INTO original_item_owner FROM public.lookbooks WHERE id = lookbook_id;

    -- 2. Create the new lookbook
    INSERT INTO public.lookbooks (
        user_id, title, collection_name, status, metadata
    )
    SELECT
        target_profile_id,
        title || ' (Copy)',
        collection_name,
        'Draft', -- Reset to draft
        metadata
    FROM public.lookbooks
    WHERE id = lookbook_id
    RETURNING id INTO new_lookbook_id;

    -- 3. Clone items and link them
    -- We assume lookbooks largely consist of items we want to copy into the new user's wardrobe (e.g. from Warehouse)
    
    FOR item_record IN 
        SELECT li.item_id, li.position
        FROM public.lookbook_items li
        WHERE li.lookbook_id = lookbook_id
    LOOP
        -- Clone item to new user
        new_item_id := public.clone_wardrobe_item(item_record.item_id, target_profile_id);
        
        -- Link new item to new lookbook
        INSERT INTO public.lookbook_items (lookbook_id, item_id, position)
        VALUES (new_lookbook_id, new_item_id, item_record.position);
        
    END LOOP;

    RETURN new_lookbook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
