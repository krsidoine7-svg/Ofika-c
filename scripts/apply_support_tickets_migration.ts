import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL is missing in .env.local')
  process.exit(1)
}

const sql = postgres(connectionString, { prepare: false })

async function run() {
  console.log('🚀 Application de la migration SQL pour support_tickets...')

  try {
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260902_create_support_tickets.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')

    // Séparer les requêtes SQL et exécuter individuellement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const stmt of statements) {
      await sql.unsafe(stmt)
    }

    console.log('✅ Migration SQL exécutée avec succès ! Tables support_tickets & ticket_messages créées.')
  } catch (err) {
    console.error('❌ Erreur lors de l\'exécution de la migration:', err)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

run()
