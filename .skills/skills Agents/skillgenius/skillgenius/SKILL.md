---
name: skillgenius
description: >-
  Intégration du moyen de paiement GeniusPay (Mobile Money Wave, Orange Money, MTN, Moov,
  PawaPay, cartes bancaires) dans un projet backend/frontend, notamment le projet Ofika.
  Utilise ce skill dès que l'utilisateur mentionne GeniusPay, l'intégration d'un moyen de
  paiement dans Ofika, des webhooks de paiement, la vérification de signature HMAC de
  paiement, ou veut créer/modifier des endpoints d'initiation de paiement ou de réception
  de webhook liés à GeniusPay — même si le mot GeniusPay n'est pas explicitement répété
  à chaque fois, par exemple "ajoute le paiement mobile money", "le webhook de paiement ne
  se déclenche pas", "vérifie la signature du webhook". Fournit l'architecture cible, les
  endpoints exacts de l'API, le format des payloads, la logique de vérification de
  signature, et un déroulé étape par étape à suivre dans l'ordre pour une implémentation
  sécurisée et 100% automatique, sans confirmation manuelle.
---

# Skill GeniusPay — Intégration paiement (projet Ofika)

## Quand utiliser ce skill

Utilise ce skill pour toute tâche touchant à l'intégration de GeniusPay :
- Créer, corriger ou étendre les endpoints d'initiation de paiement.
- Créer, corriger ou déboguer le endpoint webhook GeniusPay.
- Ajouter la vérification de signature HMAC.
- Ajouter un nouveau moyen de paiement GeniusPay (Wave, Orange Money, MTN, Moov, PawaPay, carte).
- Déboguer un problème de paiement qui ne se met pas à jour en base (statut de commande).
- Répondre à des questions sur l'API GeniusPay (endpoints, format de payload, statuts, erreurs).

## Principe fondamental — ne jamais dévier

**Le webhook est l'unique source de vérité.** Le statut d'une commande ne doit JAMAIS être mis à "payé" depuis la redirection `success_url` côté frontend — uniquement depuis le webhook, après vérification de signature. Toute implémentation qui contourne ce principe doit être signalée à l'utilisateur avant d'être écrite.

**Le montant du paiement vient toujours de la base de données côté serveur**, jamais d'une valeur envoyée par le frontend.

## Configuration requise

```
GENIUSPAY_API_KEY=pk_sandbox_xxxxxxxx
GENIUSPAY_API_SECRET=sk_sandbox_xxxxxxxx
GENIUSPAY_WEBHOOK_SECRET=whsec_sandbox_xxxxx
GENIUSPAY_BASE_URL=https://geniuspay.ci/api/v1/merchant
GENIUSPAY_ENV=sandbox
```
Ces valeurs vont dans `.env`, jamais commit. `X-API-Secret` et `GENIUSPAY_WEBHOOK_SECRET` : uniquement côté serveur.

## Architecture cible (résumé)

```
Frontend → POST /payments/geniuspay/initiate (backend Ofika, jamais l'API GeniusPay direct)
Backend  → POST {BASE_URL}/payments → sauvegarde payment_status=pending → renvoie checkout_url
Client   → redirigé vers checkout_url, paie
GeniusPay → POST /webhooks/geniuspay (backend Ofika) → vérifie signature → idempotence → met à jour statut commande → répond 200 en <5s
Client   → redirigé vers success_url/error_url (affichage uniquement, jamais source de vérité)
```

Détails complets de l'architecture et déroulé étape par étape (schéma DB, types, client API, endpoints, frontend, tests, mise en production) : voir `references/plan-implementation.md`.

## Référence API complète

Endpoints exacts, headers, paramètres, exemples de payloads JSON, codes d'erreur, statuts, moyens de paiement disponibles par pays : voir `references/api-reference.md`. Toujours consulter ce fichier avant d'écrire un appel à l'API GeniusPay pour ne pas halluciner un champ ou un endpoint.

## Sécurité webhook — règles non négociables

1. Toujours vérifier la signature `X-Webhook-Signature` avant tout traitement : `HMAC-SHA256(timestamp + "." + raw_body, webhook_secret)`, comparaison à temps constant (`hash_equals` ou équivalent).
2. Vérifier la fraîcheur du `X-Webhook-Timestamp` (rejeter si écart > 300s avec l'heure actuelle) pour éviter le replay attack.
3. Utiliser le raw body brut pour le calcul de la signature — jamais un JSON re-sérialisé (le body doit être lu avant tout body-parser JSON générique sur cette route).
4. Traiter les webhooks de façon idempotente via le champ `id` unique du payload — stocker les events déjà traités dans une table dédiée (ex: `geniuspay_webhook_events`).
5. Répondre 200 rapidement (<5s), traiter la logique métier lourde après ou en tâche asynchrone si besoin.

## Découpage en fonctions (convention à respecter)

Quand tu écris le code, garde ce découpage en petites fonctions à responsabilité unique (adapte les noms/chemins à la stack réelle du projet, mais garde cette séparation) :

- `getGeniusPayHeaders()` — construit les headers d'auth depuis l'env.
- `createGeniusPayPayment(input)` — POST `/payments`.
- `getGeniusPayPayment(reference)` — GET `/payments/{reference}`.
- `listGeniusPayPayments(filters)` — GET `/payments`.
- `getGeniusPayAccount()` / `getGeniusPayBalance()` — infos compte.
- `verifyGeniusPayWebhookSignature(rawBody, signature, timestamp, secret)` — vérif HMAC.
- `isWebhookTimestampValid(timestamp)` — anti-replay.
- `handleGeniusPayWebhookEvent(payload)` — dispatcher.
- `handlePaymentSuccess/Failed/Cancelled/Expired/Refunded(data)` — une fonction par événement, chacune idempotente.

## Comment procéder (workflow)

1. **Toujours analyser le projet existant d'abord** : stack backend, ORM, schéma de commandes/transactions déjà en place, conventions de dossiers. Ne jamais assumer une stack sans avoir vérifié.
2. Si l'utilisateur demande une implémentation complète, suis le déroulé détaillé dans `references/plan-implementation.md`, étape par étape, sans sauter d'étape, en validant chaque étape par un test avant de passer à la suivante.
3. Si l'utilisateur demande une correction ponctuelle (ex: "le webhook échoue"), va directement au point concerné (souvent : mauvaise lecture du raw body, ou signature calculée sur le mauvais timestamp/payload) — voir la section sécurité webhook ci-dessus et `references/api-reference.md`.
4. Ne jamais inventer un champ ou un endpoint qui n'apparaît pas dans `references/api-reference.md`. Si une info manque, le dire explicitement plutôt que de deviner.
