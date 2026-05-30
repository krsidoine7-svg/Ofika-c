# 🧪 Guide de Test Complet - Ofika

## 📋 Table des Matières

1. [Configuration Wave CI](#configuration-wave-ci)
2. [Test des Endpoints API](#test-des-endpoints-api)
3. [Test du Flow Onboarding](#test-du-flow-onboarding)
4. [Test des Paiements Wave](#test-des-paiements-wave)
5. [Test des Limites](#test-des-limites)
6. [Outils de Test](#outils-de-test)

---

## 🌊 Configuration Wave CI

### Variables d'Environnement

Vérifiez votre fichier `.env` :

```bash
# Wave CI Configuration
NEXT_PUBLIC_WAVE_MERCHANT_ID=votre_merchant_id
NEXT_PUBLIC_WAVE_COUNTRY_CODE=ci
NEXT_PUBLIC_WAVE_SUCCESS_URL=http://localhost:3000/payment/success
NEXT_PUBLIC_WAVE_FAILURE_URL=http://localhost:3000/payment/cancelled

# URLs Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vérifier la Configuration

```bash
# Terminal
curl http://localhost:3000/api/payments/wave/create

# Réponse attendue:
{
  "success": true,
  "message": "Wave CI Payment API - Opérationnel",
  "provider": "Wave CI",
  "merchant_id": "votre_merchant_id"
}
```

---

## 🔌 Test des Endpoints API

### 1. Test Onboarding - Save Temp

**Sans authentification** (utilisateur non connecté)

```bash
# Sauvegarder les données temporaires
curl -X POST http://localhost:3000/api/onboarding/save-temp \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session-123",
    "flow_type": "public_page",
    "step": 1,
    "data": {
      "name": "Test User",
      "email": "test@example.com",
      "bio": "Je teste l'\''onboarding"
    },
    "user_email": "test@example.com"
  }'

# Réponse attendue:
{
  "success": true,
  "data": {
    "session_id": "test-session-123",
    "flow_type": "public_page",
    "current_step": 1,
    "payload": {...}
  },
  "message": "Données sauvegardées avec succès"
}
```

**Récupérer les données:**
```bash
curl http://localhost:3000/api/onboarding/save-temp?session_id=test-session-123
```

---

### 2. Test Onboarding - Finalize

**Avec authentification** (après signup)

```bash
# D'abord, obtenir votre token Supabase
# 1. Connectez-vous sur http://localhost:3000/auth/login
# 2. Ouvrez la console du navigateur
# 3. Exécutez:
#    const { data } = await supabase.auth.getSession()
#    console.log(data.session.access_token)

# Ensuite, finaliser l'onboarding
curl -X POST http://localhost:3000/api/onboarding/finalize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -d '{
    "session_id": "test-session-123",
    "flow_type": "public_page"
  }'

# Réponse attendue:
{
  "success": true,
  "result": {
    "type": "profile",
    "data": {
      "id": "uuid",
      "name": "Test User",
      "username": "testuser",
      "custom_url": "testuser"
    }
  },
  "message": "Onboarding finalisé avec succès"
}
```

---

### 3. Test Orders - Create

```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -d '{
    "product_type": "nfc_card",
    "quantity": 1,
    "shipping_address": {
      "full_name": "Jean Dupont",
      "address_line1": "123 Avenue de la République",
      "city": "Abidjan",
      "postal_code": "00225",
      "country": "Côte d'\''Ivoire",
      "phone": "+225 07 12 34 56 78"
    }
  }'

# Réponse attendue:
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_number": "ORD-1234567890-ABC123",
    "total_amount": 15000,
    "currency": "XOF",
    "status": "pending"
  }
}
```

**Récupérer vos commandes:**
```bash
curl http://localhost:3000/api/orders/create \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

### 4. Test QR Codes (avec limite de 7)

```bash
# Créer un QR code
curl -X POST http://localhost:3000/api/qr-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -d '{
    "nfc_link": "https://example.com",
    "redirect_type": "custom",
    "title": "Mon site web",
    "description": "Visitez mon site"
  }'

# Tester la limite (créez 8 QR codes)
# Le 8ème devrait échouer avec:
{
  "success": false,
  "error": "Limite atteinte : vous ne pouvez créer que 7 QR codes maximum. Supprimez-en un pour en créer un nouveau."
}
```

---

## 🎯 Test du Flow Onboarding Complet

### Scénario 1 : Utilisateur NON Authentifié

**1. Accédez à la page:**
```
http://localhost:3000/get-started
```

**2. Cliquez sur "Créer ma page publique"**

**3. Remplissez le formulaire:**
- Nom complet: Jean Dupont
- Bio: Designer graphique freelance
- Email: jean@example.com
- Téléphone: +225 07 12 34 56 78
- URL personnalisée: jeandupont

**4. Vérifiez localStorage:**
```javascript
// Console du navigateur
console.log(localStorage.getItem('pendingProfileData'))
```

**5. Cliquez "Continuer"** → Redirection vers `/auth/signup`

**6. Créez un compte**

**7. Vérification automatique:**
- Les données doivent être récupérées
- Le profil doit être créé automatiquement
- Redirection vers sélection de template

---

### Scénario 2 : Utilisateur AUTHENTIFIÉ

**1. Connectez-vous d'abord:**
```
http://localhost:3000/auth/login
```

**2. Accédez au dashboard:**
```
http://localhost:3000/dashboard/profiles/create
```

**3. Créez un profil directement** (pas de sauvegarde localStorage)

---

## 💳 Test des Paiements Wave

### Flow Complet de Paiement

**1. Créer une commande:**
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "product_type": "nfc_card",
    "quantity": 1,
    "shipping_address": {
      "full_name": "Jean Dupont",
      "address_line1": "123 Avenue",
      "city": "Abidjan",
      "postal_code": "00225",
      "country": "Côte d'\''Ivoire",
      "phone": "+225 07 12 34 56 78"
    },
    "promo_code": "WELCOME10"
  }'

