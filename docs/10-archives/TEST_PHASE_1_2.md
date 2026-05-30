# 🧪 Guide de Test - Phases 1 & 2

**Date :** 10 Novembre 2025  
**Objectif :** Valider les fondations (migrations BDD, types, hooks, services)

---

## ✅ CHECKLIST DE TEST

### Phase 1 : Analyse
- [x] Rapport d'analyse généré (`docs/ONBOARDING_MULTIFLOW_ANALYSIS.md`)
- [x] Documentation de progression créée (`docs/ONBOARDING_PROGRESS.md`)
- [x] Plan d'implémentation validé

**Status Phase 1 :** ✅ Complète (documentation disponible)

---

### Phase 2 : Base de Données

#### Test 1 : Migration SQL
- [ ] Migration appliquée sans erreurs
- [ ] 4 tables créées
- [ ] RLS activé sur toutes les tables
- [ ] Fonctions SQL créées
- [ ] Triggers configurés

#### Test 2 : Types TypeScript
- [ ] Fichier `lib/types/onboarding.ts` compile sans erreurs
- [ ] Toutes les interfaces sont importables
- [ ] Pas d'erreurs TypeScript

#### Test 3 : Hook useOnboarding
- [ ] Hook s'importe correctement
- [ ] Session ID généré
- [ ] État initial correct
- [ ] Fonctions exposées disponibles

#### Test 4 : Service onboarding
- [ ] Service s'importe correctement
- [ ] Fonctions callable
- [ ] Connexion Supabase OK

---

## 🚀 ÉTAPE 1 : APPLIQUER LA MIGRATION SQL

### Option A : Via Supabase CLI (Recommandé)

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier au projet
supabase link --project-ref VOTRE_PROJECT_REF

# 4. Appliquer la migration
supabase db push
```

### Option B : Via SQL Editor (Dashboard Supabase)

1. Ouvrir https://app.supabase.com
2. Sélectionner votre projet Ofika
3. Aller dans **SQL Editor**
4. Créer une nouvelle query
5. Copier-coller le contenu de `supabase/migrations/20250110_create_onboarding_tables.sql`
6. Cliquer **Run**

**⚠️ Important :** Vérifier qu'aucune erreur n'apparaît dans les logs.

---

## 🔍 ÉTAPE 2 : VÉRIFIER LES TABLES

### Script de vérification SQL

Exécuter dans SQL Editor :

```sql
-- 1. Vérifier que les 4 tables existent
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions')
ORDER BY table_name;

-- Résultat attendu : 4 lignes
-- pending_creations | BASE TABLE
-- nfc_cards | BASE TABLE
-- orders | BASE TABLE
-- onboarding_sessions | BASE TABLE
```

**✅ Si vous voyez 4 tables → Migration réussie !**

### Vérifier les colonnes de chaque table

```sql
-- pending_creations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pending_creations'
ORDER BY ordinal_position;

-- nfc_cards
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nfc_cards'
ORDER BY ordinal_position;

-- orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- onboarding_sessions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'onboarding_sessions'
ORDER BY ordinal_position;
```

---

## 🔒 ÉTAPE 3 : VÉRIFIER RLS (Row Level Security)

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions');

-- Résultat attendu : rowsecurity = true pour toutes
```

### Vérifier les politiques RLS

```sql
-- Lister toutes les politiques
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions')
ORDER BY tablename, policyname;
```

**✅ Vous devriez voir plusieurs politiques par table**

---

## ⚙️ ÉTAPE 4 : TESTER LES FONCTIONS SQL

### Test de la fonction de nettoyage

```sql
-- Tester cleanup_expired_pending_creations
SELECT cleanup_expired_pending_creations();

-- Résultat : nombre de lignes supprimées (probablement 0 si base vide)
```

### Test de génération de numéro de commande

```sql
-- Tester generate_order_number
SELECT generate_order_number();

-- Résultat attendu : 'ORD-2025-000001'
```

### Test de calcul de prix

