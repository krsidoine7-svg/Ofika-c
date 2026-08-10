const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.graqvtzmefiwsafaubcw:sxu9oPeBJ5jfsA7r@aws-1-us-west-1.pooler.supabase.com:6543/postgres' });
async function run() {
    await client.connect();
    const res = await client.query("SELECT * FROM qr_redirects");
    console.log(res.rows);
    await client.end();
}
run().catch(console.error);
