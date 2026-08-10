import { createAdminClient } from '../lib/supabase/service-role';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testUpdate() {
  const supabase = createAdminClient();

  // 1. Récupérer la dernière commande
  const { data: orders, error: fetchErr } = await supabase
    .from('orders')
    .select('id, status, payment_status, shipping_status, user_id')
    .limit(1);

  if (fetchErr || !orders || orders.length === 0) {
    console.error('Aucune commande trouvée pour le test:', fetchErr);
    return;
  }

  const targetOrder = orders[0];
  console.log('Commande ciblée pour le test:', targetOrder);

  // 2. Tenter la mise à jour de statut (Simule ce que fait /api/admin/orders PATCH)
  const { data: updateRes, error: updateErr } = await supabase
    .from('orders')
    .update({
      payment_status: 'succeeded',
      status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', targetOrder.id)
    .select('*')
    .single();

  console.log('--- RÉSULTAT DE LA MISE À JOUR ---');
  console.log('Error:', updateErr);
  console.log('Updated Order:', updateRes);
}

testUpdate();
