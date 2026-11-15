import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = (process.env.DATABASE_URL || '').replace(':6543/', ':5432/');
const sql = postgres(connectionString, { ssl: 'require', prepare: false });

async function run() {
  const configs = await sql`
    SELECT key, value 
    FROM system_config 
    WHERE key = 'payment_gateways';
  `;
  console.log("=== payment_gateways ===");
  console.log(JSON.stringify(configs[0]?.value, null, 2));

  process.exit(0);
}

run();
