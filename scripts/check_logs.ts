
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vitrtidtvkdoghcwgxjl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdHJ0aWR0dmtkb2doY3dneGpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI2NDQyOCwiZXhwIjoyMDg0ODQwNDI4fQ.N-v-LqSDtS7w70iJwJcxizghpjAyhzO5RGVTSvOv31I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
    console.log("Checking Webhook Logs...");

    const { data: logs, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching logs:", error);
        return;
    }

    console.log(`Found ${logs.length} logs.`);
    logs.forEach(log => {
        console.log(`[${log.status}] ${log.event_type}: ${log.error_message || 'OK'}`);
    });
}

main();
