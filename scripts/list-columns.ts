import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { client, closeConnection } from '../lib/db';

async function checkSchema() {
    if (!client) {
        console.error('Client non initialisé');
        return;
    }
    
    console.log('Creating UPDATE policy on users table...');
    try {
        await client`DROP POLICY IF EXISTS users_update_own ON users`;
        await client`CREATE POLICY users_update_own ON users 
            FOR UPDATE 
            TO authenticated 
            USING ((auth.uid())::text = id)
            WITH CHECK ((auth.uid())::text = id)`;
        console.log('✅ Policy users_update_own created successfully.');
    } catch (e) {
        console.error('❌ Failed to create policy:', e);
    }
    
    await closeConnection();
}

checkSchema().catch(console.error);
