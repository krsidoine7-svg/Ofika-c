const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://postgres.graqvtzmefiwsafaubcw:sxu9oPeBJ5jfsA7r@aws-1-us-west-1.pooler.supabase.com:6543/postgres' });

async function run() {
    await client.connect();
    const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'qr_redirects'");
    console.log("Columns:", cols.rows);

    const result = await client.query(`INSERT INTO qr_redirects (id, user_id, short_code, target_url, is_active, type) VALUES (gen_random_uuid(), 'e185bbf8-403e-48bc-b470-2131de261e99', '6uGBN8Kc', 'https://ofika.ci', true, 'NFC')`);
    console.log("Success:", result.rowCount);
    await client.end();
}
run().catch(console.error);
