const crypto = require('crypto');

// Configuration
const WEBHOOK_SECRET = process.env.GENIUSPAY_WEBHOOK_SECRET || 'test_secret';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:8000/api/webhooks/geniuspay';
const ORDER_ID = process.argv[2] || 'test_order_id';

if (!ORDER_ID) {
  console.log("Usage: node test-geniuspay-webhook.js <order_id>");
  process.exit(1);
}

// Payload de test
const payload = {
  id: `evt_${Date.now()}`,
  event: "payment.success",
  timestamp: new Date().toISOString(),
  created_at: new Date().toISOString(),
  environment: "sandbox",
  api_version: "1.0",
  data: {
    id: `txn_${Date.now()}`,
    reference: `ref_${Date.now()}`,
    amount: 15000,
    currency: "XOF",
    fees: 150,
    net_amount: 14850,
    status: "completed",
    payment_method: "mobile_money",
    payment_provider: "wave_ci",
    environment: "sandbox",
    customer: {
      name: "Test User",
      email: "test@example.com",
      phone: "+22500000000"
    },
    metadata: {
      order_id: ORDER_ID
    },
    created_at: new Date().toISOString()
  }
};

const rawBody = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000).toString();
const payloadToSign = `${timestamp}.${rawBody}`;
const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payloadToSign).digest('hex');

console.log(`Envoi du webhook de test pour la commande ${ORDER_ID}...`);
console.log(`URL: ${WEBHOOK_URL}`);
console.log(`Timestamp: ${timestamp}`);
console.log(`Signature: ${signature}`);

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': signature,
    'X-Webhook-Timestamp': timestamp
  },
  body: rawBody
})
.then(async (res) => {
  const text = await res.text();
  console.log(`\nStatus: ${res.status}`);
  console.log(`Body: ${text}`);
})
.catch(err => {
  console.error('\nErreur:', err.message);
});
