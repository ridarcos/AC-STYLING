
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let envVars: Record<string, string> = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, '');
            envVars[key] = value;
        }
    });
} catch (e) {
    console.error('Could not read .env.local', e);
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.log("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmins() {
    console.log("Checking Admin Users...");

    // 1. Get all profiles with role 'admin'
    const { data: admins, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, status')
        .eq('role', 'admin');

    if (error) {
        console.error("Error fetching admins:", error);
    } else {
        console.log(`Found ${admins?.length} admin profiles.`);
        admins?.forEach(a => console.log(`- ${a.full_name} (${a.email}) [Status: ${a.status}] ID: ${a.id}`));
    }

    // 2. Check auth users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error("Error fetching auth users:", authError);
    } else {
        console.log(`\nTotal Auth Users: ${users.length}`);
        users.forEach(u => {
            console.log(`User: ${u.email} | ID: ${u.id}`);
            console.log(`Metadata: ${JSON.stringify(u.user_metadata)}`);
            console.log('---');
        });
    }
}

checkAdmins();
