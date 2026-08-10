import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
const sql = postgres(process.env.DATABASE_URL!);
async function test() {
  const res = await sql`SELECT tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('profiles', 'orders')`;
  console.log(res);
  process.exit(0);
}
test();
