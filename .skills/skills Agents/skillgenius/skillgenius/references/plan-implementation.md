# Plan d'implémentation — Intégration GeniusPay dans Ofika

> **Mode d'emploi de ce document**
> Ce fichier est conçu pour être donné à un éditeur de code assisté par IA (Cursor, Claude Code, Windsurf, etc.) travaillant **dans le projet Ofika existant**.
> Copie-colle **une étape à la fois**, dans l'ordre. Chaque étape contient une consigne d'analyse préalable, le code à générer, et un test de validation à faire avant de passer à l'étape suivante. Ne saute jamais une étape.
>
> Chaque étape commence par ce bloc à coller tel quel à l'IA :
> ```
> ÉTAPE X — [nom]
> 1. Analyse d'abord le projet existant selon les points listés.
> 2. Implémente uniquement ce qui est décrit dans cette étape (adapte les chemins de fichiers, la syntaxe et les conventions à la stack réelle détectée dans le projet).
> 3. Une fois le code en place, exécute/écris le test de validation indiqué.
> 4. Ne passe pas à l'étape suivante tant que le test n'est pas validé. Si un point n'est pas clair ou si une convention du projet contredit cette étape, arrête-toi et pose la question avant de continuer.
> ```

---

## 0. Objectif

Intégrer **GeniusPay** comme moyen de paiement dans Ofika, en mode **100 % automatique** :

- Le client initie un paiement → redirection vers une page de paiement (checkout GeniusPay ou gateway direct).
- GeniusPay notifie Ofika via **webhook** dès que le statut change (`payment.success`, `payment.failed`, etc.).
- Le webhook met à jour la base de données (statut de la commande) **sans aucune intervention manuelle**.
- Aucune confirmation humaine n'est nécessaire à aucune étape.

Base URL API : `https://geniuspay.ci/api/v1/merchant`
Documentation officielle : `https://geniuspay.ci/docs/api`

---

## 1. Architecture cible

```
Client Ofika
   │
   ▼
[Frontend] Bouton "Payer avec GeniusPay"
   │  (appelle le backend, jamais l'API GeniusPay directement)
   ▼
[Backend] POST /payments/geniuspay/initiate
   │  → appelle POST https://geniuspay.ci/api/v1/merchant/payments
   │  → sauvegarde la transaction en base (status = pending)
   ▼
Réponse : checkout_url (ou payment_url)
   │
   ▼
Client redirigé vers GeniusPay → paie avec Wave / Orange / MTN / Moov / carte
   │
   ▼
GeniusPay envoie un WEBHOOK → POST /webhooks/geniuspay (backend Ofika)
   │  → vérifie la signature HMAC
   │  → vérifie l'idempotence (id de l'event déjà traité ?)
   │  → met à jour la commande (paid / failed / refunded / cancelled)
   │  → répond 200 en moins de 5 secondes
   ▼
Client redirigé vers success_url ou error_url (affichage uniquement,
 la source de vérité reste le webhook, jamais la redirection)
```

**Principe de sécurité central : ne jamais faire confiance à la redirection `success_url` pour valider un paiement.** Seul le webhook (signature vérifiée) fait foi. La `success_url` sert uniquement à l'UX (afficher "merci pour votre commande").

---

## 2. Prérequis — variables d'environnement

```
GENIUSPAY_API_KEY=pk_sandbox_xxxxxxxx        # clé publique
GENIUSPAY_API_SECRET=sk_sandbox_xxxxxxxx     # clé secrète — jamais exposée côté client
GENIUSPAY_WEBHOOK_SECRET=whsec_sandbox_xxxxx # secret de signature du webhook (donné à la création du webhook)
GENIUSPAY_BASE_URL=https://geniuspay.ci/api/v1/merchant
GENIUSPAY_ENV=sandbox                        # sandbox | live
```

⚠️ Ne jamais commit ces valeurs. Utiliser `.env` + `.env.example` (avec des valeurs vides) + vérifier que `.env` est dans `.gitignore`.

