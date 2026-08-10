# 🌊 GUIDE DE CONFIGURATION WAVE CI

## 📋 Introduction

Ce guide vous accompagne dans la configuration de Wave CI comme système de paiement pour votre application Ofika. Wave CI est une plateforme de paiement mobile money sécurisée opérant en Côte d'Ivoire et en Afrique de l'Ouest.

---

## 🔧 ÉTAPE 1 : Configuration des Variables d'Environnement

### 1.1 Créer le fichier .env

Si vous n'avez pas encore de fichier `.env`, créez-le à la racine du projet :

```bash
# Sur Windows (PowerShell)
Copy-Item env.example .env

# Sur Linux/Mac
cp env.example .env
```

### 1.2 Variables Wave CI Obligatoires

Ouvrez votre fichier `.env` et ajoutez/modifiez les variables suivantes :

```bash
# ========================================
# WAVE CI - CONFIGURATION PAIEMENTS
# ========================================

# URL de base Wave CI (NE PAS MODIFIER)
NEXT_PUBLIC_WAVE_BASE_URL=https://pay.wave.com/m

# ID Marchand Wave CI (fourni par Wave lors de l'inscription)
NEXT_PUBLIC_WAVE_MERCHANT_ID=M_ci_8a

# Code pays (selon votre localisation)
# ci = Côte d'Ivoire
# sn = Sénégal  
# bf = Burkina Faso
# ml = Mali
NEXT_PUBLIC_WAVE_COUNTRY_CODE=ci

# Montant par défaut pour les tests (en XOF)
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=1000
```

### 1.3 Comment Obtenir votre ID Marchand Wave CI

**Option 1 : Compte Wave Business Existant**
1. Connectez-vous à votre compte Wave Business
2. Accédez à "Paramètres" > "Informations du compte"
3. Copiez votre ID Marchand (format: `M_ci_XXXXX`)

**Option 2 : Créer un Compte Wave Business**
1. Visitez https://www.wave.com/business
2. Inscrivez-vous avec votre numéro de téléphone
3. Complétez la vérification d'identité
4. Votre ID Marchand sera généré automatiquement

**Option 3 : Mode Test (Développement)**
- Utilisez l'ID de test fourni : `M_ci_8a`
- ⚠️ Ne pas utiliser en production !

---

## 🔍 ÉTAPE 2 : Vérification de la Configuration

### 2.1 Test de Configuration Automatique

Exécutez ce script pour vérifier votre configuration :

```typescript
// test-wave-config.ts
import { testWaveConfiguration } from '@/lib/services/wave-payment'

const result = testWaveConfiguration()

console.log('✅ Configuration Wave CI:')
console.log('- Configuré:', result.configured)
console.log('- Merchant ID:', result.config.merchantId)
console.log('- Pays:', result.config.countryCode)
console.log('- Lien de test:', result.testLink)
```

### 2.2 Test Manuel

Ouvrez votre navigateur et accédez à :

```
https://pay.wave.com/m/[VOTRE_MERCHANT_ID]/c/ci/?amount=1000
```

Remplacez `[VOTRE_MERCHANT_ID]` par votre vrai ID marchand.

**Résultat attendu :**
- ✅ La page Wave CI s'affiche avec le formulaire de paiement
- ✅ Le montant de 1000 XOF est visible
- ❌ Si erreur 404 : Vérifiez votre Merchant ID

---

## 🚀 ÉTAPE 3 : Démarrer l'Application

### 3.1 Installation des Dépendances

```bash
npm install
# ou
pnpm install
```

### 3.2 Lancer le Serveur de Développement

```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible à : http://localhost:3000

### 3.3 Tester un Paiement

1. Accédez à la page de commande : `http://localhost:3000/dashboard/orders/new`
2. Sélectionnez un type de carte
3. Cliquez sur "Payer avec Wave CI"
4. Vous serez redirigé vers Wave CI avec le montant correct

---

## 🔐 ÉTAPE 4 : Sécurité et Production

### 4.1 Variables d'Environnement en Production

**Sur Vercel :**
1. Allez dans "Settings" > "Environment Variables"
2. Ajoutez chaque variable Wave CI
3. Sélectionnez "Production" comme environnement
4. Cliquez sur "Save"

**Sur Netlify :**
1. Allez dans "Site settings" > "Environment variables"
2. Ajoutez chaque variable avec "Add a variable"
3. Déployez à nouveau votre site

### 4.2 Liste de Vérification Sécurité

- [ ] ✅ Merchant ID réel configuré (pas le ID de test)
- [ ] ✅ Fichier `.env` dans le `.gitignore`
- [ ] ✅ Variables d'environnement configurées sur la plateforme de déploiement
- [ ] ✅ HTTPS activé en production
- [ ] ✅ URLs de redirection correctes (success/failure)
- [ ] ⚠️ Ne jamais exposer les variables d'environnement dans le code frontend

---

## 📊 ÉTAPE 5 : Configuration de la Base de Données

