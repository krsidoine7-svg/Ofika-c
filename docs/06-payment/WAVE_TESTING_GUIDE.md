# 🌊 Guide de Test Wave CI - Ofika

## 🎯 Vue d'Ensemble

Wave CI est le système de paiement intégré dans Ofika pour la Côte d'Ivoire. Wave CI utilise des liens de paiement dynamiques générés côté client.

---

## ⚙️ Configuration Requise

### 1. Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Wave CI Configuration
NEXT_PUBLIC_WAVE_MERCHANT_ID=votre_merchant_id_ici
NEXT_PUBLIC_WAVE_COUNTRY_CODE=ci
NEXT_PUBLIC_WAVE_SUCCESS_URL=http://localhost:3000/payment/success
NEXT_PUBLIC_WAVE_FAILURE_URL=http://localhost:3000/payment/cancelled

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Obtenir vos Identifiants Wave

1. Créez un compte marchand sur [Wave CI](https://wave.com/ci)
2. Accédez à votre dashboard marchand
3. Récupérez votre **Merchant ID**
4. Activez le mode test si disponible

---

## 🧪 Test de Configuration

### Vérifier que Wave est Opérationnel

```bash
# Terminal
curl http://localhost:3000/api/payments/wave/create

# Réponse attendue:
{
  "success": true,
  "message": "Wave CI Payment API - Opérationnel",
  "provider": "Wave CI",
  "country": "ci",
  "merchant_id": "votre_merchant_id",
  "timestamp": "2025-01-11T...",
  "note": "Wave CI utilise des liens de paiement dynamiques..."
}
```

### Ou via l'Interface Web

Accédez à : `http://localhost:3000/test-api`

Cliquez sur **"5. Wave Config"**

---

## 💳 Flow Complet de Paiement

### Étape 1 : Créer une Commande

#### Via l'API

```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "product_type": "nfc_card",
    "quantity": 1,
    "shipping_address": {
      "full_name": "Jean Dupont",
      "address_line1": "Cocody, Angré 7ème Tranche",
      "city": "Abidjan",
      "postal_code": "00225",
      "country": "Côte d'\''Ivoire",
      "phone": "+225 07 12 34 56 78"
    },
    "promo_code": "WELCOME10"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "ORD-1736595123-XYZ789",
    "total_amount": 13500,
    "currency": "XOF",
    "status": "pending"
  }
}
```

**Calcul du Prix:**
- Prix de base NFC Card: 15,000 FCFA
- Code promo WELCOME10: -10% = 13,500 FCFA

---

### Étape 2 : Initier le Paiement Wave

```bash
curl -X POST http://localhost:3000/api/payments/wave/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "amount": 13500,
    "currency": "XOF",
    "description": "Carte NFC Ofika - ORD-1736595123-XYZ789",
    "order_id": "550e8400-e29b-41d4-a716-446655440000",
    "success_url": "http://localhost:3000/payment/success",
    "failure_url": "http://localhost:3000/payment/cancelled"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_1736595123_abc123",
    "payment_url": "https://pay.wave.com/m/votre_merchant_id?amount=13500&currency=XOF&...",
    "amount": 13500,
    "currency": "XOF",
    "status": "pending",
    "merchant_id": "votre_merchant_id",
    "country_code": "ci",
    "order_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### Étape 3 : Rediriger vers Wave

```javascript
// Dans votre frontend
const response = await fetch('/api/payments/wave/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(paymentData)
})

const { data } = await response.json()

