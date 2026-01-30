
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

async function checkGhost() {
    const ghostId = 'af0a8edf-54af-48ab-b7e0-af044c26e99f';
    console.log(`Checking Auth User for ID: ${ghostId}`);

    const { data: { user }, error } = await supabase.auth.admin.getUserById(ghostId);

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("User Found:");
        console.log(`Email: ${user?.email}`);
        console.log(`Is Anonymous: ${user?.is_anonymous}`);
        console.log(`Metadata:`, user?.user_metadata);
        console.log(`Created At: ${user?.created_at}`);
    }
}

checkGhost();