# Notez l'order_id dans la réponse
```

**2. Initier le paiement Wave:**
```bash
curl -X POST http://localhost:3000/api/payments/wave/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "amount": 13500,
    "currency": "XOF",
    "description": "Carte NFC Ofika",
    "order_id": "VOTRE_ORDER_ID",
    "success_url": "http://localhost:3000/payment/success",
    "failure_url": "http://localhost:3000/payment/cancelled"
  }'

# Réponse:
{
  "success": true,
  "data": {
    "payment_id": "pay_xxx",
    "payment_url": "https://pay.wave.com/...",
    "amount": 13500,
    "currency": "XOF"
  }
}
```

**3. Ouvrir le lien de paiement** dans le navigateur

**4. Simuler le paiement** (mode test Wave)

**5. Vérifier la redirection** vers `/payment/success`

---

## 🔒 Test des Limites

### Test Rate Limiting

**Envoyez plusieurs requêtes rapidement:**

```bash
# Script pour tester le rate limiting
for i in {1..30}; do
  echo "Requête $i"
  curl -X POST http://localhost:3000/api/orders/create \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer VOTRE_TOKEN" \
    -d '{"product_type":"nfc_card","quantity":1}' &
done
wait

# Après 5 requêtes, vous devriez recevoir:
{
  "error": "Trop de requêtes. Veuillez réessayer dans une minute.",
  "resetAt": 1640995200000
}
```

**Headers de réponse:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200000
Retry-After: 60
```

---

### Test Limites de Profils

**1. Créez 4 réseaux sociaux:**
```javascript
// Dans le formulaire ProfileForm
social_links: [
  { platform: 'instagram', url: 'https://instagram.com/user1' },
  { platform: 'facebook', url: 'https://facebook.com/user1' },
  { platform: 'twitter', url: 'https://twitter.com/user1' },
  { platform: 'linkedin', url: 'https://linkedin.com/in/user1' }
]
```

**2. Essayez d'ajouter un 5ème** → Bouton désactivé + message:
```
⚠️ Limite atteinte : 4 réseaux sociaux maximum
```

**3. Même chose pour les liens personnalisés** (max 4)

---

### Test Limite QR Codes (7 max)

**Script de test:**
```bash
#!/bin/bash
TOKEN="VOTRE_TOKEN"

for i in {1..8}; do
  echo "Création QR Code $i"
  
  curl -X POST http://localhost:3000/api/qr-codes \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"nfc_link\": \"https://example.com/page$i\",
      \"redirect_type\": \"custom\",
      \"title\": \"QR Code $i\"
    }"
  
  echo ""
done

# Le 8ème devrait échouer
```

---

## 🛠️ Outils de Test

### 1. Page de Test Interactive

**Accédez à:**
```
http://localhost:3000/test-comparison
```

**Fonctionnalités:**
- Comparer V1 vs NFC Wizard
- Tester les flows d'onboarding
- Voir les données en temps réel

---

### 2. Postman Collection

**Créez une collection avec ces endpoints:**

```json
{
  "info": {
    "name": "Ofika API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Onboarding - Save Temp",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"session_id\": \"{{$guid}}\",\n  \"flow_type\": \"public_page\",\n  \"step\": 1,\n  \"data\": {\n    \"name\": \"Test User\"\n  }\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/onboarding/save-temp",
          "host": ["{{baseUrl}}"],
          "path": ["api", "onboarding", "save-temp"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

### 3. Script Node.js de Test

```javascript
// test-endpoints.js
const BASE_URL = 'http://localhost:3000'
let authToken = ''

