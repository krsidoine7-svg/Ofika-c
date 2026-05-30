# 📊 ARCHITECTURE BASE DE DONNÉES - RÉSUMÉ EXÉCUTIF

**Projet** : Plateforme de Cartes de Visite Numériques OFIKA  
**Base de données** : PostgreSQL 15 (Supabase)  
**ORM** : Drizzle ORM  
**Date d'analyse** : 05/01/2025  
**Statut** : ⚠️ **Problèmes critiques détectés**

---

## 🎯 CONSTAT CRITIQUE

### 🚨 Incompatibilité de Type UUID vs TEXT

**Problème** : Le schéma SQL utilise le type natif `UUID` tandis que Drizzle ORM utilise `TEXT` avec génération manuelle d'UUID.

**Impact** :
- ❌ `drizzle-kit push` échoue avec des erreurs de conversion de type
- ❌ Les politiques RLS se cassent lors de la modification UUID→TEXT
- ❌ Impossible de synchroniser le schéma sans perte de données
- ⚠️ Dégradation des performances (UUID TEXT plus lent que UUID natif)

**Tables affectées** : TOUTES les 15 tables

**Cause racine** : Le schéma Drizzle a été généré avec TEXT au lieu du type UUID

---

## 📈 VUE D'ENSEMBLE DE LA BASE DE DONNÉES

### Statistiques

```
Total des tables :         15
Total des colonnes :       ~185
Relations (FK) :           23 clés étrangères
Index :                    47
Politiques RLS :           32
Fonctions :                12
Triggers :                 11
ENUMs :                    2 (profile_type, subscription_tier)
```

### Catégories de Tables

| Catégorie | Nombre | Tables |
|-----------|--------|--------|
| **Système central** | 3 | users, profiles, links |
| **Cartes de visite** | 2 | cards, card_designs |
| **E-Commerce** | 2 | orders, payment_methods |
| **Analytiques** | 2 | analytics_events, dashboard_widgets |
| **QR Codes** | 2 | qr_redirects, qr_scans |
| **Templates** | 2 | template_schemas, profile_template_data |
| **Système NFC** | 2 | nfc_profiles, nfc_cards |

---

## 🏗️ NOTE DE QUALITÉ DE L'ARCHITECTURE

### Global : 7,5/10

| Aspect | Note | Remarques |
|--------|------|-----------|
| **Conventions de nommage** | 9/10 | ✅ snake_case cohérent, noms clairs |
| **Relations** | 9/10 | ✅ FK bien définies avec CASCADE/RESTRICT |
| **Types de données** | 4/10 | ❌ Incompatibilité UUID/TEXT, incohérences VARCHAR |
| **Index** | 8/10 | ✅ Bonne couverture, GIN pour JSONB |
| **Sécurité (RLS)** | 9/10 | ✅ Politiques complètes, bonne isolation |
| **Normalisation** | 8/10 | ✅ Principalement en 3NF, peu de redondances |
| **Documentation** | 6/10 | ⚠️ Commentaires partiels, détails manquants |

---

## ✅ POINTS FORTS

### 1. **Excellent modèle de sécurité**
- Row Level Security (RLS) activé sur toutes les tables
- 32 politiques granulaires avec isolation utilisateur appropriée
- Contrôle de visibilité profil public/privé
- Analytiques QR sécurisées (public peut tracker, propriétaires voient détails)

### 2. **Relations bien conçues**
```
users (1) ─→ profiles (n) ─→ links (n)
                         └─→ analytics_events (n)
                         └─→ profile_template_data (1:1) ─→ template_schemas (n:1)
```
- Suppressions en cascade propres
- Utilisation appropriée de RESTRICT pour templates
- Aucune dépendance circulaire

### 3. **Système de templates flexible**
- Validation de schéma JSONB
- 8 templates prédéfinis (design1-7, influencer, ecommerce, freelance)
- Définitions de champs dynamiques
- Extensible sans changements de schéma

### 4. **Analytiques complètes**
- Suivi d'événements avec données appareil/localisation
- Analytiques de scan QR
- Comptage de clics sur les liens
- Configuration de widgets de tableau de bord

---

## ❌ PROBLÈMES CRITIQUES

### 1. **Incohérences de types** (BLOQUANT)

#### UUID vs TEXT
```sql
-- Schéma SQL (CORRECT)
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Schéma Drizzle (INCORRECT)
id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID())
```

**Conséquences** :
- Impossible d'exécuter `drizzle-kit push` sans perte de données
- Erreurs de conversion de type dans les politiques RLS
- Impact sur les performances (UUID natif est optimisé)

**Correction nécessaire** : Régénérer le schéma Drizzle avec le type UUID approprié

---

### 2. **Colonnes redondantes**

#### Table links
```sql
order_index INTEGER DEFAULT 0 NOT NULL,  -- GARDER CELLE-CI
position INTEGER DEFAULT 0,              -- SUPPRIMER CELLE-CI (redondante)
```

**Correction** : Supprimer la colonne `position`, utiliser exclusivement `order_index`

---

### 3. **Index manquants**

```sql
-- À ajouter :
CREATE INDEX idx_profiles_design_choice ON profiles(design_choice);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_nfc_cards_card_type ON nfc_cards(card_type);
```

---

### 4. **Incohérences de longueur VARCHAR**

Plusieurs colonnes utilisent TEXT alors que VARCHAR avec limites serait mieux :

```sql
-- qr_redirects
short_code TEXT              -- Devrait être VARCHAR(20)
redirect_type TEXT           -- Devrait être VARCHAR(50)

-- qr_scans  
device_type TEXT             -- Devrait être VARCHAR(20)
browser TEXT                 -- Devrait être VARCHAR(50)
```