---

## ÉTAPE 0 — Analyse initiale du projet

```
ÉTAPE 0 — Analyse initiale du projet
1. Analyse le projet existant :
   - Quel framework backend est utilisé (Express, Hono, Next.js API routes, Nest, autre) ?
   - Quel ORM/DB (Drizzle, Prisma, Supabase client direct, autre) ?
   - Existe-t-il déjà un système de "commandes"/"transactions"/"paiements" en base ? Quel est son schéma ?
   - Existe-t-il déjà un pattern d'intégration de moyen de paiement (ex: CinetPay, Paystack, Wave) dont on peut copier la structure de dossiers ?
   - Où sont gérées les variables d'environnement (fichier .env, config centralisée type src/config) ?
2. Restitue un court résumé de ces points avant de passer à l'étape 1.
3. Ne modifie aucun fichier à cette étape — c'est une étape de lecture seule.
```

**Test de validation** : l'IA doit produire un résumé texte de la stack + du schéma de données existant. Valider ce résumé manuellement avant de continuer.

---

## ÉTAPE 1 — Schéma de base de données

```
ÉTAPE 1 — Schéma de base de données
1. Analyse la table des commandes/transactions existante (si elle existe) pour éviter la duplication.
2. Crée une migration ajoutant/complétant :
   a. Sur la table des paiements/commandes existante (ou une nouvelle table `payments` si aucune n'existe) :
      - payment_provider (string) — ex: "geniuspay"
      - payment_reference (string, unique, nullable) — la "reference" GeniusPay (format MTX-XXXXXXXXXX)
      - payment_method (string, nullable) — wave / orange_money / mtn_money / card / etc.
      - payment_status (enum/string) — pending | processing | completed | failed | expired | cancelled | refunded
      - amount (number)
      - currency (string, défaut "XOF")
      - fees (number, nullable)
      - net_amount (number, nullable)
      - metadata (json, nullable)
      - paid_at (timestamp, nullable)
   b. Une nouvelle table `geniuspay_webhook_events` pour l'idempotence :
      - id (uuid ou string, correspond au champ `id` du payload webhook GeniusPay) — clé unique
      - event_type (string) — ex: payment.success
      - payload (json) — payload brut reçu
      - processed_at (timestamp, nullable)
      - received_at (timestamp, défaut now)
3. Applique la migration.
```

**Test de validation** : exécuter la migration en local, vérifier que les deux tables/colonnes existent bien via un client DB ou l'ORM.

---

## ÉTAPE 2 — Types / interfaces GeniusPay

```
ÉTAPE 2 — Types / interfaces
1. Crée un fichier dédié aux types GeniusPay (ex: `src/lib/payments/geniuspay/types.ts`, adapte le chemin aux conventions du projet).
2. Définis les interfaces suivantes (TypeScript, ou équivalent dans le langage du projet) :
   - GeniusPayCustomer { name?, email?, phone?, country? }
   - CreatePaymentInput { amount, currency?, payment_method?, gateway?, mmo_provider?, description?, customer?, success_url?, error_url?, metadata? }
   - GeniusPayTransaction { id, reference, amount, currency, fees, net_amount, status, payment_method, payment_provider, environment, customer, metadata, checkout_url?, payment_url?, created_at, completed_at?, expires_at? }
   - GeniusPayWebhookPayload { id, event, timestamp, created_at, data: GeniusPayTransaction & { object, provider, customer_name, customer_phone, merchant_id }, environment, api_version }
   - GeniusPayApiError { success: false, error: { code, message } }
   - Type union des events : "payment.initiated" | "payment.success" | "payment.failed" | "payment.cancelled" | "payment.refunded" | "payment.expired" | "cashout.requested" | "cashout.approved" | "cashout.completed" | "cashout.failed" | "webhook.test"
3. N'implémente aucune logique ici, uniquement les types.
```

**Test de validation** : le projet compile (`tsc --noEmit` ou équivalent) sans erreur de type.

---

