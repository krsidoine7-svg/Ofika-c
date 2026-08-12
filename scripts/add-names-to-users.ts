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
    console.log('🚀 Ajout des colonnes first_name et last_name à la table users...');
    await sql.unsafe(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS first_name text,
      ADD COLUMN IF NOT EXISTS last_name text;

      -- Mise à jour des utilisateurs existants pour extraire first_name et last_name depuis name
      UPDATE public.users
      SET 
        first_name = CASE 
          WHEN array_length(string_to_array(name, ' '), 1) > 1 THEN 
            array_to_string((string_to_array(name, ' '))[1:array_length(string_to_array(name, ' '), 1)-1], ' ')
          ELSE name 
        END,
        last_name = CASE 
          WHEN array_length(string_to_array(name, ' '), 1) > 1 THEN 
            (string_to_array(name, ' '))[array_length(string_to_array(name, ' '), 1)]
          ELSE '' 
        END
      WHERE first_name IS NULL AND last_name IS NULL AND name IS NOT NULL;
    `);
    console.log('✅ Colonnes ajoutées et migrées avec succès dans la table users !');
  } catch (error) {
    console.error('❌ Échec:', error);
  } finally {
    await sql.end();
  }
}

run();
