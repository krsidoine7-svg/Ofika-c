# 💰 Mise à jour - Prix en Franc CFA (XOF)

**Date :** 10 Novembre 2025  
**Changement :** Migration EUR → XOF

---

## 📊 Nouveau Prix

### Carte NFC Standard
- **Prix de base :** 14 600 XOF
- **Livraison :** 2 000 XOF (zone UEMOA)
- **Total :** 16 600 XOF

### Designs Premium (+5 000 XOF)
- Premium Métal : 19 600 XOF + livraison
- Premium Bois : 19 600 XOF + livraison

---

## 🗺️ Frais de Livraison par Zone

### Zone UEMOA (2 000 XOF)
- 🇨🇮 Côte d'Ivoire (CI)
- 🇸🇳 Sénégal (SN)
- 🇧🇯 Bénin (BJ)
- 🇧🇫 Burkina Faso (BF)
- 🇹🇬 Togo (TG)
- 🇳🇪 Niger (NE)
- 🇲🇱 Mali (ML)
- 🇬🇼 Guinée-Bissau (GW)

### Afrique de l'Ouest hors UEMOA (5 000 XOF)
- 🇬🇭 Ghana (GH)
- 🇳🇬 Nigeria (NG)
- 🇨🇲 Cameroun (CM)

### International (10 000 XOF)
- Tous les autres pays

---

## 📝 Fichiers Modifiés

### 1. Frontend
- ✅ `app/get-started/page.tsx` - Affichage "14 600 XOF"
- ✅ `app/get-started/README.md` - Documentation

### 2. Backend / SQL
- ✅ `supabase/migrations/20250110_create_onboarding_tables_fixed.sql`
  - Fonction `calculate_nfc_card_price()` mise à jour
  - Prix de base : 14600 XOF
  - Frais de livraison adaptés à l'Afrique de l'Ouest

### 3. Types TypeScript
- ✅ `lib/types/onboarding.ts`
  - Interface `PricingDetails` : `cents` → valeurs entières XOF
  - `NFCCardDesign` : price_modifier en XOF
  - Designs premium : +5000 XOF

### 4. Services
- ✅ `lib/services/onboarding.service.ts`
  - Fonction `formatPrice()` : gère XOF sans décimales
  - `calculatePrice()` : pays par défaut = 'CI' (Côte d'Ivoire)
  - Prix par défaut en cas d'erreur : 14600 XOF

---

## 🧮 Exemples de Calcul

### Commande Standard (CI)
```
Carte Classique    : 14 600 XOF
Livraison UEMOA    :  2 000 XOF
Taxes              :      0 XOF
─────────────────────────────────
TOTAL              : 16 600 XOF
```

### Commande Premium (SN)
```
Carte Premium Métal: 19 600 XOF
Livraison UEMOA    :  2 000 XOF
Taxes              :      0 XOF
─────────────────────────────────
TOTAL              : 21 600 XOF
```

### Commande International (FR)
```
Carte Classique    : 14 600 XOF
Livraison Intern.  : 10 000 XOF
Taxes              :      0 XOF
─────────────────────────────────
TOTAL              : 24 600 XOF
```

---

## 🔄 Migration BDD

Si la migration SQL a déjà été appliquée avec l'ancien prix EUR, réappliquez le fichier corrigé :

```sql
-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS calculate_nfc_card_price(TEXT, INTEGER, TEXT);

-- Réappliquer la migration corrigée
-- Copier-coller: supabase/migrations/20250110_create_onboarding_tables_fixed.sql
```

Ou simplement réexécuter tout le fichier `_fixed.sql` qui supprime et recrée tout.

---

## ✅ Test de la Fonction SQL

```sql
-- Test prix carte classique (CI)
SELECT calculate_nfc_card_price('design-classic', 1, 'CI');
-- Résultat attendu: {"base_price": 14600, "total": 16600, "currency": "XOF"}

-- Test prix carte premium (SN)
SELECT calculate_nfc_card_price('design-premium-metal', 1, 'SN');
-- Résultat attendu: {"base_price": 19600, "total": 21600, "currency": "XOF"}

-- Test livraison internationale (FR)
SELECT calculate_nfc_card_price('design-classic', 1, 'FR');
-- Résultat attendu: {"base_price": 14600, "total": 24600, "currency": "XOF"}
```

---

## 🎨 Affichage dans l'UI

### Format attendu
```typescript
formatPrice(14600, 'XOF')  // → "14 600 FCFA"
formatPrice(16600, 'XOF')  // → "16 600 FCFA"
```

### Page /get-started
```html
<span className="text-3xl font-bold">14 600 XOF</span>
<span className="text-gray-500">+ livraison</span>
```

---

## 📌 Notes Importantes

### TVA
Actuellement configurée à **0%** pour simplifier. À adapter selon les réglementations locales :
- CI : TVA 18%
- SN : TVA 18%
- Autres : Variable

### Devise
Le Franc CFA (XOF) est la devise de la zone UEMOA :
- 1 EUR ≈ 655 XOF (taux fixe)
- Pas de décimales (pas de centimes)

### Prochaines Étapes
- [ ] Intégration paiement (Wave, Orange Money, MTN Mobile Money)
- [ ] Gestion multi-devises (XOF, EUR, USD)
- [ ] Remises quantité (5+ cartes, 10+ cartes)

---

**Mis à jour le :** 10 Novembre 2025  
**Statut :** ✅ Appliqué
