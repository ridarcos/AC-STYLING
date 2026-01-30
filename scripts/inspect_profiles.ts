
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

async function inspectProfiles() {
    console.log("Fetching all profiles...");

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Total Profiles: ${profiles.length}`);
    profiles.forEach(p => {
        console.log(`ID: ${p.id}`);
        console.log(`Name: ${p.full_name || 'NULL'}`);
        console.log(`Email: ${p.email || 'NULL'}`);
        console.log(`Role: ${p.role}`);
        console.log(`Status: ${p.status}`);
        console.log(`Guest: ${p.is_guest}`);
        console.log(`Studio Active: ${p.active_studio_client}`);
        console.log(`Created At: ${p.created_at}`);
        console.log('---');
    });
}

inspectProfiles();
