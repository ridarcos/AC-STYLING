
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

async function auditLocalization() {
    console.log("=== LOCALIZATION AUDIT START ===");

    // 1. Masterclasses
    const { data: mc, error: mcError } = await supabase.from('masterclasses').select('id, title, title_es');
    if (mcError) {
        console.error("Masterclasses Error:", mcError.message);
    } else {
        const missing = mc?.filter(i => !i.title_es) || [];
        console.log(`[Masterclasses] Total: ${mc?.length}, Missing Spanish Title: ${missing.length}`);
        if (missing.length > 0) console.log(" - IDs missing ES:", missing.map(i => i.id));
    }

    // 2. Chapters
    // Try to select localization columns. If they don't exist, this will error.
    const { data: ch, error: chError } = await supabase.from('chapters').select('id, title, title_es');
    if (chError) {
        console.error("Chapters Error (Columns might be missing?):", chError.message);
    } else {
        const missingCh = ch?.filter(i => !i.title_es) || [];
        console.log(`[Chapters] Total: ${ch?.length}, Missing Spanish Title: ${missingCh.length}`);
    }

    // 3. Services
    const { data: sv, error: svError } = await supabase.from('services').select('id, title, title_es');
    if (svError) {
        console.error("Services Error:", svError.message);
    } else {
        const missingSv = sv?.filter(i => !i.title_es) || [];
        console.log(`[Services] Total: ${sv?.length}, Missing Spanish Title: ${missingSv.length}`);
    }

    console.log("=== LOCALIZATION AUDIT END ===");
}

auditLocalization();
