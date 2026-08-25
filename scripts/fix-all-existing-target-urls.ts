import postgres from 'postgres';
import dotenv from 'dotenv';
import { normalizeToFullUrl } from '../lib/utils/qr-validation';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL.replace(':6543/', ':5432/');

const sql = postgres(connectionString, {
  ssl: 'require',
  prepare: false
});

async function run() {
  try {
    console.log("🔍 Fetching all records from public.qr_redirects...");
    const rows = await sql`SELECT id, short_code, target_url FROM public.qr_redirects;`;
    
    console.log(`Found ${rows.length} records in qr_redirects. Inspecting and normalizing target_url...`);
    let updatedCount = 0;

    for (const row of rows) {
      const rawTarget = row.target_url || '';
      const fullTarget = normalizeToFullUrl(rawTarget);

      if (rawTarget !== fullTarget) {
        console.log(`✏️ Updating [${row.short_code}]:`);
        console.log(`   Old target: "${rawTarget}" ➔ New: "${fullTarget}"`);

        await sql`
          UPDATE public.qr_redirects
          SET target_url = ${fullTarget},
              updated_at = NOW()
          WHERE id = ${row.id};
        `;
        updatedCount++;
      }
    }

    console.log(`\n🎉 Retroactive DB Migration Complete! Total updated records: ${updatedCount}/${rows.length}`);
  } catch (error) {
    console.error("❌ Migration Error:", error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
