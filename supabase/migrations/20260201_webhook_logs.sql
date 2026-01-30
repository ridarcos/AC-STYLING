-- Create a table to log webhook events for debugging
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    payload jsonb,
    status text,
    error_message text,
    processed_at timestamp with time zone DEFAULT now(),
    CONSTRAINT webhook_events_pkey PRIMARY KEY (id)
);
