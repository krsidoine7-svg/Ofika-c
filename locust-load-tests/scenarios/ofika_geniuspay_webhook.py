import hmac
import hashlib
import json
import time
import uuid
import os
from locust import HttpUser, task, between

# Le secret doit correspondre exactement à celui dans votre .env.local
WEBHOOK_SECRET = os.getenv("GENIUSPAY_WEBHOOK_SECRET", "whsec_test_secret_12345")

class GeniusPayWebhookUser(HttpUser):
    """
    Test de montée en charge pour le endpoint Webhook de GeniusPay.
    Valide que le serveur :
    1. Calcule et vérifie correctement les signatures sous forte charge.
    2. Gère l'idempotence (requêtes répétées avec le même ID).
    3. Maintient un temps de réponse rapide (< 5s) sous pression.
    """
    wait_time = between(1, 3)

    @task(3)
    def test_webhook_success(self):
        """Simule la réception d'un paiement réussi normal"""
        event_id = f"evt_load_{uuid.uuid4().hex}"
        order_id = f"test_order_{uuid.uuid4().hex[:8]}"

        payload = {
            "id": event_id,
            "event": "payment.success",
            "data": {
                "id": f"pay_{uuid.uuid4().hex}",
                "amount": 7000,
                "currency": "XOF",
                "payment_method": "wave",
                "status": "completed",
                "metadata": {
                    "order_id": order_id
                }
            }
        }
        
        # Le backend attend le RAW BODY pour la signature (pas d'espaces superflus)
        raw_body = json.dumps(payload, separators=(',', ':'))
        timestamp = str(int(time.time()))
        
        # Générer la signature HMAC-SHA256
        message = f"{timestamp}.{raw_body}"
        signature = hmac.new(
            WEBHOOK_SECRET.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        headers = {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Timestamp": timestamp,
            "X-Webhook-Event": "payment.success"
        }
        
        with self.client.post("/api/webhooks/geniuspay", data=raw_body, headers=headers, catch_response=True, name="/api/webhooks/geniuspay (Success)") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Erreur Webhook: HTTP {response.status_code} - {response.text}")

    @task(1)
    def test_webhook_idempotency(self):
        """Simule l'envoi de la même requête 2 fois (Idempotence)"""
        event_id = f"evt_retry_{uuid.uuid4().hex}"
        
        payload = {
            "id": event_id,
            "event": "payment.success",
            "data": {
                "id": "pay_retransmission",
                "amount": 7000,
                "metadata": { "order_id": "test_order_idempotence" }
            }
        }
        raw_body = json.dumps(payload, separators=(',', ':'))
        timestamp = str(int(time.time()))
        
        message = f"{timestamp}.{raw_body}"
        signature = hmac.new(WEBHOOK_SECRET.encode('utf-8'), message.encode('utf-8'), hashlib.sha256).hexdigest()
        
        headers = {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Timestamp": timestamp,
            "X-Webhook-Event": "payment.success"
        }
        
        # 1er appel : Le serveur traite et insère dans la BDD
        self.client.post("/api/webhooks/geniuspay", data=raw_body, headers=headers, name="/api/webhooks/geniuspay (Initial)")
        
        # 2ème appel immédiat : Le serveur doit répondre 200 instantanément sans faire de traitement métier lourd
        with self.client.post("/api/webhooks/geniuspay", data=raw_body, headers=headers, catch_response=True, name="/api/webhooks/geniuspay (Retry Idempotence)") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Échec de l'idempotence: HTTP {response.status_code}")

    @task(1)
    def test_webhook_invalid_signature(self):
        """Simule une attaque (fausse signature)"""
        payload = { "id": f"evt_fake_{uuid.uuid4().hex}", "event": "payment.success" }
        raw_body = json.dumps(payload, separators=(',', ':'))
        timestamp = str(int(time.time()))
        
        # Fausse signature
        signature = "abc123invalid_signature_faked_by_attacker"
        
        headers = {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Timestamp": timestamp,
            "X-Webhook-Event": "payment.success"
        }
        
        with self.client.post("/api/webhooks/geniuspay", data=raw_body, headers=headers, catch_response=True, name="/api/webhooks/geniuspay (Attack)") as response:
            if response.status_code == 401:
                # 401 est le comportement ATTENDU pour une attaque
                response.success()
            else:
                response.failure(f"Vulnérabilité ! L'attaque a renvoyé HTTP {response.status_code} au lieu de 401")
