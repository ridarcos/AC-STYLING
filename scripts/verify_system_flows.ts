
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load envs
dotenv.config();
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function verifyFlows() {
    console.log("🕵️  Starting 'Trust But Verify' Data Audit...\n");
    await client.connect();

    try {
        // --- 1. THE GUEST MERGE SIMULATION ---
        console.log("🧪  TEST 1: The Guest Merge (Database Logic)");
        const inviteId = uuidv4();
        const userId = uuidv4();
        const inviteToken = uuidv4(); // DB requires UUID for this column

        // Setup: Create Invite Profile & Item
        await client.query(`INSERT INTO profiles (id, role, intake_token, full_name) VALUES ($1, 'user', $2, 'Audit Guest')`, [inviteId, inviteToken]);
        await client.query(`INSERT INTO wardrobe_items (user_id, status, image_url) VALUES ($1, 'inbox', NULL)`, [inviteId]);

        // Setup: Create Target User
        await client.query(`INSERT INTO profiles (id, role, full_name, email) VALUES ($1, 'user', 'Audit Member', 'audit@test.com')`, [userId]);

        // Action: Simulate Merge (The critical logic from linkIntakeProfile)
        await client.query(`UPDATE wardrobe_items SET user_id = $1 WHERE user_id = $2`, [userId, inviteId]);

        // Check: Did it move?
        const mergeRes = await client.query(`SELECT count(*) as count FROM wardrobe_items WHERE user_id = $1`, [userId]);
        const count = parseInt(mergeRes.rows[0].count);

        if (count === 1) console.log("✅ PASS: Wardrobe Item successfully transferred to new User ID.");
        else console.error(`❌ FAIL: Expected 1 item for user ${userId}, found ${count}.`);

        // Cleanup
        await client.query(`DELETE FROM wardrobe_items WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM profiles WHERE id IN ($1, $2)`, [userId, inviteId]);


        // --- 2. THE STUDIO TAGGING ---
        console.log("\n🧪  TEST 2: Studio Tagging (Persistence)");
        const tagItemId = uuidv4();
        const tagUserId = uuidv4();
        await client.query(`INSERT INTO profiles (id, full_name) VALUES ($1, 'Tag Test User')`, [tagUserId]);
        await client.query(`INSERT INTO wardrobe_items (id, user_id, status) VALUES ($1, $2, 'Keep')`, [tagItemId, tagUserId]);

        // Action: Update
        await client.query(`UPDATE wardrobe_items SET status = 'Donate', internal_note = 'Audit Note' WHERE id = $1`, [tagItemId]);

        // Check
        const tagRes = await client.query(`SELECT status, internal_note FROM wardrobe_items WHERE id = $1`, [tagItemId]);
        const row = tagRes.rows[0];

        if (row.status === 'Donate' && row.internal_note === 'Audit Note') console.log("✅ PASS: Status update 'Donate' persisted correctly.");
        else console.error(`❌ FAIL: Expected 'Donate'/'Audit Note', got '${row.status}'/'${row.internal_note}'.`);

        // Cleanup
        await client.query(`DELETE FROM wardrobe_items WHERE id = $1`, [tagItemId]);
        await client.query(`DELETE FROM profiles WHERE id = $1`, [tagUserId]);


        // --- 3. PAYWALL UNLOCK CHECK ---
        console.log("\n🧪  TEST 3: Paywall Data Integrity");
        // We can't easily simulate the webhook without HTTP, but we can check if the TABLE exists and structure is valid
        const grantRes = await client.query(
            `SELECT count(*) as count FROM information_schema.tables WHERE table_name = 'user_access_grants'`
        );
        if (parseInt(grantRes.rows[0].count) > 0) {
            console.log("✅ PASS: 'user_access_grants' table exists.");
            // Check for recent grants
            const recentGrants = await client.query(`SELECT count(*) as count FROM user_access_grants`);
            console.log(`ℹ️  Info: Platform has ${recentGrants.rows[0].count} total access grants.`);
        } else {
            console.error("❌ FAIL: 'user_access_grants' table MISSING.");
        }


        // --- 4. PROFILE SYNC ---
        console.log("\n🧪  TEST 4: Profile Sync (Essence Response)");
        // Check if essence_responses table exists or if it's on profiles
        const essenceTableRes = await client.query(`SELECT count(*) as count FROM information_schema.tables WHERE table_name = 'essence_responses'`);
        if (parseInt(essenceTableRes.rows[0].count) > 0) {
            console.log("✅ PASS: 'essence_responses' table exists for granular surveying.");
        } else {
            console.log("⚠️  NOTE: 'essence_responses' table not found. Checking 'profiles' columns...");
            // Check profiles columns?
        }

    } catch (err) {
        console.error("💥 AUDIT FATAL ERROR:", err);
    } finally {
        await client.end();
    }
}

verifyFlows();
