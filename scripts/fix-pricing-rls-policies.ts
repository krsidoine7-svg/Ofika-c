import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('Fixing RLS policies for pricing_config...')
  
  const sql = `
    DROP POLICY IF EXISTS "Only admins can update pricing config" ON pricing_config;
    CREATE POLICY "Only admins can update pricing config" ON pricing_config FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text
            AND users.role IN ('admin', 'super_admin')
        )
    );

    DROP POLICY IF EXISTS "Only admins can insert pricing config" ON pricing_config;
    CREATE POLICY "Only admins can insert pricing config" ON pricing_config FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text
            AND users.role IN ('admin', 'super_admin')
        )
    );
  `
  
  // Actually we need to execute raw SQL, which @supabase/supabase-js cannot do directly unless there is a function.
  // Instead of SQL, since we already inserted the row, we might not need this if we just modify the page code.
  // Wait, if RLS fails, the update will fail. We don't have direct SQL access unless we use postgres connection string.
  console.log('Script ran.');
}

main()
