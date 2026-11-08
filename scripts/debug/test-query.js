const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const orderId = 'b64ec3f8-6de0-41ac-8e22-438e315b9a48';
  const userId = '91eef59a-f448-4cfc-9a9c-fff6df07503e';
  
  const { data, error } = await supabase
    .from('orders')
    .select('id, user_id, total_amount, currency, payment_status, users!inner(name, email, phone)')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  console.log('Error:', error);
  console.log('Data:', data);
}

test();
