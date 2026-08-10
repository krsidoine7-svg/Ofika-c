import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERREUR: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function resetPasswords() {
  try {
    console.log("🚀 Récupération de tous les utilisateurs...");
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    console.log(`✅ ${users.length} utilisateurs trouvés. Mise à jour en cours...`);

    let successCount = 0;
    for (const user of users) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: 'Admin!'
      });

      if (updateError) {
        console.error(`❌ Erreur pour l'utilisateur ${user.email}:`, updateError.message);
      } else {
        successCount++;
        console.log(`✅ Mot de passe mis à jour pour : ${user.email}`);
      }
    }

    console.log(`🎉 Terminé ! ${successCount}/${users.length} mots de passe ont été réinitialisés à "Admin!".`);
  } catch (error) {
    console.error("❌ Erreur fatale :", error);
  }
}

resetPasswords();
