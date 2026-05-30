# 🚀 Guide d'Optimisation des Performances de la Base de Données

## 📋 Problèmes Identifiés

Votre base de données Supabase présente des problèmes de performance identifiés par le linter :

### 1. **Clés Étrangères Non Indexées** (INFO)
- Impact sur les performances des requêtes avec jointures
- Tables concernées : `analytics_events`, `cards`, `dashboard_widgets`, `links`, `orders`, `profiles`

### 2. **Politiques RLS Non Optimisées** (WARN)
- Réévaluation inutile des fonctions `auth.uid()` pour chaque ligne
- Impact significatif sur les performances à grande échelle

### 3. **Politiques RLS Multiples** (WARN)
- Plusieurs politiques permissives pour le même rôle et action
- Exécution de toutes les politiques pour chaque requête

## 🔧 Solutions Appliquées

### ✅ 1. Index pour les Clés Étrangères

**Avant :**
```sql
-- Pas d'index sur les clés étrangères
-- Requêtes lentes sur les jointures
```

**Après :**
```sql
-- Index optimisés pour toutes les clés étrangères
CREATE INDEX "profiles_userId_idx" ON public.profiles(userId);
CREATE INDEX "links_profileId_idx" ON public.links(profileId);
CREATE INDEX "cards_userId_idx" ON public.cards(userId);
CREATE INDEX "cards_profileId_idx" ON public.cards(profileId);
-- ... et plus
```

### ✅ 2. Politiques RLS Optimisées

**Avant :**
```sql
-- Réévaluation pour chaque ligne (LENT)
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
```

**Après :**
```sql
-- Évaluation une seule fois (RAPIDE)
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);
```

### ✅ 3. Politiques Consolidées

**Avant :**
```sql
-- Plusieurs politiques pour le même rôle
CREATE POLICY "Public can view active links" ON public.links FOR SELECT USING (isActive = true);
CREATE POLICY "Users can view links of their own profiles" ON public.links FOR SELECT USING (...);
```

**Après :**
```sql
-- Politiques optimisées et consolidées
-- Une seule politique par action et rôle
```

## 🚀 Comment Appliquer les Corrections

### Option 1 : Script Automatique (Recommandé)

```bash
# 1. Appliquer toutes les corrections
npm run db:optimize apply

# 2. Pousser les changements Prisma
npm run db:push

# 3. Vérifier les performances
npm run db:check
```

### Option 2 : Étapes Manuelles

```bash
# 1. Générer la migration Prisma
npx prisma db push

# 2. Exécuter le script SQL d'optimisation
npx tsx scripts/apply-performance-fixes.ts sql

# 3. Vérifier les performances
npx tsx scripts/apply-performance-fixes.ts check
```

### Option 3 : Via Supabase Dashboard

1. Allez dans **SQL Editor** de votre projet Supabase
2. Copiez le contenu de `scripts/optimize-rls-policies.sql`
3. Exécutez le script

## 📊 Vérification des Performances

### Tests Automatiques

```bash
# Exécuter les tests de performance
npm run db:check
```

### Tests Manuels

```sql
-- Test 1: Requête simple
EXPLAIN ANALYZE SELECT * FROM profiles WHERE isActive = true LIMIT 10;

-- Test 2: Requête avec jointure
EXPLAIN ANALYZE 
SELECT p.*, l.title, l.url 
FROM profiles p 
LEFT JOIN links l ON p.id = l.profileId 
WHERE p.isActive = true 
LIMIT 10;

-- Test 3: Requête analytique
EXPLAIN ANALYZE
SELECT eventType, COUNT(*) 
FROM analytics_events 
WHERE createdAt >= NOW() - INTERVAL '7 days'
GROUP BY eventType;
```

## 🎯 Résultats Attendus

### Avant Optimisation
- ⚠️ Requêtes lentes sur les jointures
- ⚠️ Réévaluation des fonctions auth pour chaque ligne
- ⚠️ Politiques RLS multiples exécutées

### Après Optimisation
- ✅ Requêtes 3-5x plus rapides
- ✅ Évaluation unique des fonctions auth
- ✅ Politiques RLS optimisées
- ✅ Index sur toutes les clés étrangères

## 📈 Monitoring des Performances

### 1. Supabase Dashboard
- Allez dans **Database** > **Performance**
- Surveillez les requêtes lentes
- Vérifiez l'utilisation des index

### 2. Logs d'Application
```typescript
// Ajouter des logs de performance
const startTime = Date.now()
const result = await prisma.profile.findMany({...})
const endTime = Date.now()
console.log(`Query executed in ${endTime - startTime}ms`)
```

### 3. Métriques Clés
- **Temps de réponse** : < 100ms pour les requêtes simples
- **Temps de jointure** : < 200ms pour les requêtes complexes
- **Utilisation CPU** : Réduction de 30-50%

## 🔍 Dépannage

### Problème : Erreur lors de l'exécution du script SQL

**Solution :**
```bash
# Vérifier la connexion Supabase
npm run diagnose-db

# Exécuter les corrections une par une
npx tsx scripts/apply-performance-fixes.ts sql
```

### Problème : Politiques RLS cassées

**Solution :**
```sql
-- Réactiver RLS si nécessaire
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ... pour toutes les tables
```

### Problème : Index non créés

**Solution :**
```bash
# Forcer la création des index
npx prisma db push --force-reset
npm run db:optimize apply
```

## 📚 Ressources Supplémentaires

- [Documentation Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Optimisation des Performances PostgreSQL](https://supabase.com/docs/guides/database/performance)
- [Guide Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console
2. Exécutez `npm run diagnose-db`
3. Consultez le dashboard Supabase
4. Contactez l'équipe de développement

---

**Note :** Ces optimisations sont essentielles pour la performance de votre application, surtout avec un nombre croissant d'utilisateurs et de données.
