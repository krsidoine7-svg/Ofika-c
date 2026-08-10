import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL as string, { prepare: false });

async function check() {
  const res = await sql`
    SELECT pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'orders' AND c.conname = 'valid_shipping_address';
  `;
  console.log('Definition of valid_shipping_address constraint:', res);
  await sql.end();
}

check();
