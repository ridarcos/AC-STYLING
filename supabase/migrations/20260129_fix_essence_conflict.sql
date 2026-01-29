-- Drop the previous index that used COALESCE expression
DROP INDEX IF EXISTS idx_essence_responses_uniqueness;

-- Create a standard unique index using NULLS NOT DISTINCT (Postgres 15+)
-- This ensures that (user_id, question_key, null, chapter_id) is treated as a unique conflict
CREATE UNIQUE INDEX idx_essence_responses_uniqueness_v2 
ON public.essence_responses (user_id, question_key, masterclass_id, chapter_id) 
NULLS NOT DISTINCT;
