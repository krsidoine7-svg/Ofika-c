import { createAdminClient } from '../lib/supabase/service-role';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function checkColumn() {
    console.log('Vérification de la connexion Supabase...');
    const supabase = createAdminClient();
    
    // On essaie de récupérer un profil au hasard pour voir si la colonne est là
    const { data, error } = await supabase.from('profiles').select('id, suspension_reason').limit(5);
    
    if (error) {
        console.error('ERREUR SUPABASE:', error.code, error.message);
    } else {
        console.log('--- RÉSULTAT DU SELECT ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('--- FIN ---');
    }
}

checkColumn().catch(console.error);
