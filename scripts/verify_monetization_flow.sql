
-- 1. SETUP: Create Dummy Data
DO $$
DECLARE
    dummy_user_id uuid := '00000000-0000-0000-0000-000000000001';
    dummy_mc_id uuid := '00000000-0000-0000-0000-000000000002';
    stripe_prod_id text := 'prod_TEST_123';
BEGIN
    -- Create dummy user if not exists (handling auth schema constraints usually tricky, so we rely on mocking the ID check in the function if possible, or we insert into auth.users if we have permissions.
    -- Ideally, we test the logic function directly assuming the user exists or using a real user ID from the DB if known.
    -- For safety in this script, we will just test the TABLES and ACCESS FUNCTION logic by inserting into public tables.
    
    -- Insert Dummy Masterclass
    INSERT INTO public.masterclasses (id, title, stripe_product_id)
    VALUES (dummy_mc_id, 'Test Masterclass', stripe_prod_id)
    ON CONFLICT (id) DO NOTHING;

    -- 2. TEST LOCKED: Clean grants
    DELETE FROM public.user_access_grants WHERE user_id = dummy_user_id;
    UPDATE public.profiles SET has_full_unlock = false WHERE id = dummy_user_id;

    -- ASSERT LOCKED
    IF (SELECT public.check_access(dummy_user_id, dummy_mc_id)) THEN
        RAISE EXCEPTION 'Test Failed: User should be LOCKED';
    ELSE
        RAISE NOTICE 'Test Passed: User is initially Locked';
    END IF;

    -- 3. TEST PURCHASE: Insert Grant
    INSERT INTO public.user_access_grants (user_id, masterclass_id, grant_type)
    VALUES (dummy_user_id, dummy_mc_id, 'purchase');

    -- ASSERT UNLOCKED
    IF (SELECT public.check_access(dummy_user_id, dummy_mc_id)) THEN
        RAISE NOTICE 'Test Passed: User is UNLOCKED after grant';
    ELSE
        RAISE EXCEPTION 'Test Failed: User should be UNLOCKED';
    END IF;

    -- 4. CLEANUP
    DELETE FROM public.user_access_grants WHERE user_id = dummy_user_id;
    DELETE FROM public.masterclasses WHERE id = dummy_mc_id;
    
    RAISE NOTICE 'ALL TESTS PASSED SUCCESSFULLY';
END $$;
