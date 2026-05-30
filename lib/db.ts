// =====================================================
// DRIZZLE ORM DATABASE CONNECTION
// Connexion à la base de données Supabase via Drizzle
// Utilise postgres-js (recommandé pour Supabase)
// =====================================================

// Charger les variables d'environnement depuis .env
import { config } from "dotenv";
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";

// Récupérer DATABASE_URL (peut être undefined pendant le build)
const connectionString = process.env.DATABASE_URL;

// Créer le client postgres-js seulement si DATABASE_URL existe
// Cela permet de build sans DATABASE_URL (pour CI/CD par exemple)
let client: ReturnType<typeof postgres> | null = null;

if (connectionString) {
  // Note: prepare: false est requis pour Supabase Transaction pool mode
  client = postgres(connectionString, {
    prepare: false, // Désactive les prepared statements (requis pour Supabase)
    max: 10, // Nombre maximum de connexions
    idle_timeout: 20, // Timeout en secondes
    connect_timeout: 10, // Timeout de connexion
  });
}

// Créer l'instance Drizzle avec le schéma
// Si pas de connexion, les requêtes échoueront au runtime (pas au build)
export const db = client ? drizzle(client, { schema }) : null as any;

// Export du client pour des requêtes SQL raw si nécessaire
export { client };

// Fonction helper pour fermer la connexion (utile pour les tests)
export async function closeConnection() {
  if (!client) {
    throw new Error("Database client not initialized. DATABASE_URL is missing.");
  }
  await client.end();
}

// Fonction pour tester la connexion
export async function testConnection() {
  if (!client) {
    console.error("❌ DATABASE_URL is not defined in .env.local");
    return false;
  }
  
  try {
    const result = await client`SELECT NOW()`;
    console.log("✅ Database connected at:", result[0].now);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Export du type DB pour l'auto-complétion
export type Database = typeof db;
