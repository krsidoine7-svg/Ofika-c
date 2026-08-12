import { config } from 'dotenv';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' });

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ ERREUR: DATABASE_URL est introuvable dans .env.local');
    process.exit(1);
  }

  const sqlFile = path.join(process.cwd(), 'supabase/migrations/20260810_add_first_last_name.sql');
  const sqlQuery = fs.readFileSync(sqlFile, 'utf8');

  console.log('🔌 Connexion à la base de données...');
  const sql = postgres(dbUrl, { ssl: 'require' });

  try {
    console.log('🚀 Application de la migration en cours...');
    await sql.unsafe(sqlQuery);
    console.log('✅ Migration appliquée avec succès ! Les colonnes first_name et last_name sont prêtes.');
  } catch (error) {
    console.error('❌ Échec de la migration:', error);
  } finally {
    await sql.end();
  }
}

run();
