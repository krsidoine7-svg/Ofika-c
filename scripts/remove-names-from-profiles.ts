import { config } from 'dotenv';
import postgres from 'postgres';

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' });

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ ERREUR: DATABASE_URL est introuvable dans .env.local');
    process.exit(1);
  }

  console.log('🔌 Connexion à la base de données...');
  const sql = postgres(dbUrl, { ssl: 'require' });

  try {
    console.log('🚀 Suppression des colonnes first_name et last_name de la table profiles...');
    await sql.unsafe(`
      ALTER TABLE public.profiles 
      DROP COLUMN IF EXISTS first_name,
      DROP COLUMN IF EXISTS last_name;
    `);
    console.log('✅ Colonnes first_name et last_name supprimées avec succès de la table profiles !');
  } catch (error) {
    console.error('❌ Échec de la suppression:', error);
  } finally {
    await sql.end();
  }
}

run();
