
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config'; // Load env if needed, though mostly using default local

async function runMigration() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("Usage: npx tsx scripts/db_client.ts <path_to_sql_file>");
        process.exit(1);
    }

    // Default Supabase Local DB credentials
    // Host: 127.0.0.1
    // Port: 54322 (Standard Supabase CLI local port)
    // User: postgres
    // Pass: postgres
    // DB: postgres
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log(`Connected to database at ${connectionString.split('@')[1]}`); // Mask auth

        const fullPath = path.resolve(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }

        const sql = fs.readFileSync(fullPath, 'utf-8');
        console.log(`Executing migration from: ${path.basename(filePath)}`);

        await client.query(sql);

        console.log("✅ Migration executed successfully.");
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
