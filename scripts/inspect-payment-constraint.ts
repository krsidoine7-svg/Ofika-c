import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL as string, { prepare: false });

async function check() {
  const res = await sql`
    SELECT pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'orders' AND c.conname = 'orders_payment_status_check';
  `;
  console.log('Definition of orders_payment_status_check constraint:', res);
  await sql.end();
}

check();