## ÉTAPE 3 — Client API GeniusPay (fonctions isolées)

```
ÉTAPE 3 — Client API GeniusPay
1. Analyse comment les appels HTTP sortants sont déjà faits ailleurs dans le projet (fetch natif, axios, un wrapper interne) pour rester cohérent.
2. Crée `src/lib/payments/geniuspay/client.ts` avec les fonctions suivantes, chacune petite et responsable d'une seule chose :
   - getGeniusPayHeaders(): renvoie { "X-API-Key", "X-API-Secret", "Content-Type": "application/json" } à partir des variables d'environnement.
   - createGeniusPayPayment(input: CreatePaymentInput): Promise<GeniusPayTransaction>
     → POST {BASE_URL}/payments
   - getGeniusPayPayment(reference: string): Promise<GeniusPayTransaction>
     → GET {BASE_URL}/payments/{reference}
   - listGeniusPayPayments(filters?: { status?, payment_method?, from?, to?, search?, per_page? }): Promise<{data, meta}>
     → GET {BASE_URL}/payments avec query params
   - getGeniusPayAccount(): Promise<{...}>
     → GET {BASE_URL}/account
   - getGeniusPayBalance(): Promise<{available, pending, total, currency}>
     → GET {BASE_URL}/account/balance
   - listPawapayProviders(country?: string): Promise<{...}>
     → GET {BASE_URL}/pawapay/providers
3. Chaque fonction doit :
   - Lever une erreur exploitable si `success: false` est renvoyé (avec error.code et error.message).
   - Ne jamais logger la clé secrète.
4. N'appelle PAS encore ces fonctions depuis une route — ce sera fait à l'étape 5.
```

**Test de validation** : écrire un test/script isolé qui appelle `createGeniusPayPayment` en sandbox avec un montant de test (ex. 500 XOF) et vérifie qu'on reçoit bien une `reference` et une `checkout_url`.

---

## ÉTAPE 4 — Vérification de signature webhook

```
ÉTAPE 4 — Vérification de signature webhook
1. Crée `src/lib/payments/geniuspay/webhook-signature.ts`.
2. Implémente :
   - verifyGeniusPayWebhookSignature(rawBody: string, signatureHeader: string, timestampHeader: string, secret: string): boolean
     Formule : signature attendue = HMAC-SHA256(timestamp + "." + rawBody, secret), comparée avec hash_equals / comparaison à temps constant (pas de `===` simple sur les chaînes).
   - isWebhookTimestampValid(timestampHeader: string, toleranceSeconds = 300): boolean
     Rejette si |now - timestamp| > 300s (protection contre le replay attack).
3. IMPORTANT : ces fonctions doivent recevoir le **corps brut (raw body)** de la requête, pas un objet déjà parsé en JSON — sinon la signature ne correspondra jamais (le JSON re-sérialisé n'est pas garanti identique à l'original).
   → Vérifie comment le framework du projet permet de récupérer le raw body (ex: désactiver le body-parser JSON par défaut sur cette route précise, ou utiliser req.text()).
```

**Test de validation** : écrire un test unitaire qui génère un HMAC avec un secret de test, l'injecte dans `verifyGeniusPayWebhookSignature`, et vérifie que la fonction retourne `true` pour une signature valide et `false` pour une signature altérée.

---

## ÉTAPE 5 — Endpoint : initier un paiement

