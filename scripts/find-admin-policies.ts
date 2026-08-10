import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
const sql = postgres(process.env.DATABASE_URL!);
async function test() {
  const res = await sql`SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE qual LIKE '%admin_users%' OR with_check LIKE '%admin_users%'`;
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
test();