async function testOnboarding() {
  console.log('🧪 Test Onboarding - Save Temp')
  
  const sessionId = `test-${Date.now()}`
  
  const response = await fetch(`${BASE_URL}/api/onboarding/save-temp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      flow_type: 'public_page',
      step: 1,
      data: { name: 'Test User' }
    })
  })
  
  const data = await response.json()
  console.log('✅ Résultat:', data)
  
  return sessionId
}

async function testOrders(token) {
  console.log('🧪 Test Orders - Create')
  
  const response = await fetch(`${BASE_URL}/api/orders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      product_type: 'nfc_card',
      quantity: 1,
      shipping_address: {
        full_name: 'Test User',
        address_line1: '123 Test St',
        city: 'Abidjan',
        postal_code: '00225',
        country: 'CI',
        phone: '+225 07 12 34 56 78'
      }
    })
  })
  
  const data = await response.json()
  console.log('✅ Résultat:', data)
}

// Exécuter les tests
async function runTests() {
  try {
    await testOnboarding()
    // await testOrders(authToken) // Nécessite un token
    
    console.log('✅ Tous les tests terminés')
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

runTests()
```

**Exécuter:**
```bash
node test-endpoints.js
```

---

## 📊 Checklist de Test

### ✅ Endpoints API

- [ ] POST `/api/onboarding/save-temp` (rate limit OK)
- [ ] GET `/api/onboarding/save-temp?session_id=xxx`
- [ ] POST `/api/onboarding/finalize` (auth OK)
- [ ] POST `/api/orders/create` (auth + validation OK)
- [ ] GET `/api/orders/create` (liste commandes)
- [ ] GET `/api/payments/wave/create` (config check)
- [ ] POST `/api/payments/wave/create` (paiement)

### ✅ Limites

- [ ] 4 réseaux sociaux max (UI bloqué)
- [ ] 4 liens personnalisés max (UI bloqué)
- [ ] 7 QR codes max (API erreur)
- [ ] Rate limiting 5 req/min (orders)
- [ ] Rate limiting 10 req/min (onboarding)
- [ ] Rate limiting 20 req/min (save-temp)

### ✅ Flow Onboarding

- [ ] User non auth → localStorage → signup → finalize
- [ ] User auth → création directe
- [ ] Récupération après signup
- [ ] Sélection template
- [ ] Page succès

### ✅ Paiements Wave

- [ ] Génération lien paiement
- [ ] Redirection Wave
- [ ] Success callback
- [ ] Failure callback
- [ ] Update order status

---

## 🐛 Debugging

### Logs Serveur

```bash
# Terminal où tourne npm run dev
# Recherchez:
🌊 API Route Wave CI - Création de paiement
✅ Lien de paiement Wave CI créé
❌ Erreur dans l'API Route
```

### Logs Client

```javascript
// Console navigateur
console.log('Auth token:', await supabase.auth.getSession())
console.log('localStorage:', localStorage.getItem('pendingProfileData'))
```

### Database Supabase

```sql
-- Vérifier les pending_creations
SELECT * FROM pending_creations 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Vérifier les orders
SELECT * FROM orders 
WHERE user_id = 'votre_user_id'
ORDER BY created_at DESC;

-- Vérifier les QR codes
SELECT COUNT(*) as qr_count 
FROM qr_redirects 
WHERE user_id = 'votre_user_id';
```

---

## 🎯 Scénarios de Test Recommandés

### Scénario A : Nouveau Utilisateur

1. Visite `/get-started`
2. Clique "Créer ma page publique"
3. Remplit formulaire (nom, email, bio)
4. Ajoute 2 réseaux sociaux
5. Clique Continuer → Signup
6. Crée compte
7. Redirection automatique → Template
8. Sélectionne template
9. Page succès

**✅ Attendu:** Profil créé avec tous les champs

---

### Scénario B : Commander Carte NFC

1. Login
2. Va sur `/onboarding/nfc-card`
3. Complète wizard
4. Arrive à `/onboarding/card-order`
5. Remplit adresse
6. Clique "Commander maintenant"
7. API crée commande
8. API génère lien Wave
9. Redirection Wave
10. Paiement test
11. Retour sur `/payment/success`

**✅ Attendu:** Order créé, payment_id enregistré

---

### Scénario C : Test Limites

1. Login
2. Va sur `/dashboard/profiles/create`
3. Ajoute 4 réseaux sociaux ✅
4. Essaie d'ajouter 5ème → Bloqué ❌
5. Va sur `/dashboard/qr-codes/new`
6. Crée 7 QR codes ✅
7. Essaie 8ème → Erreur API ❌

**✅ Attendu:** Limites respectées

---

## 📖 Ressources

- **API Documentation:** `/docs/API_ENDPOINTS.md`
- **Onboarding Comparison:** `/docs/COMPARAISON_SYSTEMES_ONBOARDING.md`
- **Test Page:** `http://localhost:3000/test-comparison`

---

**Dernière mise à jour:** 2025-01-11
**Version:** 1.0.0
