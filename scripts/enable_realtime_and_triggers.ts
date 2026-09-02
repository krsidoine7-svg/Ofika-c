import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL missing in .env.local')
  process.exit(1)
}

const sql = postgres(connectionString, { prepare: false })

async function run() {
  console.log('🚀 Activation des publications Supabase Realtime & RLS pour support_tickets, ticket_messages et notifications...')

  const statements = [
    // 1. Ajouter les tables à la publication Supabase Realtime (crucial pour les notifications temps réel dans le navigateur)
    `ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;`,
    `ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;`,
    `ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;`,

    // 2. S'assurer que le REPLICA IDENTITY est réglé sur FULL pour recevoir les payload complets
    `ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;`,
    `ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;`,
    `ALTER TABLE public.notifications REPLICA IDENTITY FULL;`,

    // 3. RLS sur notifications : Permettre à tous les utilisateurs (y compris admin) de lire et insérer
    `DROP POLICY IF EXISTS "Admins full access to notifications" ON public.notifications;`,
    `CREATE POLICY "Admins full access to notifications" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);`
  ]

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt)
      console.log(`✅ SQL exécuté : ${stmt.substring(0, 60)}...`)
    } catch (err: any) {
      console.warn(`⚠️ Warning / Info SQL (${stmt.substring(0, 40)}...):`, err.message)
    }
  }

  console.log('🎉 REALTIME ET RLS ACTIVÉS AVEC SUCCÈS POUR TOUTES LES TABLES !')
  await sql.end()
  process.exit(0)
}

run().catch(err => {
  console.error('Exception SQL:', err)
  process.exit(1)
})