```sql
-- Tester calculate_nfc_card_price
SELECT calculate_nfc_card_price('design-classic', 1, 'FR');

-- Résultat attendu : Un objet JSON avec prix, frais de port, taxes, etc.
-- Exemple :
-- {
--   "base_price_cents": 2990,
--   "quantity": 1,
--   "subtotal_cents": 2990,
--   "shipping_cents": 500,
--   "tax_rate": 0.20,
--   "tax_cents": 698,
--   "total_cents": 4188,
--   "currency": "EUR"
-- }
```

**✅ Si toutes les fonctions retournent des résultats → Fonctions OK !**

---

## 💾 ÉTAPE 5 : INSÉRER DES DONNÉES DE TEST

### Test 1 : pending_creations

```sql
-- Insérer une création temporaire
INSERT INTO pending_creations (session_id, type, payload, step_completed)
VALUES (
  'test-session-001',
  'public_page',
  '{"name": "Test User", "bio": "Test bio"}',
  1
)
RETURNING *;

-- Vérifier l'insertion
SELECT * FROM pending_creations WHERE session_id = 'test-session-001';

-- Nettoyer
DELETE FROM pending_creations WHERE session_id = 'test-session-001';
```

### Test 2 : onboarding_sessions

```sql
-- Insérer une session de tracking
INSERT INTO onboarding_sessions (session_id, flow_type, current_step, device_type)
VALUES (
  'test-session-002',
  'nfc',
  2,
  'desktop'
)
RETURNING *;

-- Vérifier
SELECT * FROM onboarding_sessions WHERE session_id = 'test-session-002';

-- Nettoyer
DELETE FROM onboarding_sessions WHERE session_id = 'test-session-002';
```

**✅ Si insertions + sélections réussissent → Tables fonctionnelles !**

---

## 🎨 ÉTAPE 6 : VÉRIFIER LES TYPES TYPESCRIPT

### Dans votre IDE (VS Code / Windsurf)

```bash
# Vérifier qu'il n'y a pas d'erreurs TypeScript
npx tsc --noEmit
```

**Résultat attendu :** Aucune erreur liée à `lib/types/onboarding.ts`

### Test manuel d'import

Créer un fichier de test temporaire `test-types.ts` :

```typescript
import {
  OnboardingFlowType,
  PendingCreation,
  NFCCard,
  Order,
  PublicPagePayload,
  NFCCardPayload
} from './lib/types/onboarding'

// Si ce fichier compile sans erreur, les types sont OK
const flowType: OnboardingFlowType = 'nfc'
console.log('Types OK:', flowType)
```

```bash
npx tsx test-types.ts
```

**✅ Si compile → Types OK !**

---

## 🪝 ÉTAPE 7 : TESTER LE HOOK useOnboarding

### Créer une page de test

Créer `app/test-onboarding/page.tsx` :

```typescript
'use client'

import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'

export default function TestOnboardingPage() {
  const {
    sessionId,
    currentStep,
    completedSteps,
    payload,
    loading,
    saving,
    progress,
    nextStep,
    previousStep,
    saveProgress
  } = useOnboarding('public_page', 4)

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Hook useOnboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Session ID:</strong>
              <div className="text-sm text-gray-600">{sessionId.substring(0, 8)}...</div>
            </div>
            <div>
              <strong>Étape actuelle:</strong>
              <div className="text-2xl font-bold">{currentStep} / 4</div>
            </div>
            <div>
              <strong>Progression:</strong>
              <div className="text-2xl font-bold">{progress.percentComplete}%</div>
            </div>
            <div>
              <strong>État:</strong>
              <div className="text-sm">
                {loading && '⏳ Chargement...'}
                {saving && '💾 Sauvegarde...'}
                {!loading && !saving && '✅ Prêt'}
              </div>
            </div>
          </div>

          <div>
            <strong>Étapes complétées:</strong>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    completedSteps.includes(step)
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div>
            <strong>Payload actuel:</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={previousStep} disabled={currentStep === 1}>
              ⬅️ Précédent
            </Button>
            <Button 
              onClick={() => saveProgress({ name: 'Test User' })}
              variant="outline"
            >
              💾 Sauvegarder
            </Button>
            <Button onClick={nextStep} disabled={currentStep === 4}>
              ➡️ Suivant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Accéder à la page de test

```bash
npm run dev
# Ouvrir http://localhost:3000/test-onboarding
```

### Tests à effectuer

1. ✅ **Session ID généré** - Vérifier qu'un UUID est affiché
2. ✅ **Navigation fonctionne** - Cliquer "Suivant" et "Précédent"
3. ✅ **Sauvegarde fonctionne** - Cliquer "Sauvegarder" et vérifier dans Supabase
4. ✅ **Progression mise à jour** - Vérifier que le pourcentage change
5. ✅ **LocalStorage backup** - Ouvrir DevTools → Application → Local Storage
6. ✅ **Rechargement de page** - Actualiser et vérifier que l'état est restauré

---

## 📦 ÉTAPE 8 : TESTER LE SERVICE

### Test dans la console du navigateur

Ouvrir la console (F12) et tester :

```javascript
// Importer le service (dans une vraie page Next.js)
import { savePendingCreation, getPendingCreation } from '@/lib/services/onboarding.service'