// Rediriger l'utilisateur
window.location.href = data.payment_url
```

---

### Étape 4 : Test du Paiement

**Sur la page Wave:**

1. Le client voit le montant et la description
2. Il entre son numéro Wave
3. Il reçoit un code de confirmation par SMS
4. Il entre le code
5. Paiement confirmé

**Redirection automatique vers:**
- ✅ Success: `/payment/success?order_id=xxx&payment_id=yyy`
- ❌ Failure: `/payment/cancelled?order_id=xxx`

---

## 🎨 Interface de Test Interactive

### Accéder à la Page de Test

```
http://localhost:3000/test-api
```

### Fonctionnalités

1. **Configuration**
   - Définir session_id
   - Obtenir auth token automatiquement

2. **Tests Disponibles**
   - ✅ Save Temp (sans auth)
   - ✅ Get Temp (sans auth)
   - ✅ Finalize (avec auth)
   - ✅ Create Order (avec auth)
   - ✅ Wave Config (vérification)
   - ✅ Rate Limiting (10 requêtes)

3. **Résultats en Temps Réel**
   - Status success/error
   - Réponse JSON complète
   - Timestamp

---

## 📊 Scénarios de Test

### Scénario A : Nouveau Client NFC

**Contexte:** Client veut commander une carte NFC

1. **Visite la page:** `/get-started`
2. **Clique:** "Commander une Carte NFC"
3. **Remplit le wizard NFC** (nom, design, couleur)
4. **Arrive sur:** `/onboarding/card-order`
5. **Remplit l'adresse de livraison**
6. **Clique:** "Commander maintenant" (15,000 FCFA)

**Backend automatique:**
```
POST /api/orders/create
  → Crée order avec status="pending"
  → Génère order_number
  
POST /api/payments/wave/create
  → Génère payment_url
  → Log payment_id
```

7. **Redirection Wave:** Client paie
8. **Callback success:** Update order status="paid"
9. **Confirmation:** Email + SMS

**Vérification:**
```sql
-- Supabase SQL Editor
SELECT * FROM orders 
WHERE user_id = 'votre_user_id' 
AND status = 'paid';
```

---

### Scénario B : Page Publique Gratuite

**Contexte:** Utilisateur crée sa page gratuite

1. **Visite:** `/get-started`
2. **Clique:** "Créer ma page publique" (GRATUIT)
3. **Remplit formulaire** (sans auth)
4. **Données sauvegardées** dans localStorage

```
POST /api/onboarding/save-temp
  session_id: "generated_uuid"
  flow_type: "public_page"
  data: { name, bio, email, ... }
```

5. **Redirection:** `/auth/signup`
6. **Après signup:** Auto-finalize

```
POST /api/onboarding/finalize
  session_id: "generated_uuid"
  → Crée le profil dans DB
  → Supprime pending_creation
```

7. **Sélection template**
8. **Page success**

**Vérification:**
```sql
SELECT * FROM profiles 
WHERE user_id = 'votre_user_id';
```

---

### Scénario C : Test Réductions

**Commande de 5 cartes NFC:**

```json
{
  "product_type": "nfc_card",
  "quantity": 5
}
```

**Calcul:**
- Prix unitaire: 15,000 FCFA
- Total brut: 75,000 FCFA
- Réduction -10% (5+): **67,500 FCFA** ✅

**Commande de 10 cartes avec code promo:**

```json
{
  "product_type": "nfc_card",
  "quantity": 10,
  "promo_code": "WELCOME10"
}
```

**Calcul:**
- Prix unitaire: 15,000 FCFA
- Total brut: 150,000 FCFA
- Réduction -15% (10+): 127,500 FCFA
- Code promo -10%: **114,750 FCFA** ✅

---

## 🔒 Test des Limites

### Limite QR Codes (7 max)

```bash
#!/bin/bash
TOKEN="votre_token"

# Créer 8 QR codes
for i in {1..8}; do
  echo "QR Code $i"
  curl -X POST http://localhost:3000/api/qr-codes \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"nfc_link\":\"https://example.com/$i\",\"redirect_type\":\"custom\"}"
  echo ""
done

# Le 8ème devrait retourner:
# "error": "Limite atteinte : 7 QR codes maximum"
```

### Rate Limiting

**Test 1: Onboarding (20 req/min)**
```bash
# Rapide: 30 requêtes
for i in {1..30}; do
  curl -X POST http://localhost:3000/api/onboarding/save-temp \
    -H "Content-Type: application/json" \
    -d "{\"session_id\":\"test$i\",\"flow_type\":\"public_page\",\"step\":1,\"data\":{}}" &
