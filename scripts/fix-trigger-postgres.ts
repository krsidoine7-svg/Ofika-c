import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL manquante');
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function fix() {
  try {
    console.log('🚀 Connexion Directe PostgreSQL à Supabase...');
    const migrationFile = path.join(process.cwd(), 'supabase/migrations/20260809_fix_order_notifications_trigger.sql');
    const query = fs.readFileSync(migrationFile, 'utf8');

    console.log('⏳ Application du correctif de trigger SQL...');
    await sql.unsafe(query);
    console.log('✅ Trigger notify_on_order_status_change mis à jour avec succès dans Supabase !');
  } catch (err: any) {
    console.error('❌ Erreur lors de l\'exécution SQL :', err);
  } finally {
    await sql.end();
  }
}

fix();
