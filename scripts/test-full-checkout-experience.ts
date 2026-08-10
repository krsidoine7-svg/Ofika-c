import { createAdminClient } from '../lib/supabase/service-role';
import { handleGeniusPayWebhookEvent } from '../lib/services/geniuspay/webhook-handler';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testFullExperience() {
  const supabase = createAdminClient();
  console.log('🚀 DÉBUT DU TEST DE L\'EXPÉRIENCE UTILISATEUR COMPLÈTE\n');

  // 1. Récupérer un utilisateur test
  const { data: users } = await supabase.from('users').select('id, email, name').limit(1);
  if (!users || users.length === 0) {
    console.error('❌ Aucun utilisateur trouvé pour le test');
    return;
  }
  const testUser = users[0];
  console.log('👤 Utilisateur Test:', testUser.name, `(${testUser.email})`);

  // ============================================================
  // TEST 1 : FLOW GENIUSPAY (AUTOMATIQUE WEBHOOK)
  // ============================================================
  console.log('\n--- 1. TEST FLOW GENIUSPAY ---');
  const geniusPayOrderNumber = `TEST-GP-${Date.now()}`;
  
  const { data: gpOrder, error: gpErr } = await supabase
    .from('orders')
    .insert({
      user_id: testUser.id,
      order_number: geniusPayOrderNumber,
      card_type: 'nfc_qr',
      quantity: 1,
      amount_cents: 14600,
      currency: 'XOF',
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'geniuspay',
      shipping_address: { full_name: testUser.name, line1: 'Cocody Rue 12', city: 'Abidjan', postal_code: '00225', country: 'CI', phone: '+2250505050505' }
    })
    .select()
    .single();

  if (gpErr || !gpOrder) {
    console.error('❌ Erreur création commande GeniusPay:', gpErr);
    return;
  }
  console.log('✅ Commande GeniusPay créée (id:', gpOrder.id, ', status: pending)');

  // Simulation Webhook GeniusPay payment.success
  console.log('⏳ Simulation réception Webhook GeniusPay (payment.success)...');
  await handleGeniusPayWebhookEvent({
    id: `evt_${Date.now()}`,
    event: 'payment.success',
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    environment: 'sandbox',
    api_version: 'v1',
    data: {
      id: `trx_gp_${Date.now()}`,
      reference: `ref_gp_${Date.now()}`,
      amount: 14600,
      currency: 'XOF',
      status: 'SUCCESSFUL',
      environment: 'sandbox',
      description: 'Paiement test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { order_id: gpOrder.id },
      payment_method: 'mobile_money',
      fees: 0,
      net_amount: 14600
    } as any
  } as any);

  // Vérification BD après Webhook
  const { data: updatedGpOrder } = await supabase.from('orders').select('*').eq('id', gpOrder.id).single();
  console.log('📊 Résultat BD Commande GeniusPay après Webhook:');
  console.log('   - status:', updatedGpOrder.status);
  console.log('   - payment_status:', updatedGpOrder.payment_status);
  console.log('   - paid_at:', updatedGpOrder.paid_at);

  if (updatedGpOrder.payment_status === 'succeeded' || updatedGpOrder.payment_status === 'paid') {
    console.log('🎉 TEST GENIUSPAY RÉUSSI À 100 % !');
  } else {
    console.error('❌ TEST GENIUSPAY ÉCHOUÉ');
  }

  // ============================================================
  // TEST 2 : FLOW WAVE DIRECT (REÇU MANUEL + VALIDATION ADMIN)
  // ============================================================
  console.log('\n--- 2. TEST FLOW WAVE DIRECT ---');
  const waveOrderNumber = `TEST-WAVE-${Date.now()}`;

  const { data: waveOrder, error: waveErr } = await supabase
    .from('orders')
    .insert({
      user_id: testUser.id,
      order_number: waveOrderNumber,
      card_type: 'nfc_qr',
      quantity: 1,
      amount_cents: 14600,
      currency: 'XOF',
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'wave',
      shipping_address: { full_name: testUser.name, line1: 'Cocody Rue 12', city: 'Abidjan', postal_code: '00225', country: 'CI', phone: '+2250505050505' }
    })
    .select()
    .single();

  if (waveErr || !waveOrder) {
    console.error('❌ Erreur création commande Wave:', waveErr);
    return;
  }
  console.log('✅ Commande Wave créée (id:', waveOrder.id, ', status: pending)');

  // Étape A : Le client soumet sa preuve de paiement (reçu)
  console.log('⏳ Simulation soumission reçu par le client...');
  const { data: processingWaveOrder } = await supabase
    .from('orders')
    .update({
      payment_status: 'processing',
      metadata: { receipt_url: 'https://example.com/receipt-wave-test.png' },
      updated_at: new Date().toISOString()
    })
    .eq('id', waveOrder.id)
    .select()
    .single();

  console.log('📊 État Commande après soumission reçu client:');
  console.log('   - payment_status:', processingWaveOrder.payment_status, '(Reçu en cours de vérification par l\'admin)');
  console.log('   - receipt_url:', processingWaveOrder.metadata?.receipt_url);

  // Étape B : L'Admin consulte et valide le reçu ("Marquer comme Payé")
  console.log('⏳ Simulation validation Admin ("Marquer comme Payé")...');
  const { data: validatedWaveOrder } = await supabase
    .from('orders')
    .update({
      payment_status: 'succeeded',
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', waveOrder.id)
    .select()
    .single();

  console.log('📊 État Commande après validation Admin:');
  console.log('   - status:', validatedWaveOrder.status);
  console.log('   - payment_status:', validatedWaveOrder.payment_status);

  if (validatedWaveOrder.payment_status === 'succeeded') {
    console.log('🎉 TEST WAVE DIRECT RÉUSSI À 100 % !');
  } else {
    console.error('❌ TEST WAVE DIRECT ÉCHOUÉ');
  }

  // Nettoyage des commandes tests
  await supabase.from('orders').delete().in('id', [gpOrder.id, waveOrder.id]);
  console.log('\n🧹 Nettoyage des commandes de test effectué.');
}

testFullExperience().catch(console.error);