done
wait

# Après 20 requêtes, erreur 429 attendue
```

**Test 2: Orders (5 req/min)**
```bash
# 10 requêtes
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/orders/create \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"product_type":"nfc_card","quantity":1}' &
done
wait

# Après 5 requêtes, erreur 429
```

---

## 🐛 Debugging

### Vérifier les Logs

```bash
# Terminal où tourne npm run dev

# Recherchez:
🌊 API Route Wave CI - Création de paiement
💳 Données de paiement Wave CI: {...}
✅ Lien de paiement Wave CI créé
```

### Vérifier la Base de Données

```sql
-- Orders
SELECT 
  order_number,
  total_amount,
  currency,
  status,
  created_at
FROM orders
WHERE user_id = 'votre_user_id'
ORDER BY created_at DESC
LIMIT 10;

-- Pending Creations
SELECT 
  session_id,
  flow_type,
  current_step,
  created_at
FROM pending_creations
WHERE created_at > NOW() - INTERVAL '1 hour';

-- QR Codes (vérifier limite 7)
SELECT COUNT(*) as total
FROM qr_redirects
WHERE user_id = 'votre_user_id';
```

### Vérifier localStorage

```javascript
// Console navigateur
console.log('Pending data:', localStorage.getItem('pendingProfileData'))
console.log('Session ID:', localStorage.getItem('onboarding_session_id'))
```

---

## ✅ Checklist de Test

### Configuration
- [ ] Variables d'environnement Wave configurées
- [ ] Merchant ID valide
- [ ] GET `/api/payments/wave/create` retourne success

### Endpoints API
- [ ] POST `/api/onboarding/save-temp` (sans auth)
- [ ] GET `/api/onboarding/save-temp?session_id=xxx`
- [ ] POST `/api/onboarding/finalize` (avec auth)
- [ ] POST `/api/orders/create` (avec auth)
- [ ] GET `/api/orders/create` (liste orders)
- [ ] POST `/api/payments/wave/create` (génère lien)

### Flow Onboarding
- [ ] User non auth → localStorage → signup → finalize
- [ ] User auth → création directe
- [ ] Données persistent après signup

### Paiements
- [ ] Génération lien Wave
- [ ] Redirection vers Wave
- [ ] Paiement test réussi
- [ ] Callback success fonctionne
- [ ] Order status updated

### Limites
- [ ] 4 réseaux sociaux max (UI)
- [ ] 4 liens personnalisés max (UI)
- [ ] 7 QR codes max (API)
- [ ] Rate limiting 5 req/min (orders)
- [ ] Rate limiting 20 req/min (onboarding)

### Pricing
- [ ] Prix de base correct (15,000 FCFA)
- [ ] Réduction -10% pour 5+ cartes
- [ ] Réduction -15% pour 10+ cartes
- [ ] Code promo WELCOME10 appliqué

---

## 📞 Support

### Problèmes Courants

**1. "Configuration Wave CI manquante"**
- Vérifiez `.env`
- Restart le serveur: `npm run dev`

**2. "Utilisateur non authentifié"**
- Obtenez un nouveau token
- Vérifiez l'expiration (1h par défaut)

**3. "Limite atteinte"**
- Supprimez d'anciens QR codes
- Vérifiez le compteur en DB

**4. "Rate limit exceeded"**
- Attendez 60 secondes
- Utilisez un autre IP (VPN) pour tester

---

## 🚀 Prochaines Étapes

1. Tester tous les scénarios manuellement
2. Créer des tests automatisés (Jest/Playwright)
3. Configurer Wave CI en production
4. Implémenter webhooks Wave (callbacks)
5. Ajouter analytics des paiements

---

**Dernière mise à jour:** 2025-01-11
**Version:** 1.0.0
**Contact:** dev@ofika.com
