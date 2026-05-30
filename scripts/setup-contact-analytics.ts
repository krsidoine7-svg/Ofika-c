#!/usr/bin/env tsx

/**
 * Script pour configurer la table contact_analytics
 * Usage: npx tsx scripts/setup-contact-analytics.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupContactAnalytics() {
  console.log('🚀 Configuration de la table contact_analytics...');

  try {
    // Lire le script SQL
    const sqlPath = join(process.cwd(), 'database', 'contact-analytics-table.sql');
    const sqlScript = readFileSync(sqlPath, 'utf8');

    // Exécuter le script
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });

    if (error) {
      console.error('❌ Erreur lors de l\'exécution du script SQL:', error);
      process.exit(1);
    }

    console.log('✅ Table contact_analytics créée avec succès!');
    console.log('📊 Fonctions analytics configurées');
    console.log('🔒 RLS policies appliquées');
    console.log('📈 Index de performance créés');

    // Vérifier que la table existe
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'contact_analytics');

    if (tableError) {
      console.error('❌ Erreur lors de la vérification:', tableError);
      process.exit(1);
    }

    if (tables && tables.length > 0) {
      console.log('✅ Table contact_analytics vérifiée');
    } else {
      console.error('❌ Table contact_analytics non trouvée');
      process.exit(1);
    }

    console.log('\n🎉 Configuration terminée!');
    console.log('📱 Vous pouvez maintenant utiliser le module Add to Contacts');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
  }
}

// Fonction helper pour exécuter du SQL (si elle n'existe pas)
async function createExecSqlFunction() {
  const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
  
  if (error && error.message.includes('function exec_sql')) {
    console.log('🔧 Création de la fonction exec_sql...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;

    const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (funcError) {
      console.error('❌ Impossible de créer la fonction exec_sql:', funcError);
      console.log('💡 Exécutez manuellement le script SQL dans Supabase');
      process.exit(1);
    }
  }
}

// Exécuter le script
async function main() {
  await createExecSqlFunction();
  await setupContactAnalytics();
}

main().catch(console.error);
