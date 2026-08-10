import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL manquante dans .env.local');
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function main() {
  try {
    console.log('🔍 Inspection approfondie des triggers et colonnes de public.orders...');

    // 1. Inspecter le type de la colonne user_id dans orders
    const orderCols = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `;
    console.log('--- COLONNES DE TABLE orders ---');
    console.log(orderCols);

    // 2. Inspecter TOUS les triggers sur public.orders
    const triggers = await sql`
      SELECT trigger_name, event_manipulation, action_statement, action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'orders';
    `;
    console.log('--- TRIGGERS SUR TABLE orders ---');
    console.log(triggers);

    // 3. Inspecter la définition de TOUTES les fonctions de trigger sur orders
    const triggerFunctions = await sql`
      SELECT proname, prosrc 
      FROM pg_proc 
      WHERE proname LIKE '%order%';
    `;
    console.log('--- FONCTIONS TRIGGERS SIMILAIRES ---');
    for (const f of triggerFunctions) {
      console.log(`\n=== FONCTION: ${f.proname} ===`);
      console.log(f.prosrc);
    }

  } catch (err: any) {
    console.error('❌ Erreur lors de l\'inspection :', err);
  } finally {
    await sql.end();
  }
}

main();
