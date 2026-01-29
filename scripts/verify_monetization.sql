-- Verification string for Monetization

BEGIN;

-- 1. Check Columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'masterclasses' AND column_name = 'stripe_product_id') THEN
        RAISE EXCEPTION 'Missing stripe_product_id in masterclasses';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'has_full_unlock') THEN
        RAISE EXCEPTION 'Missing has_full_unlock in profiles';
    END IF;
    RAISE NOTICE 'Schema columns verified.';
END $$;

-- 2. Mock Data & Logic Test
DO $$
DECLARE
    test_user_id uuid;
    test_mc_id uuid;
    can_access boolean;
BEGIN
    -- Create mock user
    INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'test_monetization@example.com') RETURNING id INTO test_user_id;
    INSERT INTO public.profiles (id, full_name) VALUES (test_user_id, 'Test User');

    -- Create mock masterclass
    INSERT INTO public.masterclasses (title) VALUES ('Test Masterclass') RETURNING id INTO test_mc_id;

    -- Case 1: No Access
    SELECT public.check_access(test_user_id, test_mc_id) INTO can_access;
    IF can_access THEN RAISE EXCEPTION 'FAIL: Access granted but should be denied'; END IF;

    -- Case 2: Specific Grant
    INSERT INTO public.user_access_grants (user_id, masterclass_id) VALUES (test_user_id, test_mc_id);
    SELECT public.check_access(test_user_id, test_mc_id) INTO can_access;
    IF NOT can_access THEN RAISE EXCEPTION 'FAIL: Access denied but should be granted (Grant)'; END IF;

    -- Case 3: Global Unlock (Clean up existing grant first to test this specifically?) 
    -- Actually check_access checks full_unlock first.
    UPDATE public.profiles SET has_full_unlock = true WHERE id = test_user_id;
    DELETE FROM public.user_access_grants WHERE user_id = test_user_id; 
    
    SELECT public.check_access(test_user_id, test_mc_id) INTO can_access;
    IF NOT can_access THEN RAISE EXCEPTION 'FAIL: Access denied but should be granted (Full Unlock)'; END IF;

    RAISE NOTICE 'Logic tests passed.';
    
    -- Cleanup (Rollback happens automatically if I don't commit, but usually explicit rollback is safer for testing scripts if ran manually)
    -- But here we ran in transaction
END $$;

ROLLBACK; -- Always roll back verification data
