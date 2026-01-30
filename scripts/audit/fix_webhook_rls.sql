ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'webhook_events' AND policyname = 'Service Role Full Access'
    ) THEN
        CREATE POLICY "Service Role Full Access" ON webhook_events
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