---

## ⚠️ AVERTISSEMENTS

### 1. **Colonnes dépréciées en production**

Les colonnes suivantes existent en production mais pas dans Drizzle :
- `profiles.company`
- `profiles.full_name`
- `profiles.job_title`
- `profiles.cover_image_url`
- `users.email_verified`
- `users.consent_*` champs

**Risque** : Les données existent mais l'ORM ne les connaît pas

---

### 2. **Application des règles métier**

Certaines règles uniquement dans les triggers, pas dans les contraintes :
```sql
-- Utilisateurs limités à 2 cartes
-- Appliqué par trigger, mais aussi besoin de CHECK sur table users
CHECK (cards_ordered <= 2)  -- ✅ Existe
-- Mais création de commande par trigger peut être contournée via SQL
```

---

### 3. **Validation JSONB**

Bien que `template_schemas.schema` ait une validation, les autres colonnes JSONB n'en ont pas :
- `profiles.custom_links` - Pas de validation de structure
- `orders.shipping_address` - Pas de vérification des champs requis
- `card_designs.front_design` - Pas de validation de schéma

**Recommandation** : Ajouter des contraintes CHECK avec fonctions de validation

---

## 📊 DIAGRAMME DES RELATIONS

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                               │
│  • Table centrale auth/comptes                             │
│  • 1 utilisateur → plusieurs profils                       │
└────┬────────────────────────────────────────────────────────┘
     │
     ├──→ profiles (n)
     │      ├──→ links (n)
     │      ├──→ analytics_events (n)
     │      ├──→ cards (n)
     │      └──→ profile_template_data (1:1)
     │             └──→ template_schemas (n:1)
     │
     ├──→ orders (n)
     ├──→ payment_methods (n)
     ├──→ dashboard_widgets (n)
     ├──→ qr_redirects (n)
     │      └──→ qr_scans (n)
     ├──→ nfc_profiles (n)
     │      └──→ nfc_cards (n)
     └──→ cards (n)
            └──→ card_designs (1:1)
```

---

## 🎯 ACTIONS IMMÉDIATES REQUISES

### Priorité 1 : CRITIQUE (À faire maintenant)

1. **Corriger l'incompatibilité de type UUID**
   ```bash
   # NE PAS utiliser drizzle-kit push tant que c'est pas corrigé
   # Régénérer le schéma avec le type UUID
   ```

2. **Supprimer les colonnes redondantes**
   ```sql
   ALTER TABLE links DROP COLUMN position;
   ```

3. **Ajouter les index manquants**
   ```sql
   CREATE INDEX idx_profiles_design_choice ON profiles(design_choice);
   CREATE INDEX idx_orders_payment_status ON orders(payment_status);
   ```

### Priorité 2 : HAUTE (Cette semaine)

4. **Standardiser les types VARCHAR**
   - Convertir TEXT en VARCHAR où approprié
   - Documenter dans fichier de migration

5. **Ajouter validation JSONB**
   - Créer fonctions de validation
   - Ajouter contraintes CHECK

6. **Documenter colonnes dépréciées**
   - Créer plan de migration
   - Archiver ou supprimer champs inutilisés

### Priorité 3 : MOYENNE (Ce mois)

7. **Optimisation des performances**
   - Analyser requêtes lentes
   - Ajouter index composites
   - Considérer vues matérialisées pour analytiques

8. **Compléter la documentation**
   - Ajouter COMMENTs à toutes les tables
   - Documenter toutes les structures JSONB
   - Créer diagrammes ER

---

## 📝 RECOMMANDATION : STRATÉGIE DE WORKFLOW

### ✅ APPROCHE RECOMMANDÉE

**Utiliser Supabase pour la gestion du schéma + Drizzle pour les requêtes**

```typescript
// ✅ BON : Utiliser Drizzle pour requêtes type-safe
import { db } from '@/lib/db';
import { profiles } from '@/drizzle/schema';

const userProfiles = await db.select().from(profiles)
  .where(eq(profiles.userId, userId));
```

```sql
-- ✅ BON : Gérer le schéma avec migrations Supabase
-- supabase/migrations/20250106_ajouter_colonne.sql
ALTER TABLE profiles ADD COLUMN nouveau_champ TEXT;
```

```bash
# ❌ MAUVAIS : Ne PAS utiliser pour sync schéma
npm run db:push  # Va causer perte de données !
```

### Pourquoi cette approche ?

1. **Migrations Supabase** = SQL testé en production
2. **Drizzle ORM** = Requêtes type-safe + relations
3. **Pas de conflits de sync** = Mises à jour manuelles dans les deux endroits
4. **Pas de risque de perte de données** = Jamais de sync auto

---

## 🎊 CONCLUSION

La base de données OFIKA est **bien architecturée** avec excellente sécurité et relations, mais a des **incohérences de types critiques** qui empêchent la synchronisation du schéma ORM.

### Prochaines étapes :

1. ✅ **Continuer à utiliser Drizzle pour les requêtes** (ça marche très bien !)
2. ❌ **Ne jamais exécuter `drizzle-kit push`** (va détruire les données)
3. 🔧 **Corriger les types UUID** dans le schéma Drizzle (pour précision)
4. 📝 **Utiliser les migrations Supabase** pour changements de schéma
5. 🧹 **Nettoyer les redondances** (colonne position, etc.)

**La base de données est prête pour la production avec ces réserves en tête.**

---

**Rapport généré** : 05/01/2025  
**Analyste** : Cascade AI - Expert en Architecture de Base de Données  
**Statut de révision** : Prêt pour l'implémentation
