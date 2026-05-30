# ✅ Prix Centralisé - Résumé Rapide

## 🎯 Ce qui a été fait

Le prix de la carte NFC est maintenant **centralisé** dans une seule variable :

```bash
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600
```

**Changez cette valeur → Prix mis à jour partout ! 🚀**

---

## 📁 Fichiers créés/modifiés

### ✅ Configuration
- `env.example` - Variable `NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600`
- `lib/config/pricing.ts` - Module de pricing centralisé
- `supabase/migrations/20250110_add_pricing_config.sql` - Table BDD

### ✅ Pages & Composants
- `app/get-started/page.tsx` - Utilise `getRawPrice()`

### ✅ Scripts
- `scripts/sync-pricing.ts` - Synchronise .env ↔ BDD
- `package.json` - Ajout du script `npm run pricing:sync`

### ✅ Documentation
- `docs/CONFIGURATION_PRIX.md` - Guide complet
- `docs/PRIX_CENTRALISE_RESUME.md` - Ce fichier
- `docs/PRIX_XOF_UPDATE.md` - Changelog XOF

---

## 🚀 Utilisation rapide

### Changer le prix

#### 1. Modifier .env
```bash
# Dans .env ou .env.local
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=16000  # Nouveau prix
```

#### 2. Redémarrer le serveur
```bash
npm run dev
```

#### 3. Synchroniser avec la BDD (optionnel)
```bash
npm run pricing:sync
```

✅ **C'est tout ! Le prix est mis à jour partout.**

---

## 📊 Où le prix est utilisé ?

| Endroit | Comment |
|---------|---------|
| `/get-started` | Affiche automatiquement le bon prix |
| `lib/config/pricing.ts` | Source unique de vérité |
| BDD `pricing_config` | Pour les calculs SQL |
| Fonction `calculate_nfc_card_price()` | Utilise la config BDD |

---

## 🧪 Tests

### Tester le changement de prix

1. **Modifier** `.env` : `NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=20000`
2. **Redémarrer** : `npm run dev`
3. **Vérifier** : http://localhost:3000/get-started
4. **Résultat** : Le prix affiche "20 000 XOF" ✅

### Synchroniser avec la BDD

```bash
npm run pricing:sync
```

Output attendu :
```
🔄 Synchronisation des prix...
📊 Prix détecté dans .env: 14 600 XOF
📊 Prix actuel en BDD: 14 600 XOF
✅ Les prix sont déjà synchronisés !
```

---

## 📋 Fonctions disponibles

### Dans le code TypeScript

```typescript
import { 
  getRawPrice,        // Retourne : 14600
  getDisplayPrice,    // Retourne : "14 600 FCFA"
  calculateCardPrice, // Calcule prix + livraison
  formatPrice         // Formate un montant
} from '@/lib/config/pricing'

// Exemple d'utilisation
const price = getRawPrice()  // 14600
console.log(price.toLocaleString('fr-FR'))  // "14 600"
```

### Dans Supabase SQL

```sql
-- Récupérer le prix de base
SELECT get_nfc_card_base_price();  -- 14600

-- Calculer le prix total
SELECT calculate_nfc_card_price('design-classic', 1, 'CI');
-- Résultat: {"base_price": 14600, "total": 16600, ...}

-- Voir la configuration actuelle
SELECT * FROM v_current_pricing;
```

---

## ⚙️ Configuration avancée

### Modifier d'autres paramètres

En plus du prix de base, vous pouvez configurer :

```typescript
// Dans lib/config/pricing.ts
export const PREMIUM_DESIGN_SUPPLEMENT = 5000  // Supplément premium
export const SHIPPING_COSTS = {
  UEMOA: 2000,           // Livraison UEMOA
  WEST_AFRICA: 5000,     // Afrique de l'Ouest
  INTERNATIONAL: 10000   // International
}
```

### Mettre à jour la config BDD

```sql
UPDATE pricing_config 
SET 
  nfc_card_base_price = 15000,
  premium_supplement = 6000,
  shipping_uemoa = 2500
WHERE id = 'default';
```

---

## 🎓 Exemples pratiques

### Exemple 1 : Promotion temporaire

```bash
# Réduire le prix à 12 000 XOF
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=12000
```

```bash
npm run dev
npm run pricing:sync
```

### Exemple 2 : Prix différent par environnement

**.env.development**
```bash
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=14600  # Prix normal
```

**.env.production**
```bash
NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT=16000  # Prix prod
```

### Exemple 3 : Afficher le prix dans un composant

```typescript
import { getRawPrice } from '@/lib/config/pricing'

export function PriceDisplay() {
  const price = getRawPrice()
  
  return (
    <div>
      <span className="text-2xl font-bold">
        {price.toLocaleString('fr-FR')} XOF
      </span>
    </div>
  )
}
```

---

## ✅ Avantages de cette approche

1. **✅ Un seul endroit** - Changez `.env`, tout suit
2. **✅ Type-safe** - TypeScript vérifie les types
3. **✅ Flexible** - Frontend + Backend synchronisés
4. **✅ Auditable** - Historique des changements
5. **✅ Scalable** - Facile d'ajouter d'autres prix

---

## 🛠️ Commandes utiles

```bash
# Démarrer le serveur
npm run dev

# Synchroniser les prix
npm run pricing:sync

# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT

# Voir les prix en BDD (Supabase SQL Editor)
SELECT * FROM pricing_config;
SELECT * FROM v_current_pricing;
```

---

## 📌 Checklist rapide

Avant de déployer un changement de prix :

- [ ] Modifier `NEXT_PUBLIC_WAVE_DEFAULT_AMOUNT` dans `.env`
- [ ] Tester localement (`npm run dev`)
- [ ] Vérifier `/get-started` - prix correct
- [ ] Synchroniser BDD (`npm run pricing:sync`)
- [ ] Tester calcul SQL
- [ ] Commit & Deploy

---

## 🆘 Aide

### Le prix ne change pas sur /get-started ?

1. Vérifiez `.env` ou `.env.local`
2. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)
3. Videz le cache du navigateur (`Ctrl+Shift+R`)

### La fonction SQL retourne l'ancien prix ?

```bash
npm run pricing:sync
```

Ou manuellement en SQL :
```sql
UPDATE pricing_config 
SET nfc_card_base_price = 14600 
WHERE id = 'default';
```

---

**Créé le :** 10 Novembre 2025  
**Statut :** ✅ Production-ready  
**Maintenance :** Automatique via variable d'environnement
