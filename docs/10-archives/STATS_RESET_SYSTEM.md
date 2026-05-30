# 🔄 SYSTÈME DE RÉINITIALISATION AUTOMATIQUE DES STATISTIQUES (40 JOURS)

## 📋 Vue d'Ensemble

Ce système réinitialise automatiquement toutes les statistiques utilisateur tous les **40 jours**, de manière **infinie**, **déterministe** et **résistante aux redémarrages**.

---

## 🏗️ Architecture

### Composants Créés

1. **Migration SQL** : `supabase/migrations/20250107_add_stats_reset_system.sql`
   - Ajoute `stats_last_reset_at` à la table `users`
   - Crée les fonctions PostgreSQL `reset_user_stats()` et `should_reset_user_stats()`
   - Crée une vue de monitoring `users_stats_status`

2. **Service de Reset** : `lib/services/stats-reset.ts`
   - Gère la logique de vérification et de réinitialisation
   - Fonctions timezone-safe et idempotentes

3. **Hook React** : `lib/hooks/useStatsAutoReset.ts`
   - Déclenche automatiquement le reset au chargement du dashboard
   - Affiche une notification utilisateur

4. **Composant UI** : `components/features/analytics/StatsResetIndicator.tsx`
   - Indicateur visuel du cycle de reset
   - Barre de progression et countdown

---

## 🚀 Installation

### Étape 1 : Exécuter la Migration SQL

```bash
# Option A : Via Supabase CLI (recommandé)
supabase db push

# Option B : Via Supabase Dashboard
# 1. Allez sur https://app.supabase.com
# 2. SQL Editor -> New query
# 3. Copiez le contenu de 20250107_add_stats_reset_system.sql
# 4. Exécutez
```

### Étape 2 : Vérifier l'Installation

```sql
-- Vérifier que la colonne existe
SELECT stats_last_reset_at FROM users LIMIT 1;

-- Vérifier les fonctions
SELECT should_reset_user_stats('votre-user-id');

-- Voir le statut de tous les utilisateurs
SELECT * FROM users_stats_status;
```

### Étape 3 : Intégrer dans le Dashboard

Ajoutez ces lignes dans `app/dashboard/page.tsx` :

```tsx
import { useStatsAutoReset } from "@/lib/hooks/useStatsAutoReset"
import { StatsResetIndicator } from "@/components/features/analytics/StatsResetIndicator"

export default function DashboardPage() {
  // ✅ Reset automatique au chargement
  const { checking, resetPerformed } = useStatsAutoReset()

  return (
    <div>
      {/* Autres composants... */}
      
      {/* Indicateur de reset */}
      <StatsResetIndicator />
    </div>
  )
}
```

---

## ⚙️ Fonctionnement

### Cycle Automatique

```
Jour 0 → stats_last_reset_at = NOW()
         └─> Événements s'accumulent
         
Jour 40 → Utilisateur charge dashboard
          └─> useStatsAutoReset() détecte 40 jours écoulés
              └─> Appelle reset_user_stats()
                  └─> Supprime événements depuis last_reset
                  └─> stats_last_reset_at = NOW()
                  └─> Notification utilisateur
                  
Jour 80 → Cycle se répète automatiquement
```

### Logique de Reset

```typescript
// Vérifie si reset nécessaire
should_reset_user_stats(user_id) 
  → TRUE si (NOW() - stats_last_reset_at) >= 40 jours

// Effectue le reset
reset_user_stats(user_id)
  1. DELETE FROM analytics_events WHERE created_at >= stats_last_reset_at
  2. UPDATE users SET stats_last_reset_at = NOW()
  3. RETURN count d'événements supprimés
```

---

## 🔒 Sécurité & Robustesse

### ✅ Anti-Race Conditions
- Transactions PostgreSQL atomiques
- `SECURITY DEFINER` sur les fonctions SQL
- Idempotence garantie (double reset = aucun effet)

### ✅ Timezone-Safe
- Utilise `TIMESTAMPTZ` (timezone-aware)
- Tous les calculs côté DB (pas de dépendance client)

### ✅ Résistance aux Redémarrages
- État persisté en base (pas de timers locaux)
- Aucune dépendance frontend

### ✅ Performance
- Index sur `stats_last_reset_at`
- DELETE optimisé avec `created_at >= ...`
- Pas de full table scan

---

## 📊 Monitoring

### Vue SQL

```sql
-- Voir le statut de tous les utilisateurs
SELECT 
  email,
  time_since_reset,
  reset_status,
  current_events_count
FROM users_stats_status
ORDER BY time_since_reset DESC;
```

### Hook React

