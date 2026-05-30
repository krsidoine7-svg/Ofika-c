import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL as string, { ssl: 'require' });

async function main() {
  try {
    const query = fs.readFileSync('supabase/migrations/20250307_migrate_nfc_profiles_to_cards.sql', 'utf8');
    await sql.unsafe(query);
    console.log('Migration successfully executed.');
  } catch (error: any) {
    console.error('Migration failed:');
    console.error(error.message);
  } finally {
    await sql.end();
  }
}

main();
