import { config } from 'dotenv'
config({ path: '.env.local' })
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL is missing in .env.local')
  process.exit(1)
}

const sql = postgres(connectionString, { prepare: false })

async function run() {
  console.log('🛠️ Adding RLS policy for profile owners to read analytics_events...')

  try {
    await sql`DROP POLICY IF EXISTS "Users can view own profile analytics" ON public.analytics_events;`
    await sql`
      CREATE POLICY "Users can view own profile analytics"
        ON public.analytics_events FOR SELECT
        TO public
        USING (
          (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = analytics_events.profile_id
            AND profiles.user_id::text = auth.uid()::text
          )
        );
    `
    console.log('✅ RLS Policy "Users can view own profile analytics" created successfully!')
  } catch (err) {
    console.error('❌ Error creating RLS policy:', err)
  } finally {
    await sql.end()
    process.exit(0)
  }
}

run()
