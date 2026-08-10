# Référence API GeniusPay

Base URL : `https://geniuspay.ci/api/v1/merchant`
Doc officielle : https://geniuspay.ci/docs/api

## Authentification

Headers requis sur toutes les requêtes :

| Header | Description |
|---|---|
| `X-API-Key` | Clé publique (`pk_sandbox_...` ou `pk_live_...`) |
| `X-API-Secret` | Clé secrète (`sk_sandbox_...` ou `sk_live_...`) — jamais côté client |
| `Content-Type` | `application/json` |

## Endpoints

### POST /payments — Initier un paiement

**Body :**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `amount` | number | Oui | Montant en XOF (min: 200) |
| `currency` | string | Non | XOF / EUR / USD, défaut XOF |
| `payment_method` | string | Non | `wave`, `orange_money`, `mtn_money`, `moov_money`, `paystack`, `pawapay`, `card`. Si omis → page checkout GeniusPay (recommandé, meilleure conversion) |
| `gateway` | string | Non | Gateway explicite |
| `mmo_provider` | string | Non | Code fournisseur PawaPay (ex: `ORANGE_CIV`) |
| `description` | string | Non | Max 500 caractères |
| `customer.name` / `.email` / `.phone` / `.country` | string | Non | Infos client, `phone` au format international |
| `success_url` / `error_url` | string | Non | Redirections |
| `metadata` | object | Non | Données custom (ex: `order_id`) — renvoyées telles quelles dans la réponse et le webhook |

**Réponse 201 (mode direct, payment_method fourni) :**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "reference": "MTX-A1B2C3D4E5",
    "amount": 15000,
    "fees": 450,
    "net_amount": 14550,
    "status": "pending",
    "payment_url": "https://wave.com/...",
    "gateway": "wave",
    "environment": "sandbox",
    "metadata": { "order_id": "12345" }
  }
}
```

**Réponse 201 (mode checkout, payment_method omis) :** renvoie `checkout_url` (page hébergée GeniusPay, expire après 24h) au lieu de `payment_url` direct.

### GET /payments — Lister les paiements

Query params : `status` (pending/completed/failed), `payment_method`, `from` (YYYY-MM-DD), `to`, `search`, `per_page` (défaut 20, max 100).

### GET /payments/{reference} — Récupérer un paiement

`reference` format `MTX-XXXXXXXXXX`. Réponse inclut `status`, `customer`, `metadata`, `created_at`, `completed_at`.
Erreur 404 : `TRANSACTION_NOT_FOUND`.

### GET /pawapay/providers?country=CI — Fournisseurs Mobile Money

Liste les opérateurs disponibles par pays (12 pays africains, 24 opérateurs). Si `country` omis → tous les pays.

### GET /account — Infos compte marchand

### GET /account/balance — Solde

Réponse : `available`, `pending`, `total`, `currency`.

### Webhooks — CRUD

| Action | Méthode | Endpoint |
|---|---|---|
| Lister | GET | `/webhooks` |
| Créer | POST | `/webhooks` — body `{ name, url, events: [] }`, renvoie `secret` (whsec_...) **une seule fois** |
| Modifier | PUT | `/webhooks/{id}` |
| Supprimer | DELETE | `/webhooks/{id}` |
| Tester | POST | `/webhooks/{id}/test` — envoie un event `webhook.test` |

## Événements webhook disponibles

`payment.initiated`, `payment.success`, `payment.failed`, `payment.cancelled`, `payment.refunded`, `payment.expired`, `cashout.requested`, `cashout.approved`, `cashout.completed`, `cashout.failed`, `webhook.test`

## Format du payload webhook

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "payment.success",
  "timestamp": 1735587600,
  "created_at": "2025-12-30T12:00:00.000000Z",
  "data": {
    "object": "transaction",
    "id": 12345,
    "reference": "TXN-2025-001",
    "amount": 10000.00,
    "currency": "XOF",
    "fees": 250.00,
    "net_amount": 9750.00,
    "status": "completed",
    "payment_method": "mobile_money",
    "provider": "wave",
    "customer_name": "Jean Kouassi",
    "customer_phone": "+2250748123456",
    "merchant_id": 25,
    "metadata": { "order_id": "ORD-2025-123" }
  },
  "environment": "live",
  "api_version": "2024-01-01"
}
```

## Headers reçus sur les webhooks

| Header | Description |
|---|---|
| `X-Webhook-Signature` | HMAC-SHA256 |
| `X-Webhook-Timestamp` | Timestamp Unix |
| `X-Webhook-Event` | Type d'événement |
| `X-Webhook-Delivery` | ID de livraison (optionnel) |
| `X-Webhook-Environment` | `sandbox` ou `live` |

**Formule de signature :** `HMAC-SHA256(timestamp + "." + raw_json_payload, webhook_secret)`, comparaison à temps constant. Rejeter aussi si `|now - timestamp| > 300s`.

## Statuts de paiement

`pending` → `processing` → `completed` | `failed` | `expired` | `cancelled` | `refunded`

## Codes d'erreur

| Code | HTTP | Description |
|---|---|---|
| `MISSING_API_KEY` | 401 | Clé API manquante |
| `INVALID_API_KEY` | 401 | Clé invalide/expirée |
| `MERCHANT_INACTIVE` | 403 | Compte désactivé |
| `PAYMENT_INIT_FAILED` | 400 | Échec init paiement |
| `TRANSACTION_NOT_FOUND` | 404 | Référence introuvable |
| `VALIDATION_ERROR` | 422 | Champ manquant/format invalide |
| `COUNTRY_NOT_SUPPORTED` | 404 | Pays non supporté par PawaPay |

Format générique d'erreur :
```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

## Moyens de paiement (Côte d'Ivoire)

Wave, Orange Money, MTN Mobile Money, Moov Money, Paystack (cartes), PawaPay (agrégateur multi-pays). Laisser `payment_method` vide pour la page de checkout avec choix (recommandé).

## Exemple cURL — initier un paiement (mode checkout)

```bash
curl -X POST https://geniuspay.ci/api/v1/merchant/payments \
  -H "X-API-Key: pk_sandbox_xxx" \
  -H "X-API-Secret: sk_sandbox_xxx" \
  -H "Content-Type: application/json" \
  -d '{"amount": 15000, "description": "Commande #123", "metadata": {"order_id": "123"}}'
```
