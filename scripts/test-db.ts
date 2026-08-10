import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
const sql = postgres(process.env.DATABASE_URL!);
async function test() {
  const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name IN ('review_links', 'qr_redirects', 'reviews') AND column_name = 'user_id'`;
  console.log(res);
  process.exit(0);
}
test();
