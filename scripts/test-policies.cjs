const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.graqvtzmefiwsafaubcw:rviLBKnFz6A9PEEC@aws-1-us-west-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT grantee, privilege_type 
    FROM information_schema.role_table_grants 
    WHERE table_name = 'captured_contacts';
  `);
  console.log('GRANTS:', res.rows);

  const res2 = await client.query(`
    SELECT has_table_privilege('anon', 'captured_contacts', 'INSERT') as anon_can_insert,
           has_table_privilege('authenticated', 'captured_contacts', 'INSERT') as auth_can_insert;
  `);
  console.log('PRIVILEGES:', res2.rows);

  await client.end();
}
run().catch(console.error);
