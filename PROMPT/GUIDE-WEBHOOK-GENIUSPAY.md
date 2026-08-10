# Guide de Configuration Webhook GeniusPay

Afin que le système de paiement soit informé en temps réel du succès ou de l'échec d'une transaction, vous devez configurer le webhook dans votre tableau de bord GeniusPay.

## 1. Ajouter l'URL du Webhook

1. Connectez-vous à votre [Tableau de bord GeniusPay](https://dashboard.geniuspay.ci).
2. Rendez-vous dans la section **Développeurs (Developers)** puis **Webhooks**.
3. Cliquez sur **Ajouter un webhook** (Add Webhook).
4. Dans le champ URL, entrez l'adresse exacte de votre API en production :
   ```text
   https://votre-domaine.com/api/webhooks/geniuspay
   ```
   *(Remplacez `votre-domaine.com` par le vrai domaine Ofika)*

## 2. Sélectionner les événements

Cochez les événements suivants pour que le serveur soit notifié des changements de statut :
- `payment.success` (Obligatoire)
- `payment.failed` (Obligatoire)
- `payment.cancelled`
- `payment.expired`
- `payment.refunded`

## 3. Récupérer le Secret Webhook

1. Une fois le webhook créé, GeniusPay vous fournira un **Webhook Secret** (Clé secrète de webhook).
2. Copiez cette clé. C'est elle qui permet de sécuriser la communication et de s'assurer que les requêtes proviennent bien de GeniusPay.

## 4. Configurer les variables d'environnement

Allez dans la configuration de votre serveur ou plateforme d'hébergement (Vercel, Railway, etc.), et ajoutez/modifiez les variables d'environnement suivantes :

```env
# Clés API pour initier les paiements
GENIUSPAY_API_KEY=votre_api_key_ici
GENIUSPAY_API_SECRET=votre_api_secret_ici

# Secret Webhook pour vérifier les notifications
GENIUSPAY_WEBHOOK_SECRET=votre_webhook_secret_ici

# (Optionnel) Base URL si différente de celle par défaut
GENIUSPAY_BASE_URL=https://geniuspay.ci/api/v1/merchant
```

## 5. Test

Dans l'environnement de "Sandbox" de GeniusPay, vous pouvez utiliser la fonctionnalité "Test Webhook" pour envoyer un événement de test vers votre serveur et vérifier qu'il répond avec un code `200 OK`.