// Test de sauvegarde
const result = await savePendingCreation(
  'test-session-browser',
  'nfc',
  { name: 'Test' },
  1
)
console.log('Sauvegarde:', result)

// Test de récupération
const data = await getPendingCreation('test-session-browser', 'nfc')
console.log('Récupération:', data)
```

**Alternative :** Créer un bouton de test dans la page `/test-onboarding`

---

## 🔍 ÉTAPE 9 : VÉRIFICATION DANS SUPABASE DASHBOARD

### Aller dans Supabase Dashboard

1. Ouvrir https://app.supabase.com
2. Sélectionner votre projet
3. Aller dans **Table Editor**
4. Vérifier les données insérées dans `pending_creations`

**✅ Vous devriez voir vos tests apparaître !**

---

## 📊 RÉSULTATS ATTENDUS

### ✅ SUCCÈS si :

- [x] Migration SQL appliquée sans erreur
- [x] 4 tables créées et visibles
- [x] RLS activé sur toutes les tables
- [x] 3 fonctions SQL fonctionnelles
- [x] Types TypeScript compilent
- [x] Hook useOnboarding fonctionne
- [x] Navigation entre étapes OK
- [x] Sauvegarde Supabase OK
- [x] LocalStorage backup OK
- [x] Service fonctions callable

### ❌ ÉCHEC si :

- Erreurs SQL lors de la migration
- Tables manquantes
- Erreurs TypeScript
- Hook ne génère pas de session_id
- Impossible de sauvegarder dans Supabase
- RLS bloque les opérations

---

## 🐛 TROUBLESHOOTING

### Problème 1 : Migration échoue

**Erreur :** `function update_updated_at_column() does not exist`

**Solution :** La fonction existe déjà dans une migration précédente, commenter la création dans la nouvelle migration.

---

### Problème 2 : RLS bloque les insertions

**Erreur :** `new row violates row-level security policy`

**Solution :** Vérifier que les politiques permettent les opérations publiques sur `pending_creations` :

```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'pending_creations';
```

---

### Problème 3 : Hook ne sauvegarde pas

**Erreur :** Aucune donnée dans Supabase

**Vérifications :**
1. Variables d'env correctes (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
2. Connexion Internet OK
3. Projet Supabase actif
4. Console browser pour voir les erreurs

---

### Problème 4 : Types non reconnus

**Erreur :** `Cannot find module '@/lib/types/onboarding'`

**Solutions :**
1. Vérifier que le fichier existe
2. Redémarrer le serveur de dev (`npm run dev`)
3. Vérifier tsconfig.json (alias `@` configuré)

---

## ✅ VALIDATION FINALE

Une fois tous les tests passés, remplir ce checklist :

```
✅ Migration SQL appliquée
✅ Tables créées et vérifiées
✅ RLS activé
✅ Fonctions SQL testées
✅ Types TypeScript OK
✅ Hook useOnboarding testé
✅ Service onboarding testé
✅ Données visibles dans Supabase
✅ LocalStorage fonctionne
✅ Aucune erreur console
```

**🎉 Si tout est ✅ → Phases 1 & 2 VALIDÉES !**

**Prêt à passer à la Phase 3** (page /get-started)

---

**Temps estimé pour ces tests :** 30-45 minutes  
**Difficulté :** Facile à Moyen

**Besoin d'aide ?** Vérifiez les logs dans :
- Console navigateur (F12)
- Terminal Next.js
- Supabase Dashboard → Logs
