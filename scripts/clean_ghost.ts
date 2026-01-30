
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

async function cleanGhosts() {
    const ghostId = 'af0a8edf-54af-48ab-b7e0-af044c26e99f';
    console.log(`Cleaning Ghost User: ${ghostId}`);

    // 1. Delete Profile
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', ghostId);
    if (profileError) console.error("Profile Delete Error:", profileError);
    else console.log("Profile deleted.");

    // 2. Delete Auth User
    const { error: authError } = await supabase.auth.admin.deleteUser(ghostId);
    if (authError) console.error("Auth Delete Error:", authError);
    else console.log("Auth User deleted.");
}

cleanGhosts();
