
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

async function restoreAdmin() {
    const adminId = '29e2f390-5d88-4e6b-89da-b2e2d5ce26e7';
    console.log(`Restoring Admin Profile for ID: ${adminId}`);

    // 1. Check if profile exists (active or archived)
    const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminId)
        .single();

    if (existing) {
        console.log("Profile found:", existing);
        console.log("Updating to Active Admin...");
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                role: 'admin',
                status: 'active',
                full_name: 'Manuel Angel Gomez' // Ensure name is set
            })
            .eq('id', adminId);

        if (updateError) console.error("Update failed:", updateError);
        else console.log("Profile updated successfully.");
    } else {
        console.log("Profile MISSING. Creating new Admin Profile...");
        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: adminId,
                full_name: 'Manuel Angel Gomez',
                role: 'admin',
                status: 'active',
                avatar_url: "https://lh3.googleusercontent.com/a/ACg8ocJk6LySwwgXSn27vGVz1viRM7qs3uacF4AmAfZIl65lyVcuJQ=s96-c" // From logs
            });

        if (insertError) console.error("Insert failed:", insertError);
        else console.log("Profile created successfully.");
    }
}

restoreAdmin();
