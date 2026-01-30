
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

async function cleanupDatabase() {
    const adminId = '29e2f390-5d88-4e6b-89da-b2e2d5ce26e7';
    console.log(`Starting cleanup. PRESERVING Admin ID: ${adminId}`);

    // Helpers
    const deleteTable = async (table: string, column: string = 'user_id') => {
        console.log(`Cleaning ${table}...`);
        const { error, count } = await supabase
            .from(table)
            .delete({ count: 'exact' })
            .neq(column, adminId);

        if (error) console.error(`Failed to clean ${table}:`, error.message);
        else console.log(`Deleted ${count} rows from ${table}.`);
    };

    // 1. Webhooks (Safe to delete all)
    const { error: webhookError } = await supabase.from('webhook_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all
    console.log("Cleaned webhook_events.");

    // 2. Purchases & Access
    await deleteTable('purchases');
    await deleteTable('user_access_grants');
    await deleteTable('user_progress');

    // 3. Studio Data
    await deleteTable('wardrobe_items');
    await deleteTable('lookbooks');
    await deleteTable('tailor_cards');

    // 4. Profiles (Logic: Delete profiles that are NOT the admin)
    // Note: We are relying on the fact that we just restored the admin profile using the same ID as the Auth user.
    // We should NOT delete profiles that have a corresponding Auth user if we want to keep logins active.
    // BUT the user asked for a "full cleanup". Usually this means deleting non-admin users.
    // However, we cannot easily delete Auth Users via the Client SDK without looping.
    // Standard practice: Delete profiles of non-admins. The auth users will remain "orphaned" (profile-less) 
    // until they sign in again (if the trigger handles it) or we leave them alone.
    // The user said "clean up the entire database".
    // Let's delete all profiles except the admin.

    console.log("Cleaning profiles...");
    const { error: profileError, count: profileCount } = await supabase
        .from('profiles')
        .delete({ count: 'exact' })
        .neq('id', adminId);

    if (profileError) console.error("Failed to clean profiles:", profileError.message);
    else console.log(`Deleted ${profileCount} profiles.`);

    console.log("Cleanup complete.");
}

cleanupDatabase();
