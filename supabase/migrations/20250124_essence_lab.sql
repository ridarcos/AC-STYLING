
-- Migration: Create Essence Lab Responses Table
-- Purpose: Store granular user answers for styling exercises with context tracking.

CREATE TABLE IF NOT EXISTS public.essence_responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    masterclass_id uuid REFERENCES public.masterclasses(id) ON DELETE CASCADE, -- Optional if global question, but usually required
    chapter_slug text, -- Useful to know where they answered it
    question_key text NOT NULL,
    answer_value jsonb NOT NULL DEFAULT '{}'::jsonb,
    context_metadata jsonb DEFAULT '{}'::jsonb, -- Store version, date, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint for Upserting: One answer per question per masterclass for a user
    -- (If they answer again, we update the existing row)
    UNIQUE(user_id, masterclass_id, question_key)
);

-- Enable RLS
ALTER TABLE public.essence_responses ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can view their own responses
CREATE POLICY "Users can view own essence responses"
ON public.essence_responses FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can insert/update their own responses
CREATE POLICY "Users can insert own essence responses"
ON public.essence_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own essence responses"
ON public.essence_responses FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Admins can view all (for "Client Dossier" feature)
CREATE POLICY "Admins can view all essence responses"
ON public.essence_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Indexes for performance
CREATE INDEX idx_essence_responses_user ON public.essence_responses(user_id);
CREATE INDEX idx_essence_responses_masterclass ON public.essence_responses(masterclass_id);
CREATE INDEX idx_essence_responses_lookup ON public.essence_responses(user_id, masterclass_id);

-- Trigger for Updated At
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_essence_response_update
    BEFORE UPDATE ON public.essence_responses
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DO $$
BEGIN
    RAISE NOTICE 'Migration 20250124_essence_lab completed.';
END $$;
