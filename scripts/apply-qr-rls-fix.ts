import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

// Convert 6543 pooler port to 5432 or use prepare: false
const connectionString = process.env.DATABASE_URL.replace(':6543/', ':5432/');

console.log("🔌 Connecting to Supabase PostgreSQL...");

const sql = postgres(connectionString, {
  ssl: 'require',
  prepare: false,
  connect_timeout: 10
});

async function run() {
  try {
    // 1. Drop old policies
    await sql`DROP POLICY IF EXISTS "Public can read active redirects for redirection" ON public.qr_redirects;`;
    await sql`DROP POLICY IF EXISTS "Anyone can read active redirects" ON public.qr_redirects;`;
    
    // 2. Create updated RLS policy allowing public read of active non-deleted redirects
    await sql`
      CREATE POLICY "Public can read active redirects for redirection"
      ON public.qr_redirects FOR SELECT
      USING (
        is_active = true 
        AND (deleted_at IS NULL)
      );
    `;

    console.log("🎉 SUCCESS: RLS policy for qr_redirects successfully applied to Supabase database via DATABASE_URL!");
  } catch (error) {
    console.error("❌ Database Migration Error:", error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
