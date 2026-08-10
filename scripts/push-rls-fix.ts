import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: '.env.local' })

// Parse arguments
const password = process.argv[2]
if (!password) {
  console.error('\n❌ Erreur : Vous devez fournir le mot de passe de votre base de données Supabase.')
  console.error('👉 Utilisation : npx tsx scripts/push-rls-fix.ts <VOTRE_MOT_DE_PASSE_DB>\n')
  process.exit(1)
}

// Extract project reference from URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) {
  console.error('❌ Erreur : NEXT_PUBLIC_SUPABASE_URL est manquant dans .env.local')
  process.exit(1)
}
const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

// Connection string (direct connection to Postgres via IPv4 or IPv6 depending on network)
// Since Supabase deprecated direct IPv4 connections, it's safer to ask for the Transaction pooler string,
// but for simple DDL we can try the default host. The user can also provide the full URL.
let connectionString = ''
if (password.startsWith('postgres://') || password.startsWith('postgresql://')) {
    connectionString = password
} else {
    connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?sslmode=require`
    // Note: Pooler connection string might vary. If this fails, we will tell the user to provide the full connection string.
}

async function main() {
  console.log('🔄 Connexion à la base de données Supabase...')
  
  const sql = postgres(connectionString, { max: 1 })
  
  try {
    // 1. Lire le fichier SQL
    const sqlFilePath = path.join(process.cwd(), '.gemini', 'antigravity-ide', 'brain', 'c2068c61-7111-4c89-9ddd-7ccb0b10107d', 'pricing-rls-fix.sql')
    
    // Si on ne trouve pas le fichier généré, on utilise les requêtes en dur
    let sqlContent = ''
    try {
        sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    } catch(e) {
        // Fallback
        sqlContent = `
            DROP POLICY IF EXISTS "Only admins can update pricing config" ON pricing_config;
            DROP POLICY IF EXISTS "Only admins can insert pricing config" ON pricing_config;

            CREATE POLICY "Admins and SuperAdmins can update pricing config" 
            ON pricing_config FOR UPDATE 
            USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'super_admin')));

            CREATE POLICY "Admins and SuperAdmins can insert pricing config" 
            ON pricing_config FOR INSERT 
            WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role IN ('admin', 'super_admin')));
        `
    }

    console.log('🚀 Exécution du script SQL de mise à jour RLS...')
    
    // Execute raw SQL
    await sql.unsafe(sqlContent)

    console.log('✅ Succès : Les politiques RLS ont été mises à jour !')
  } catch (error: any) {
    console.error('❌ Erreur SQL :', error.message || error)
    console.log('\n💡 Si l\'erreur est liée à la connexion, veuillez utiliser la chaîne de connexion Transaction complète :')
    console.log('npx tsx scripts/push-rls-fix.ts "postgresql://postgres.xxx:password@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"')
  } finally {
    await sql.end()
  }
}

main()
