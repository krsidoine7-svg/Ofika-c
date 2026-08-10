import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERREUR: DATABASE_URL est manquant");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function applyMigrations() {
  try {
    console.log("🚀 Connexion à la base de données réussie.");

    const rlsFile = path.join(process.cwd(), 'supabase/migrations/20260808_unified_roles_jwt.sql');
    const rlsQuery = fs.readFileSync(rlsFile, 'utf8');
    
    console.log("⏳ Exécution de 20260808_unified_roles_jwt.sql...");
    await sql.unsafe(rlsQuery);
    console.log("✅ Migration RBAC appliquée avec succès !");

  } catch (error) {
    console.error("❌ Erreur lors de l'exécution :", error);
  } finally {
    await sql.end();
  }
}

applyMigrations();
