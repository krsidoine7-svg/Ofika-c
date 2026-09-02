const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function addMissingColumns() {
  console.log("🛠️ Inspection et mise à jour de la table qr_scans...");

  // Exécuter des requêtes d'ajout de colonnes si absentes
  const columnsToAdd = [
    { name: 'country', type: 'TEXT' },
    { name: 'city', type: 'TEXT' },
    { name: 'device_type', type: 'TEXT' },
    { name: 'os', type: 'TEXT' },
    { name: 'browser', type: 'TEXT' },
    { name: 'referrer', type: 'TEXT' },
    { name: 'scanned_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' }
  ];

  for (const col of columnsToAdd) {
    try {
      // Tester une insertion temporaire ou vérifier la colonne
      const { error } = await supabase.rpc('exec_sql', { sql: `ALTER TABLE public.qr_scans ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};` });
      if (error) {
        console.warn(`Note sur ${col.name}: ${error.message}`);
      } else {
        console.log(`✅ Colonne ${col.name} vérifiée/ajoutée.`);
      }
    } catch (e) {
      console.warn(`Exception sur ${col.name}:`, e.message);
    }
  }

  // Vérifier la structure finale
  const { data } = await supabase.from('qr_scans').select('*').limit(1);
  console.log("\n📊 Colonnes actuelles dans qr_scans:", data.length > 0 ? Object.keys(data[0]) : "Structure mise à jour");
  process.exit(0);
}

addMissingColumns().catch(err => {
  console.error("Erreur:", err);
  process.exit(1);
});
