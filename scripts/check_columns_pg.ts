import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const connectionString = (process.env.DATABASE_URL || '').replace(':6543/', ':5432/');
const sql = postgres(connectionString, { ssl: 'require', prepare: false });

async function run() {
  const scansCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'qr_scans';
  `;
  console.log("Columns of qr_scans:");
  scansCols.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

  const redirectsCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'qr_redirects';
  `;
  console.log("\nColumns of qr_redirects:");
  redirectsCols.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

  process.exit(0);
}

run();