```
ÉTAPE 5 — Endpoint d'initiation de paiement
1. Analyse le système de routing existant du projet pour respecter ses conventions (structure de dossiers, middlewares d'auth, gestion d'erreurs).
2. Crée une route POST (ex: `/api/payments/geniuspay/initiate`) qui :
   a. Reçoit { order_id, payment_method? } depuis le frontend (le montant et les infos client sont récupérés côté serveur depuis la commande existante, JAMAIS depuis le frontend, pour éviter la falsification du montant).
   b. Charge la commande correspondant à order_id depuis la base.
   c. Appelle createGeniusPayPayment() avec :
      - amount = montant de la commande (en XOF)
      - description = référence commande lisible
      - customer = { name, email, phone } de la commande
      - metadata = { order_id } ← indispensable pour retrouver la commande dans le webhook
      - success_url / error_url = pages Ofika de redirection
      - payment_method = optionnel (si omis → page de checkout GeniusPay avec choix du moyen de paiement, recommandé pour maximiser la conversion)
   d. Sauvegarde en base : payment_reference, payment_status = "pending", payment_provider = "geniuspay", amount, currency, metadata.
   e. Renvoie au frontend { checkout_url } (ou payment_url selon le mode).
3. Gère les erreurs de l'étape 3 proprement (400/500 avec message clair, sans exposer les clés API).
```

**Test de validation** : appeler la route en local (Postman/curl) avec une commande de test → vérifier qu'une ligne `payment_status = pending` apparaît en base et qu'une `checkout_url` valide est renvoyée.

---

## ÉTAPE 6 — Endpoint : réception du webhook

```
ÉTAPE 6 — Endpoint webhook GeniusPay
1. Analyse comment le projet gère déjà (s'il y a lieu) le raw body pour d'autres webhooks (Paystack, Stripe...), pour réutiliser le même pattern.
2. Crée une route POST (ex: `/api/webhooks/geniuspay`), PUBLIQUE (pas d'auth utilisateur, la sécurité vient de la signature HMAC) qui :
   a. Lit le raw body.
   b. Extrait les headers : X-Webhook-Signature, X-Webhook-Timestamp, X-Webhook-Event, X-Webhook-Environment.
   c. Appelle verifyGeniusPayWebhookSignature() et isWebhookTimestampValid(). Si invalide → 401, ne rien traiter.
   d. Parse le JSON du payload (GeniusPayWebhookPayload).
   e. Vérifie l'idempotence : cherche `payload.id` dans `geniuspay_webhook_events`.
      - Si déjà présent avec `processed_at` renseigné → répondre 200 immédiatement SANS retraiter (idempotence).
      - Sinon, insérer la ligne (event_type, payload, received_at) avant de traiter.
   f. Répond 200 IMMÉDIATEMENT après validation de signature + enregistrement de l'event (avant tout traitement métier lourd), pour respecter la contrainte des 5 secondes de GeniusPay.
   g. Déclenche le traitement métier (étape 7) — en synchrone si le traitement est rapide (simple update SQL), ou via une queue/job si le projet en possède déjà une.
   h. Marque `processed_at` une fois le traitement terminé.
```

**Test de validation** : utiliser le bouton "Tester" du dashboard GeniusPay (webhook de test `webhook.test`) et vérifier en local (ngrok/tunnel si nécessaire) que la requête arrive, que la signature est validée, et qu'une ligne apparaît dans `geniuspay_webhook_events`.

---

## ÉTAPE 7 — Logique métier : traitement des événements

```
ÉTAPE 7 — Traitement métier des événements webhook
1. Analyse le modèle "commande" existant : quels statuts existent déjà (ex: pending, paid, shipped...) et comment sont-ils mis à jour ailleurs dans le code (pour rester cohérent, ne pas créer un système parallèle).
2. Crée `src/lib/payments/geniuspay/webhook-handler.ts` avec une fonction dispatcher :
   - handleGeniusPayWebhookEvent(payload: GeniusPayWebhookPayload): Promise<void>
   qui route vers des fonctions dédiées, une par événement :
   - handlePaymentSuccess(data): marque la commande comme payée (payment_status = completed, paid_at = now), déclenche les actions post-paiement du projet (ex: envoi email de confirmation, décrément du stock, déclenchement de la préparation de commande) — retrouve la commande via `data.metadata.order_id`.
   - handlePaymentFailed(data): payment_status = failed, notifie éventuellement le client.
   - handlePaymentCancelled(data): payment_status = cancelled.
   - handlePaymentExpired(data): payment_status = expired.
   - handlePaymentRefunded(data): payment_status = refunded, éventuelle logique de remboursement interne.
   - handleCashoutEvent(data, eventType): pour les events cashout.* — à ne traiter que si Ofika gère des retraits marchand (sinon simple log).
3. Chaque fonction doit être idempotente par elle-même (ex: ne pas ré-décrémenter le stock si la commande est déjà "completed").
4. Chaque fonction ne fait qu'UNE chose (single responsibility) — pas de logique webhook/HTTP ici, uniquement de la logique métier pure recevant déjà des données typées.
```

