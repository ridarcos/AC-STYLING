ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived'));

-- Update existing profiles
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
