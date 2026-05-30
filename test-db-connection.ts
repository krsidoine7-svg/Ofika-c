import { testConnection, closeConnection } from './lib/db';

async function main() {
  console.log('🔍 Testing database connection...');

  const success = await testConnection();

  if (success) {
    console.log('✅ All good! Drizzle is connected to Supabase.');
  } else {
    console.log('❌ Connection failed. Check your DATABASE_URL in .env');
  }

  await closeConnection();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