**Test de validation** : simuler chaque event (payment.success, payment.failed, payment.cancelled) avec un payload de test injecté directement dans `handleGeniusPayWebhookEvent`, et vérifier que le statut de la commande en base change comme attendu, sans appel réseau réel.

---

## ÉTAPE 8 — Frontend : bouton de paiement

```
ÉTAPE 8 — Frontend bouton de paiement
1. Analyse le framework frontend utilisé (React, Vue, autre) et les conventions de composants déjà en place (ex: où sont les composants "paiement" ou "checkout" s'ils existent).
2. Crée un composant `PaymentButtonGeniusPay` qui :
   - Au clic, appelle POST /api/payments/geniuspay/initiate avec { order_id } (jamais de montant ni de clé API côté frontend).
   - Affiche un état de chargement pendant l'appel.
   - Redirige `window.location.href = checkout_url` reçu en réponse.
   - Gère l'erreur (affichage d'un message, pas de redirection).
3. N'utilise PAS le SDK React officiel `geniuspay-react` sauf si le projet a une bonne raison de l'ajouter (il expose des clés publiques côté client et fait des appels directs — préférer le flux "backend initie, frontend redirige" décrit ci-dessus, plus sûr et plus simple à auditer).
```

**Test de validation** : cliquer sur le bouton en environnement sandbox → vérifier la redirection effective vers la page de checkout GeniusPay avec le bon montant affiché.

---

## ÉTAPE 9 — Pages de retour (success / error)

```
ÉTAPE 9 — Pages de retour
1. Crée/adapte deux pages ou routes : success_url et error_url (celles envoyées à l'étape 5).
2. La page success_url :
   - Récupère order_id (via query param ou session) et affiche l'état actuel de la commande EN BASE (pas un statut supposé).
   - Si le webhook n'est pas encore arrivé (payment_status encore "pending"), afficher un message "paiement en cours de confirmation" plutôt qu'un faux succès, avec éventuellement un polling léger (2-3 tentatives espacées) pour rafraîchir le statut.
3. La page error_url : affiche un message d'échec et propose de réessayer.
4. RAPPEL : ces pages sont uniquement informatives. La mise à jour réelle du statut passe TOUJOURS par le webhook (étape 6-7), jamais par cette redirection (un utilisateur pourrait fermer l'onglet avant la redirection, ou la manipuler).
```

**Test de validation** : simuler un paiement sandbox complet de bout en bout et vérifier que la page affiche le bon statut une fois le webhook traité.

---

## ÉTAPE 10 — Configuration du webhook côté GeniusPay

```
ÉTAPE 10 — Enregistrement du webhook
1. En sandbox, créer le webhook via l'API ou le dashboard GeniusPay :
   POST {BASE_URL}/webhooks
   { "name": "Ofika Sandbox", "url": "https://<url-publique-ou-tunnel>/api/webhooks/geniuspay",
     "events": ["payment.success", "payment.failed", "payment.cancelled", "payment.refunded", "payment.expired"] }
2. Sauvegarder immédiatement le `secret` (whsec_...) renvoyé dans GENIUSPAY_WEBHOOK_SECRET (sandbox) — il n'est montré qu'une seule fois.
3. Utiliser le bouton "Tester" pour envoyer un `webhook.test` et valider que l'étape 6 répond 200 correctement.
4. Répéter la même opération en production une fois les tests sandbox validés (nouveau secret whsec_live_...).
```

