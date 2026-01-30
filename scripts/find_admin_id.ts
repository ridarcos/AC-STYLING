
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

async function findUser() {
    const email = 'magomezf94@gmail.com';
    console.log(`Looking for user: ${email}`);

    // Note: listUsers() returns pages. If we have few users, this is fine.
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error:", error);
        return;
    }

    const target = users.find(u => u.email === email);
    if (target) {
        console.log(`FOUND_USER_ID: ${target.id}`);
        console.log(`Full Name from Meta: ${target.user_metadata?.full_name}`);
    } else {
        console.log("User not found in Auth list.");
    }
}

findUser();
