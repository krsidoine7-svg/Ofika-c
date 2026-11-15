import postgres from 'postgres'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.local') })

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { prepare: false })

async function check() {
  console.log("🔍 Vérification de la contrainte et des utilisateurs...")
  
  // 1. Check constraints on users table
  const constraints = await sql`
    SELECT conname, pg_get_constraintdef(c.oid) 
    FROM pg_constraint c 
    JOIN pg_class t ON c.conrelid = t.oid 
    WHERE t.relname = 'users' AND c.contype = 'c';
  `
  console.log("Contraintes CHECK sur users:", constraints)

  // 2. Check the created users
  const users = await sql`
    SELECT id, email, role FROM public.users 
    WHERE email IN ('admin.ofika@gmail.com', 'tech.ofika@gmail.com', 'krsidoine7@gmail.com');
  `
  console.log("Utilisateurs dans public.users:", users)

  await sql.end()
}

check().catch(err => {
  console.error(err)
  process.exit(1)
})
