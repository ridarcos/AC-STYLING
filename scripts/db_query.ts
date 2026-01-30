
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env first
dotenv.config();

// Load .env.local and override
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function runQuery() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("Usage: npx tsx scripts/db_query.ts <path_to_sql_file>");
        process.exit(1);
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("❌ DATABASE_URL is missing from .env");
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        const fullPath = path.resolve(process.cwd(), filePath);
        const sql = fs.readFileSync(fullPath, 'utf-8');

        console.log(`🔍 Executing Query from: ${path.basename(filePath)}`);
        const res = await client.query(sql);

        if (Array.isArray(res)) {
            let output = '';
            res.forEach((r, i) => {
                output += `\n--- Result ${i + 1} (${r.command}) ---\n`;
                output += JSON.stringify(r.rows, null, 2);
            });
            fs.writeFileSync('query_output.txt', output);
        } else {
            fs.writeFileSync('query_output.txt', JSON.stringify(res.rows, null, 2));
        }
        console.log("✅ Results written to query_output.txt");

    } catch (err) {
        console.error("❌ Query Failed:", err);
    } finally {
        await client.end();
    }
}

runQuery();
