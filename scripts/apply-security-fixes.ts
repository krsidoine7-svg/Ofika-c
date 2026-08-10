import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Charger .env.local
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERREUR: DATABASE_URL est manquant dans .env.local");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function applyMigrations() {
  try {
    console.log("🚀 Connexion à la base de données réussie.");

    // 1. Lire et exécuter le premier fichier (Politiques RLS)
    const rlsFile = path.join(process.cwd(), 'supabase/migrations/20260808_fix_permissive_rls.sql');
    const rlsQuery = fs.readFileSync(rlsFile, 'utf8');
    
    console.log("⏳ Exécution de 20260808_fix_permissive_rls.sql...");
    await sql.unsafe(rlsQuery);
    console.log("✅ Politiques RLS corrigées avec succès !");

    // 2. Lire et exécuter le second fichier (Fonctions RPC)
    const rpcFile = path.join(process.cwd(), 'supabase/migrations/20260808_secure_rpc_functions.sql');
    const rpcQuery = fs.readFileSync(rpcFile, 'utf8');

    console.log("⏳ Exécution de 20260808_secure_rpc_functions.sql...");
    await sql.unsafe(rpcQuery);
    console.log("✅ Fonctions SECURITY DEFINER sécurisées avec succès !");

    console.log("🎉 Toutes les migrations de sécurité ont été appliquées avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution des migrations :", error);
  } finally {
    await sql.end();
  }
}

applyMigrations();