**Test de validation** : un event `webhook.test` apparaît bien traité (200 + ligne en base) sans erreur de signature.

---

## ÉTAPE 11 — Checklist de tests bout-en-bout (sandbox)

```
ÉTAPE 11 — Tests end-to-end
Avant de passer en production, valider un par un :
1. Paiement réussi (mode checkout, sans payment_method) → commande passe à "completed", email/action post-paiement déclenché une seule fois.
2. Paiement échoué → commande passe à "failed".
3. Paiement annulé par le client → commande passe à "cancelled".
4. Rejeu du même webhook deux fois (ex: en renvoyant la même requête) → aucune double exécution des actions métier (idempotence).
5. Signature invalide (payload modifié) → rejet 401, aucune écriture en base.
6. Timestamp trop ancien (> 5 min) → rejet, aucune écriture en base.
7. Coupure réseau simulée pendant l'appel à createGeniusPayPayment → l'utilisateur voit une erreur claire, aucune commande fantôme "pending" orpheline sans reference.
```

---

## ÉTAPE 12 — Passage en production

```
ÉTAPE 12 — Mise en production
1. Régénérer/récupérer les clés live (pk_live_, sk_live_) et le webhook secret live (whsec_live_) dans le dashboard GeniusPay.
2. Mettre à jour les variables d'environnement de production (jamais les committer).
3. Recréer le webhook en pointant vers l'URL de production réelle avec les mêmes events.
4. Vérifier GENIUSPAY_ENV=live et que l'environnement retourné dans les réponses API est bien "live".
5. Faire un paiement réel de faible montant (ex: 200 XOF, le minimum autorisé) pour valider le flux complet en conditions réelles avant l'ouverture au public.
```

---

## Annexe A — Référence rapide API

| Action | Méthode | Endpoint |
|---|---|---|
| Initier un paiement | POST | `/payments` |
| Lister les paiements | GET | `/payments?status=&from=&to=&search=&per_page=` |
| Récupérer un paiement | GET | `/payments/{reference}` |
| Fournisseurs PawaPay | GET | `/pawapay/providers?country=CI` |
| Infos compte | GET | `/account` |
| Solde | GET | `/account/balance` |
| Lister webhooks | GET | `/webhooks` |
| Créer un webhook | POST | `/webhooks` |
| Modifier un webhook | PUT | `/webhooks/{id}` |
| Supprimer un webhook | DELETE | `/webhooks/{id}` |
| Tester un webhook | POST | `/webhooks/{id}/test` |

Headers requis pour tous les appels API : `X-API-Key`, `X-API-Secret`, `Content-Type: application/json`.

Headers reçus sur les webhooks : `X-Webhook-Signature`, `X-Webhook-Timestamp`, `X-Webhook-Event`, `X-Webhook-Environment`, `X-Webhook-Delivery`.

## Annexe B — Statuts de paiement

`pending` → `processing` → `completed` | `failed` | `expired` | `cancelled` | `refunded`

## Annexe C — Moyens de paiement disponibles pour la Côte d'Ivoire

Wave, Orange Money, MTN Mobile Money, Moov Money, Paystack (cartes), PawaPay (agrégateur). Laisser `payment_method` vide pour afficher le choix complet sur la page de checkout GeniusPay (recommandé pour le taux de conversion).

## Annexe D — Règles de sécurité non négociables

1. `X-API-Secret` et `GENIUSPAY_WEBHOOK_SECRET` : uniquement côté serveur, jamais dans le code frontend ni dans un repo public.
2. Toujours vérifier la signature HMAC avant de traiter un webhook — sans exception, même en développement.
3. Toujours vérifier le timestamp du webhook (protection anti-rejeu).
4. Toujours traiter les webhooks de façon idempotente (via l'`id` unique de l'event).
5. Le montant d'un paiement est toujours calculé côté serveur à partir de la commande en base — jamais accepté tel quel depuis le frontend.
6. La confirmation de paiement provient uniquement du webhook, jamais de la redirection `success_url`.
