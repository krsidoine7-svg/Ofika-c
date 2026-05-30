### Guide d’utilisation Lygos – étape par étape

## Prérequis

- **Compte Lygos** avec clé API active.
- **Supabase** opérationnel avec table `orders` incluant `shipping_address` (JSONB).
- **App URL** configurée (ex: `http://localhost:3000` en dev, votre domaine en prod).

## Variables d’environnement

- `LYGOS_API_KEY` ou `NEXT_PUBLIC_LYGOS_API_KEY`: clé API Lygos (côté serveur préférée).
- `NEXT_PUBLIC_APP_URL`: URL publique de l’app (utilisée pour `success_url`/`failure_url`/webhooks).
- (Optionnel) `LYGOS_WEBHOOK_SECRET`: secret pour signature webhook Lygos (prod).

## Architecture – fichiers clés

- Création paiement (server): `app/api/payments/lygos/create/route.ts`
- Client API Lygos (client→server): `lib/services/lygos-api.ts`
- Services commandes/paiements: `lib/services/payments.ts`
- Webhook Lygos (server): `app/api/webhooks/lygos/route.ts`
- Vérification secondaire (server): `app/api/payments/verify/[orderId]/route.ts`
- UI redirection/état paiement: `app/payment/redirect/[orderId]/page.tsx`, `app/payment/verify/[orderId]/page.tsx`
- Flow de commande UI: `components/card-ordering/CardOrderingFlow.tsx`

## Flux global

1) L’utilisateur passe la commande via `CardOrderingFlow` → création en DB → génération du lien de paiement.

2) L’API server crée le paiement Lygos (`/api/payments/lygos/create`) et renvoie `payment_url`.

3) L’utilisateur est redirigé vers Lygos, paie, puis revient via `success_url`.

4) Webhook Lygos appelle `POST /api/webhooks/lygos` pour confirmer le paiement → mise à jour commande + notifications.

5) Vérification secondaire possible via `GET /api/payments/verify/[orderId]`.

## Étape 1 — Créer une commande depuis l’UI

- Fichier: `components/card-ordering/CardOrderingFlow.tsx`
- Actions:
  - Sélection carte NFC existante.
  - Saisie infos livraison (validées).
  - Appel `useOrderProcess().processOrder()` → `lib/services/payments.ts#createOrder`.

## Étape 2 — Générer un lien de paiement Lygos

- `lib/services/payments.ts#generateLygosPaymentUrl(orderId)`
  - Charge la commande, prépare `LygosPaymentData` (amount/currency/description/metadata.order_id).
  - Appelle `lib/services/lygos-api.ts#createLygosPayment` → route server `/api/payments/lygos/create`.
- `app/api/payments/lygos/create/route.ts`
  - Valide l’auth utilisateur.
  - Construit la requête Lygos officielle vers `https://api.lygosapp.com/v1/gateway`:
    - `amount`, `shop_name: "Ofika"`, `message` (description), `success_url`, `failure_url`, `order_id`.
  - En-tête: `api-key: <LYGOS_API_KEY>`.
  - Réponse: `{ id, link, ... }` → renvoyée sous `{ payment_id, payment_url }` et stockée sur la commande.

## Étape 3 — Redirection & statut visuel

- L’UI redirige vers `/payment/redirect/[orderId]`, puis vers la page de vérification `/payment/verify/[orderId]`.
- L’utilisateur voit l’état et actions disponibles (payer, réessayer, etc.).

## Étape 4 — Webhook Lygos (confirmation automatique)

- Fichier: `app/api/webhooks/lygos/route.ts` (POST)
- Reçoit payload Lygos `{ payment_id, status, order_id, amount, currency, ... }`.
- (Prod) Vérifie la signature `x-lygos-signature` si `LYGOS_WEBHOOK_SECRET` défini.
- Met à jour la commande: `paid`/`failed`/`cancelled`.
- Envoie email de confirmation et webhook Make.com (tag `PAYMENT_COMPLETED`).

## Étape 5 — Vérification secondaire (backup)

- Route: `app/api/payments/verify/[orderId]/route.ts`
- Sert à re-vérifier le paiement auprès de Lygos si le webhook n’est pas arrivé.
- Utilise `lib/services/lygos-api.ts#getLygosPaymentStatus` puis mappe vers statut local.

## Exemple – Créer un paiement (depuis votre app)

- Appel côté client déjà encapsulé par `useOrderProcess()`.
- Pour tester la route server manuellement (via HTTP):
```
POST /api/payments/lygos/create
Content-Type: application/json

{
  "amount": 15000,
  "currency": "XOF",
  "description": "Commande carte Ofika - nfc_qr",
  "metadata": { "order_id": "<ORDER_UUID>" }
}
```


Réponse attendue:

```
{
  "success": true,
  "data": {
    "payment_id": "<LYGOS_ID>",
    "payment_url": "https://pay.lygosapp.com/checkout/<LYGOS_ID>",
    "status": "created"
  }
}
```

## Exemple – Payload Webhook Lygos

Envoi par Lygos vers `POST /api/webhooks/lygos`:

```
{
  "payment_id": "<LYGOS_ID>",
  "status": "success", // ou failed/cancelled
  "order_id": "<ORDER_UUID>",
  "amount": 15000,
  "currency": "XOF",
  "timestamp": "2025-10-02T21:42:03Z"
}
```

Header possible: `x-lygos-signature: <hmac>`

## Intégration Make.com (sortant)

- Envoi côté serveur via `WebhookService.sendSimpleWebhook(tag, data, userId, email)` → `app/api/webhooks/make/route.ts`.
- Événements utilisés: `PHYSICAL_CARD_ORDERED`, `PAYMENT_COMPLETED`.

## Développement local

- Assurez `NEXT_PUBLIC_APP_URL` correct (ex: `http://localhost:3000`).
- Pour tests webhook depuis Lygos, exposez en public (ngrok) ou utilisez la vérification secondaire.
- Logs détaillés visibles dans la console du serveur.

## Dépannage (erreurs fréquentes)

- 404 Lygos: endpoint incorrect (`/gateway`) ou champs requis manquants.
- 401 Lygos: clé API manquante/incorrecte (`api-key`).
- CSP navigateur: toujours passer par l’API Route Next (aucun appel Lygos direct côté client).
- Webhook non reçu: utilisez la route de vérification secondaire.

## Sécurité

- Clé API uniquement côté serveur (ne pas exposer publiquement).
- Vérifier la signature webhook en prod (`LYGOS_WEBHOOK_SECRET`).
- Journaliser les événements critiques (paiements, webhooks) via `lib/logger.ts`.

## Extension

- Ajouter d’autres statuts ou providers: mappez leurs statuts vers `Order.status`.
- Ajouter des emails/notifications supplémentaires via `lib/services/email-notifications.ts`.
- Suivi analytics: enrichir `Order`, ajouter dashboards.