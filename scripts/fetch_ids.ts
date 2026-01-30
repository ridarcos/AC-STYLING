
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vitrtidtvkdoghcwgxjl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdHJ0aWR0dmtkb2doY3dneGpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI2NDQyOCwiZXhwIjoyMDg0ODQwNDI4fQ.N-v-LqSDtS7w70iJwJcxizghpjAyhzO5RGVTSvOv31I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
    console.log("Fetching IDs...");

    // 1. Get a User
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
        console.error("User Error:", userError);
        return;
    }
    const user = users.users[0];
    console.log("Found User ID:", user?.id);
    console.log("Found User Email:", user?.email);

    // 2. Get Masterclass Product ID
    const targetId = 'c766be07-de77-4353-8f1c-b59710423136';
    const { data: mc, error: mcError } = await supabase
        .from('masterclasses')
        .select('id, title, stripe_product_id')
        .eq('id', targetId)
        .single();

    if (mcError) {
        console.error("Masterclass Error:", mcError);
    } else {
        console.log("Found Masterclass:", mc.title);
        console.log("Stripe Product ID:", mc.stripe_product_id);
    }
}

main();
