# 💰 CONFIGURATION DU PRIX DYNAMIQUE

**Date :** 2025-11-09  
**Statut :** ✅ **CONFIGURÉ**

---

## 🎯 OBJECTIF

Utiliser la variable d'environnement `NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT` pour définir le prix de la carte NFC au lieu d'un montant codé en dur.

---

## 📝 FICHIERS MODIFIÉS

### **1. Types de paiement - Source du montant**
📁 `lib/types/payments.ts`

**AVANT ❌**
```typescript
export const CARD_PRICING = {
  nfc_qr: 14600,  // ❌ Montant codé en dur
  qr_only: 10000
} as const
```

**APRÈS ✅**
```typescript
// Montant par défaut depuis les variables d'environnement
const DEFAULT_AMOUNT = parseInt(
  process.env.NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT || '14600', 
  10
)

export const CARD_PRICING = {
  nfc_qr: DEFAULT_AMOUNT,  // ✅ Montant dynamique
  qr_only: 10000  // Obsolète
} as const
```

---

### **2. Page de commande - Affichage dynamique**
📁 `app/dashboard/orders/new/page.tsx`

**Titre - AVANT ❌**
```typescript
<p>Carte complète avec technologie NFC et QR Code - 14 600 XOF</p>
```

**Titre - APRÈS ✅**
```typescript
<p>
  Carte complète avec technologie NFC et QR Code - 
  {CARD_PRICING.nfc_qr.toLocaleString()} XOF
</p>
```

**Bouton - AVANT ❌**
```typescript
<Button>
  Payer 14 600 XOF via Wave CI 🌊
</Button>
```

**Bouton - APRÈS ✅**
```typescript
<Button>
  Payer {CARD_PRICING.nfc_qr.toLocaleString()} XOF via Wave 🌊
</Button>
```

---

## 🔧 CONFIGURATION

### **Variable d'environnement**

Dans votre fichier `.env` et `.env.example` :

```bash
# Prix par défaut de la carte NFC (en XOF)
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600
```

### **Comment changer le prix ?**

1. **Modifier le fichier `.env` :**
```bash
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=20000  # Nouveau prix
```

2. **Redémarrer l'application :**
```bash
npm run dev
```

3. **Le nouveau prix sera visible partout !**

---

## 📊 OÙ LE PRIX EST UTILISÉ

Le montant `CARD_PRICING.nfc_qr` est maintenant utilisé dans :

### **1. Page de commande**
```
/dashboard/orders/new
```
- Titre de la page
- Badge sur la carte produit
- Résumé de commande
- Bouton de paiement

### **2. Page de redirection Wave**
```
/payment/wave-redirect
```
- Détails de la commande
- Paramètre amount dans l'URL Wave

### **3. Autres pages**
- Dashboard des commandes
- Historique des paiements
- Statistiques

---

## ✅ AVANTAGES

### **1. Flexibilité**
- ✅ Changer le prix sans modifier le code
- ✅ Prix différents par environnement (dev, staging, prod)
- ✅ Facile à configurer

### **2. Maintenance**
- ✅ Un seul endroit à modifier (`.env`)
- ✅ Pas besoin de recompiler pour changer le prix
- ✅ Configuration centralisée

### **3. Déploiement**
- ✅ Variables d'environnement par environnement
- ✅ Dev : prix de test (ex: 100 XOF)
- ✅ Prod : prix réel (14 600 XOF)

---

## 🧪 TESTS

### **Test 1 : Vérifier le montant par défaut**
```bash
# Sans variable d'environnement
# Le prix sera 14 600 XOF (valeur par défaut)
```

### **Test 2 : Changer le prix**
```bash
# Dans .env
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=20000

# Redémarrer
npm run dev

# Vérifier sur /dashboard/orders/new
# Prix affiché : 20 000 XOF
```

### **Test 3 : Format d'affichage**
```typescript
// Le prix est formaté avec toLocaleString()
14600  → "14 600"   // Espace comme séparateur
20000  → "20 000"   // Toujours bien formaté
```

---

## 🔄 FLUX DE DONNÉES

```
.env
  ↓
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600
  ↓
lib/types/payments.ts
  ↓
const DEFAULT_AMOUNT = parseInt(process.env.NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT)
  ↓
CARD_PRICING.nfc_qr = DEFAULT_AMOUNT
  ↓
app/dashboard/orders/new/page.tsx
  ↓
{CARD_PRICING.nfc_qr.toLocaleString()} XOF
  ↓
AFFICHAGE : "14 600 XOF"
```

---

## 📝 NOTES IMPORTANTES

### **⚠️ Variables NEXT_PUBLIC_***
Les variables qui commencent par `NEXT_PUBLIC_` sont exposées au navigateur.
- ✅ Accessibles dans les composants React
- ✅ Incluses dans le bundle JavaScript
- ⚠️ Visibles côté client

### **🔒 Sécurité**
Le prix est une information publique, donc pas de problème de sécurité.

### **🔄 Redémarrage requis**
Après modification du `.env`, il faut redémarrer l'application :
```bash
npm run dev
```

---

## 🎯 RÉSULTAT

**Maintenant le prix :**
- ✅ Vient de `NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT`
- ✅ S'affiche dynamiquement partout
- ✅ Peut être changé sans toucher au code
- ✅ Format "14 600 XOF" avec espace

**Plus de montant codé en dur ! 💪**

---

## 📚 EXEMPLE DE CONFIGURATION

### **Développement (.env.development)**
```bash
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=100  # Prix test
```

### **Staging (.env.staging)**
```bash
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600  # Prix réel
```

### **Production (.env.production)**
```bash
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600  # Prix réel
```

---

*Document créé le : 2025-11-09*  
*Version : 1.0*  
*Statut : Configuré et fonctionnel*

**Le prix est maintenant dynamique et configurable ! 🎉**
