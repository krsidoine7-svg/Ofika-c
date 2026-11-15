import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import postgres from 'postgres'

async function check() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
  const indexes = await sql`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'profiles';
  `
  console.log('Profiles Indexes:', indexes)
  await sql.end()
}

check().catch(console.error)
