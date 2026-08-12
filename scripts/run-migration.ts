import postgres from 'postgres';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL n'est pas défini dans .env.local");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260812_create_receipts_bucket.sql');
    const query = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Exécution de la migration...');
    await sql.unsafe(query);
    console.log('✅ Migration appliquée avec succès ! La colonne payment_reference a été ajoutée.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
