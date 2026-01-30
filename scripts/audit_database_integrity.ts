
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

async function auditDatabase() {
    console.log("=== DB AUDIT START ===");

    // 1. Check for Orphaned Profiles (Profile exists, Auth user missing)
    // Note: We can't easily join auth.users in JS, so we fetch all and compare.
    const { data: profiles } = await supabase.from('profiles').select('id, email, status, active_studio_client');
    const { data: { users } } = await supabase.auth.admin.listUsers();

    const validUserIds = new Set(users.map(u => u.id));
    const orphanedProfiles = profiles?.filter(p => !validUserIds.has(p.id)) || [];

    console.log(`\n[Orphaned Profiles Check]`);
    if (orphanedProfiles.length > 0) {
        console.log(`FAIL: Found ${orphanedProfiles.length} orphaned profiles.`);
        orphanedProfiles.forEach(p => console.log(` - ID: ${p.id}, Email: ${p.email}`));
    } else {
        console.log("PASS: No orphaned profiles found.");
    }

    // 2. Check for Orphaned Studio Data (Item exists, Profile missing)
    const tablesToCheck = ['wardrobe_items', 'tailor_cards', 'lookbooks', 'user_access_grants'];
    const profileIds = new Set(profiles?.map(p => p.id));

    console.log(`\n[Referential Integrity Check]`);
    for (const table of tablesToCheck) {
        const { data: items } = await supabase.from(table).select('id, user_id');
        const orphans = items?.filter(i => !profileIds.has(i.user_id)) || [];
        if (orphans.length > 0) {
            console.log(`FAIL: Found ${orphans.length} orphaned rows in ${table}.`);
        } else {
            console.log(`PASS: ${table} integrity OK.`);
        }
    }

    // 3. Check for Unauthorized Studio Clients
    // "active_studio_client" should generally rely on purchases or explicit admin grants.
    // We check if anyone has "true" but no corresponding purchase/grant? 
    // This is business logic, but good to know.
    const studioClients = profiles?.filter(p => p.active_studio_client) || [];
    console.log(`\n[Studio Access Audit]`);
    console.log(`Found ${studioClients.length} active studio clients.`);
    studioClients.forEach(c => console.log(` - ${c.email} (Status: ${c.status})`));

    // 4. Check for Null Names in Profiles (The "Ghost" Bug Residue)
    const nullNames = profiles?.filter(p => !p.full_name && p.email); // Some ghosts had no email
    const trulyGhost = profiles?.filter(p => !p.full_name && !p.email);

    console.log(`\n[Ghost User Check]`);
    if (trulyGhost?.length > 0) console.log(`FAIL: Found ${trulyGhost.length} Profiles with NULL Name & Email.`);
    else console.log(`PASS: No heavy ghost profiles.`);

    if (nullNames?.length > 0) console.log(`WARN: Found ${nullNames.length} Profiles with Email but NULL Name.`);

    console.log("=== DB AUDIT END ===");
}

auditDatabase();
