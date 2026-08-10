# 📡 Webhook Make.com - Référence complète

## Vue d'ensemble

Les webhooks Make.com sont envoyés automatiquement lors des événements importants de l'application Ofika. Chaque webhook contient des informations détaillées pour faciliter l'intégration avec Make.com.

## 🎯 Événements webhook

### 1. PHYSICAL_CARD_ORDERED 
**Déclenché** : Lorsqu'une commande de carte physique est créée

**Données envoyées** :
```json
{
  "tag": "PHYSICAL_CARD_ORDERED",
  "timestamp": "2025-10-01T22:30:00.000Z",
  "user_id": "user-456",
  "user_email": "john.doe@example.com",
  "data": {
    "id_commande": "7e3b58ac-dd1f-4969-a9a0-034aa6b4f92c",
    "type_carte": "nfc_qr",
    "quantite": 1,
    "prix_unitaire": 15000,
    "prix_total": 15000,
    "devise": "XOF",
    "nom_client": "John Doe",
    "email_client": "john.doe@example.com",
    "telephone_client": "+225070123456",
    "adresse_livraison": "123 Rue de la Paix",
    "ville": "Abidjan",
    "code_postal": "00225",
    "date_creation": "2025-10-01T22:30:00.000Z",
    "lien_paiement": "https://pay.Waveapp.com/checkout/73380b6c-fc8f-4c98-9493-63138876f67a",
    "url_redirection": "http://localhost:3000/payment/success/7e3b58ac-dd1f-4969-a9a0-034aa6b4f92c",
    "url_echec": "http://localhost:3000/payment/failure/7e3b58ac-dd1f-4969-a9a0-034aa6b4f92c",
    "description_commande": "Commande carte nfc_qr - 1 unité(s)",
    "message_Wave": "Commande carte nfc_qr - 1 unité(s)",
    "statut_commande": "pending",
    "profile_id": "profile-123",
    "user_id": "user-456"
  },
  "app_name": "Ofika",
  "environment": "development"
}
```

### 2. PAYMENT_COMPLETED
**Déclenché** : Lorsqu'un paiement est confirmé par Wave

**Données envoyées** :
```json
{
  "tag": "PAYMENT_COMPLETED",
  "timestamp": "2025-10-01T22:35:00.000Z",
  "user_id": "user-456",
  "user_email": "john.doe@example.com",
  "data": {
    "id_commande": "7e3b58ac-dd1f-4969-a9a0-034aa6b4f92c",
    "id_paiement": "Wave-payment-123",
    "order_id_Wave": "Wave-7e3b58ac-dd1f-4969-a9a0-034aa6b4f92c-1759500000000",
    "montant": 14600,
    "devise": "XOF",
    "type_carte": "nfc_qr",
    "quantite": 1,
    "nom_client": "John Doe",
    "email_client": "john.doe@example.com",
    "telephone_client": "+225070123456",
    "adresse_livraison": "123 Rue de la Paix",
    "ville": "Abidjan",
    "code_postal": "00225",
    "date_creation": "2025-10-01T22:30:00.000Z",
    "date_paiement": "2025-10-01T22:35:00.000Z",
    "lien_paiement": "https://pay.Waveapp.com/checkout/73380b6c-fc8f-4c98-9493-63138876f67a",
    "url_redirection": "http://localhost:3000/payment/success/7e3b58ac-dd1f-4969-a9a0-034aa6b4f92c",
    "url_echec": "http://localhost:3000/payment/failure/7e3b58ac-dd1f-4969-a9a0-034aa6b4f92c",
    "description_commande": "Commande carte nfc_qr - 1 unité(s)",
    "message_Wave": "Commande carte nfc_qr - 1 unité(s)",
    "statut_paiement": "confirmé",
    "statut_commande": "paid",
    "profile_id": "profile-123",
    "user_id": "user-456"
  },
  "app_name": "Ofika",
  "environment": "development"
}
```

## 📋 Champs détaillés

### Informations de base
- `id_commande` : ID unique de la commande dans Supabase
- `type_carte` : Type de carte (`nfc_qr` ou `qr_only`)
- `quantite` : Nombre de cartes commandées
- `prix_unitaire` : Prix d'une carte en XOF
- `prix_total` : Prix total de la commande en XOF
- `devise` : Devise utilisée (toujours `XOF`)

### Informations client
- `nom_client` : Nom complet du client
- `email_client` : Email du client
- `telephone_client` : Numéro de téléphone du client
- `adresse_livraison` : Adresse de livraison
- `ville` : Ville de livraison
- `code_postal` : Code postal

### Informations temporelles
- `date_creation` : Date de création de la commande (ISO 8601)
- `date_paiement` : Date de confirmation du paiement (ISO 8601) - PAYMENT_COMPLETED uniquement

### Informations de paiement Wave
- `lien_paiement` : URL de paiement Wave générée (dans les deux webhooks)
- `url_redirection` : URL de succès après paiement (dans les deux webhooks)
- `url_echec` : URL d'échec après paiement (dans les deux webhooks)
- `id_paiement` : ID du paiement Wave (PAYMENT_COMPLETED uniquement)
- `order_id_Wave` : Order ID unique envoyé à Wave (PAYMENT_COMPLETED uniquement)

### Description et messages
- `description_commande` : Description de la commande
- `message_Wave` : Message envoyé à Wave

### Statuts
- `statut_commande` : Statut de la commande (`pending`, `paid`, `failed`, `cancelled`)
- `statut_paiement` : Statut du paiement (`confirmé`) - PAYMENT_COMPLETED uniquement

### Informations techniques
- `profile_id` : ID du profil NFC associé
- `user_id` : ID de l'utilisateur
- `app_name` : Nom de l'application (toujours `Ofika`)
- `environment` : Environnement (`development`, `production`)

## 🔗 URL du webhook

**Endpoint** : `https://hook.eu2.make.com/pq1nkr78lnjt5cvvr9kgjfm7t36vgvne`

**Méthode** : `POST`

**Content-Type** : `application/json`

## 🧪 Test des webhooks

Pour tester les webhooks en local, utilisez ngrok :

```bash
# Installation ngrok
npm install -g ngrok

# Exposition du serveur local
ngrok http 3000

# Mettre à jour NEXT_PUBLIC_APP_URL avec l'URL ngrok
```

## 📝 Logs et débogage

Les webhooks sont loggés dans la console du serveur avec les préfixes :
- `📡 Envoi webhook simple Make.com:`
- `✅ Webhook simple envoyé avec succès:`
- `❌ Erreur webhook:`

## 🔧 Configuration

Les webhooks sont configurés dans :
- `lib/services/business-rules.ts` : Service WebhookService
- `app/api/webhooks/make/route.ts` : Route API pour Make.com
- `lib/services/payments.ts` : Webhook PHYSICAL_CARD_ORDERED
- `app/api/webhooks/Wave/route.ts` : Webhook PAYMENT_COMPLETED