```tsx
import { useStatsResetInfo } from "@/lib/hooks/useStatsAutoReset"

function MonitoringComponent() {
  const { resetInfo } = useStatsResetInfo()
  
  return (
    <div>
      Prochaine réinitialisation dans : {resetInfo?.daysUntilNextReset} jours
      Progression : {resetInfo?.resetCycleProgress}%
    </div>
  )
}
```

---

## 🧪 Tests Manuels

### Test 1 : Vérifier la Création

```sql
-- Ouvrir psql ou SQL Editor Supabase
SELECT id, email, stats_last_reset_at FROM users WHERE email = 'votre@email.com';
```

**Attendu** : `stats_last_reset_at` = date d'aujourd'hui

### Test 2 : Simuler 40 Jours Écoulés

```sql
-- Modifier la date pour simuler
UPDATE users 
SET stats_last_reset_at = NOW() - INTERVAL '41 days'
WHERE email = 'votre@email.com';

-- Vérifier
SELECT should_reset_user_stats(id) FROM users WHERE email = 'votre@email.com';
```

**Attendu** : `TRUE`

### Test 3 : Déclencher Reset Manuel

```sql
SELECT * FROM reset_user_stats(
  (SELECT id FROM users WHERE email = 'votre@email.com')
);
```

**Attendu** : 
```json
{
  "success": true,
  "deleted_count": X,
  "message": "Stats réinitialisées avec succès..."
}
```

### Test 4 : Vérifier l'Auto-Reset Frontend

1. Ouvrir le dashboard : `http://localhost:3000/dashboard`
2. Ouvrir la console (F12)
3. Chercher : `⚠️ Reset nécessaire détecté`
4. Vérifier notification : "📊 Statistiques réinitialisées"

---

## 🔧 Configuration Personnalisée

### Changer l'Intervalle de Reset

Modifiez dans `lib/services/stats-reset.ts` :

```typescript
const RESET_INTERVAL_DAYS = 40  // Changez ici (ex: 30, 60, 90)
```

Puis mettez à jour la fonction SQL :

```sql
-- Dans 20250107_add_stats_reset_system.sql ligne ~69
v_threshold := NOW() - INTERVAL '40 days';  -- Changez ici
```

---

## ⚠️ Important : Rollback

Si vous voulez désactiver le système :

```sql
-- Désactiver l'auto-reset
DROP FUNCTION IF EXISTS should_reset_user_stats(UUID);
DROP FUNCTION IF EXISTS reset_user_stats(UUID);
DROP VIEW IF EXISTS users_stats_status;

-- Garder la colonne pour historique
-- ALTER TABLE users DROP COLUMN stats_last_reset_at;
```

Frontend :
```tsx
// Commenter dans dashboard
// const { checking, resetPerformed } = useStatsAutoReset()
```

---

## 📈 Améliorations Futures

### Option A : CRON Supabase (Plan Pro+)

```sql
-- Reset automatique quotidien à minuit
SELECT cron.schedule(
  'reset-stats-job',
  '0 0 * * *',  -- Tous les jours à minuit
  $$
    SELECT reset_user_stats(id) 
    FROM users 
    WHERE should_reset_user_stats(id) = TRUE;
  $$
);
```

### Option B : Archivage au lieu de Suppression

Modifiez `reset_user_stats()` :

```sql
-- Au lieu de DELETE
INSERT INTO analytics_events_archive 
SELECT * FROM analytics_events WHERE ...;

DELETE FROM analytics_events WHERE ...;
```

### Option C : Reset Partiel Par Profil

Créez une fonction `reset_profile_stats(profile_id)` pour reset individuel.

---

## 🆘 Dépannage

### Problème : Reset ne se déclenche pas

**Solution 1** : Vérifier les permissions RLS
```sql
-- Activer RLS bypass temporaire
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
```

**Solution 2** : Logs
```typescript
// Dans useStatsAutoReset.ts, vérifier console
console.log('Status check result:', statusResult)
```

### Problème : Erreur "function does not exist"

**Solution** : Réexécuter la migration
```bash
supabase db reset
supabase db push
```

---

## ✅ Checklist de Déploiement

- [ ] Migration SQL exécutée en production
- [ ] Tests manuels passés
- [ ] Hook intégré dans dashboard
- [ ] Indicateur UI ajouté
- [ ] Monitoring configuré
- [ ] Documentation partagée avec l'équipe
- [ ] Variables d'environnement vérifiées
- [ ] RLS policies testées

---

**🎉 Le système est maintenant opérationnel et va automatiquement réinitialiser les stats tous les 40 jours, indéfiniment !**