### 5.1 Ajouter les Colonnes Wave CI

Exécutez cette migration SQL dans Supabase :

```sql
-- Ajouter les colonnes Wave CI à la table orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS wave_payment_id TEXT,
ADD COLUMN IF NOT EXISTS wave_payment_url TEXT;

-- Créer un index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_orders_wave_payment_id 
ON orders(wave_payment_id);

-- Ajouter des commentaires
COMMENT ON COLUMN orders.wave_payment_id IS 'ID unique du paiement Wave CI';
COMMENT ON COLUMN orders.wave_payment_url IS 'URL de paiement Wave CI générée';
```

### 5.2 Vérification

```sql
-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name LIKE 'wave%';
```

---

## 🧪 ÉTAPE 6 : Tests

### 6.1 Test de Génération de Lien

```typescript
import { generateWavePaymentLink } from '@/lib/services/wave-payment'

// Test simple
const payment = generateWavePaymentLink(14600, 'test-order-123')

console.log('Payment URL:', payment.payment_url)
// Résultat attendu: https://pay.wave.com/m/M_ci_8a/c/ci/?amount=14600
```

### 6.2 Test de Création de Commande

```typescript
import { createOrder } from '@/lib/services/payments-wave'

const orderData = {
  profile_id: 'votre-profile-id',
  card_type: 'nfc_qr',
  quantity: 1,
  shipping_address: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+225 0123456789',
    address: '123 Rue Test',
    city: 'Abidjan',
    postalCode: '00225'
  }
}

const result = await createOrder(orderData)
console.log('Order created:', result.success)
console.log('Wave payment URL:', result.data?.wave_payment_url)
```

---

## 🎯 ÉTAPE 7 : Flux de Paiement Complet

### Architecture du Flux

```
1. Utilisateur → Crée une commande
   ↓
2. Système → Génère un lien Wave CI
   ↓
3. Système → Sauvegarde le lien dans la BDD
   ↓
4. Utilisateur → Clique sur "Payer avec Wave CI"
   ↓
5. Redirection → Page Wave CI (pay.wave.com)
   ↓
6. Utilisateur → Effectue le paiement
   ↓
7. Wave CI → Redirige vers URL de succès
   ↓
8. Système → Affiche confirmation
   ↓
9. Admin → Confirme manuellement le paiement
```

### URLs de Redirection

Configurez ces URLs dans votre `.env` :

```bash
# URL de l'application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com

# Les URLs de redirection seront générées automatiquement:
# - Succès: {APP_URL}/payment/success/{order_id}
# - Échec: {APP_URL}/payment/cancelled
```

---

## ❓ FAQ & Dépannage

### Q: Le lien Wave CI ne fonctionne pas

**Vérifications :**
1. Merchant ID correct dans `.env`
2. Code pays correct (`ci`, `sn`, `bf`, ou `ml`)
3. Montant supérieur à 0
4. Format d'URL correct : `https://pay.wave.com/m/[MERCHANT_ID]/c/[COUNTRY]/?amount=[AMOUNT]`

### Q: Comment confirmer un paiement ?

Wave CI pour les comptes Business standards ne supporte pas les webhooks automatiques. Vous devez :
1. Demander à l'utilisateur de confirmer le paiement
2. Vérifier manuellement dans votre dashboard Wave
3. Mettre à jour le statut de la commande manuellement

### Q: Puis-je tester sans compte Wave ?

Oui, utilisez l'ID de test `M_ci_8a` pour générer des liens. Cependant, les paiements ne seront pas réellement traités.

### Q: Différences avec Wave ?

| Fonctionnalité | Wave | Wave CI |
|---|---|---|
| API Backend | ✅ Oui | ❌ Non (liens directs) |
| Webhooks | ✅ Oui | ❌ Non (manuel) |
| Configuration | Complexe | Simple |
| Frais | 2.5% | ~1% |

---

## 📞 Support

**Problèmes techniques :**
- Consultez la documentation dans `/docs`
- Vérifiez les logs de l'application

**Support Wave CI :**
- Email: support@wave.com
- Site: https://www.wave.com/support

---

## ✅ Checklist de Mise en Production

Avant de déployer en production, vérifiez :

- [ ] ✅ Merchant ID réel configuré
- [ ] ✅ Variables d'environnement en production
- [ ] ✅ Base de données migrée (colonnes `wave_payment_*`)
- [ ] ✅ Tests de paiement effectués
- [ ] ✅ URLs de redirection correctes
- [ ] ✅ HTTPS activé
- [ ] ✅ Monitoring des erreurs configuré
- [ ] ✅ Documentation équipe à jour
- [ ] ✅ Processus de confirmation manuelle défini
- [ ] ✅ Support client formé

---

## 🎉 Félicitations !

Votre intégration Wave CI est maintenant configurée et prête à l'emploi !

Pour toute question supplémentaire, consultez la documentation complète dans `/docs/WAVE_CI_INTEGRATION.md`
