import postgres from 'postgres'

const url1 = "postgresql://postgres:rviLBKnFz6A9PEEC@db.graqvtzmefiwsafaubcw.supabase.co:5432/postgres"
const url2 = "postgresql://postgres.graqvtzmefiwsafaubcw:sxu9oPeBJ5jfsA7r@aws-1-us-west-1.pooler.supabase.com:6543/postgres"

async function test(url: string, name: string) {
  try {
    const sql = postgres(url, { prepare: false, connect_timeout: 5 })
    const res = await sql`SELECT 1 as connected`
    console.log(`✅ ${name} connecté !`, res)
    await sql.end()
    return true
  } catch (e: any) {
    console.log(`❌ ${name} échoué:`, e.message)
    return false
  }
}

async function main() {
  await test(url1, "Direct db.graqvtzmefiwsafaubcw.supabase.co")
  await test(url2, "Pooler aws-1-us-west-1.pooler.supabase.com")
}

main()
