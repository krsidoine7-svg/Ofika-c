import { createAdminClient } from '../lib/supabase/service-role';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Charger .env.local
dotenv.config({ path: '.env.local' });

async function runMigration() {
    const migrationPath = process.argv[2];
    if (!migrationPath) {
        console.error('Veuillez spécifier le chemin de la migration');
        process.exit(1);
    }

    const fullPath = path.resolve(migrationPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`Fichier non trouvé: ${fullPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(fullPath, 'utf8');
    console.log(`Exécution de la migration: ${fullPath}`);
    
    // On splitte par point-virgule pour exécuter les commandes une par une si nécessaire,
    // ou on utilise une méthode capable d'exécuter du SQL brut via RPC si elle existe.
    // Malheureusement, le client JS ne permet pas d'exécuter du SQL brut directement
    // sauf via une fonction RPC 'exec_sql' qu'il faudrait avoir créée.
    
    // Alternativement, on peut essayer d'utiliser un driver pg direct
    console.log('Tentative d\'exécution via RPC ou Driver...');
    
    const supabase = createAdminClient();
    
    // On essaie d'appeler une fonction RPC générique pour le SQL si elle existe
    const { data, error } = await (supabase as any).rpc('exec_sql', { sql_query: sql });
    
    if (error) {
        console.error('Erreur lors de l\'exécution SQL via RPC:', error);
        console.log('Note: Assurez-vous d\'avoir une fonction RPC "exec_sql" définie dans Supabase.');
        process.exit(1);
    }
    
    console.log('Migration réussie !');
}

runMigration().catch(console.error);
