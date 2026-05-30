# 🧠 GUIDE COMPLET — Debug & Vérification Supabase

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Problèmes détectés](#problèmes-détectés)
3. [Solutions implémentées](#solutions-implémentées)
4. [Utilisation](#utilisation)
5. [Tests de vérification](#tests-de-vérification)
6. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

Ce guide explique comment vérifier et déboguer la synchronisation entre **localStorage** et **Supabase** dans votre application.

### Architecture du système

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   FRONTEND      │         │  LOCALSTORAGE   │         │    SUPABASE     │
│                 │ ------> │                 │ ------> │                 │
│  React Forms    │  Save   │  Pending Data   │  Sync   │  Database       │
│                 │ <------ │                 │ <------ │                 │
└─────────────────┘  Read   └─────────────────┘ Verify  └─────────────────┘
```

---

## ❌ Problèmes détectés

### 1. **Pas de vérification automatique**
- ❌ Aucune fonction ne confirme que les données sont bien dans Supabase
- ❌ Pas de logs de debug visibles

### 2. **Gestion d'erreur insuffisante**
- ❌ Les erreurs Supabase ne sont pas affichées à l'utilisateur
- ❌ Pas de retry en cas d'échec

### 3. **État de chargement manquant**
- ❌ Pas de loader pendant la synchronisation
- ❌ L'utilisateur ne sait pas si la sauvegarde est en cours

### 4. **Duplication de clés localStorage**
- ❌ `pendingProfileData` ET `pending_profile_creation` utilisés
- ❌ Risque d'incohérence

---

## ✅ Solutions implémentées

### 1. **Service de vérification automatique**

**Fichier:** `lib/services/supabase-sync-verifier.ts`

Fonctions principales :

```typescript
// Vérifier si des données existent dans Supabase
verifySupabaseData(table, userId)

// Synchroniser localStorage → Supabase
syncLocalStorageToSupabase()

// Tester la connexion Supabase
testSupabaseConnection()

// Nettoyer le localStorage
cleanupOnboardingLocalStorage()
```

### 2. **Hook React personnalisé**

**Fichier:** `lib/hooks/useSupabaseSync.ts`

```typescript
const {
  isSyncing,
  isVerifying,
  syncError,
  verificationResult,
  sync,
  verify,
  testConnection,
  cleanup
} = useSupabaseSync({
  autoSync: true,      // Sync auto au montage
  autoVerify: true,    // Vérifier après sync
  table: 'profiles',   // Table à vérifier
  showToasts: true     // Afficher les toasts
})
```

### 3. **Composant de debug UI**

**Fichier:** `components/debug/SupabaseSyncDebugger.tsx`

Interface visuelle pour :
- Voir l'état de la connexion
- Vérifier les données en temps réel
- Synchroniser manuellement
- Nettoyer le localStorage

---

## 🚀 Utilisation

### Option A : Hook automatique (Recommandé)

Ajouter dans votre page d'onboarding :

```tsx
// app/onboarding/public-page/page.tsx

import { useSupabaseSync } from '@/lib/hooks/useSupabaseSync'

export default function PublicPageOnboarding() {
  const { user } = useAuth()
  
  // ✅ Synchronisation automatique
  const { isSyncing, verificationResult } = useSupabaseSync({
    autoSync: true,
    autoVerify: true,
    table: 'profiles',
    showToasts: true
  })
  
  return (
    <div>
      {isSyncing && <LoadingSpinner />}
      
      {verificationResult && (
        <Alert>
          ✅ {verificationResult.count} profil(s) sauvegardé(s)
        </Alert>
      )}
      
      {/* Reste du composant */}
    </div>
  )
}
```

### Option B : Vérification manuelle

```tsx
import { verifySupabaseData, displayVerificationResult } from '@/lib/services/supabase-sync-verifier'

const handleCheckData = async () => {
  const result = await verifySupabaseData('profiles', user.id)
  displayVerificationResult('profiles', result)
}

<Button onClick={handleCheckData}>
  Vérifier mes données
</Button>
```

### Option C : Composant de debug (Développement)

Ajouter dans votre layout :

```tsx
// app/layout.tsx

import { SupabaseSyncDebugger } from '@/components/debug/SupabaseSyncDebugger'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        
        {/* ✅ Debugger en bas à droite */}
        <SupabaseSyncDebugger
          devOnly={true}
          position="fixed"
          table="profiles"
        />
      </body>
    </html>
  )
}
```

---

## 🧪 Tests de vérification

### Test 1 : Vérifier les données après signup

```tsx
useEffect(() => {
  const checkAfterSignup = async () => {
    if (user) {
      // Attendre 1 seconde pour que la session soit stable
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Vérifier les profils
      const result = await verifySupabaseData('profiles', user.id)
      
      if (result.success && result.count > 0) {
        console.log('✅ Profils trouvés:', result.data)
      } else {
        console.warn('⚠️ Aucun profil trouvé')
      }
    }
  }
  
  checkAfterSignup()
}, [user])
```

### Test 2 : Vérifier la connexion Supabase

```tsx
import { testSupabaseConnection } from '@/lib/services/supabase-sync-verifier'

const testConnection = async () => {
  const result = await testSupabaseConnection()
  
  if (result.isConnected) {
    console.log('✅ Connexion OK')
    console.log('User ID:', result.userId)
  } else {
    console.error('❌ Erreur:', result.error)
  }
}
```

### Test 3 : Synchroniser le localStorage

```tsx
import { syncLocalStorageToSupabase } from '@/lib/services/supabase-sync-verifier'

const handleSync = async () => {
  const result = await syncLocalStorageToSupabase()
  
  if (result.success) {
    console.log('✅ Tables synchronisées:', result.syncedTables)
  } else {
    console.error('❌ Erreur:', result.error)
  }
}
```

---

## 🔍 Dépannage

### Problème : "Utilisateur non authentifié"

**Cause :** JWT corrompu ou session expirée

**Solution :**
```typescript
// 1. Vider le cache
cleanupOnboardingLocalStorage()

// 2. Tester la connexion
const result = await testSupabaseConnection()

// 3. Se reconnecter si nécessaire
if (!result.isConnected) {
  router.push('/auth/login')
}
```

### Problème : "Données pas dans Supabase"

**Cause :** Synchronisation échouée

**Solution :**
```typescript
// 1. Vérifier le localStorage
const pending = localStorage.getItem('pending_profile_creation')
console.log('Pending data:', pending)

// 2. Synchroniser manuellement
await syncLocalStorageToSupabase()

// 3. Vérifier le résultat
const result = await verifySupabaseData('profiles')
```

### Problème : "Logo ne s'affiche pas"

**Cause :** Chemin incorrect ou upload raté

**Solution :**
```typescript
// Vérifier les données du profil
const result = await verifySupabaseData('profiles', user.id)

if (result.data && result.data[0]) {
  const profile = result.data[0]
  console.log('Logo URL:', profile.image_url)
  console.log('Logo présent:', !!profile.image_url)
}
```

---

## 📊 Logs de debug

### Console logs à surveiller

✅ **Succès :**
```
✅ Données restaurées - continuez le flow
✅ Carte créée avec succès - passage à PROFILE_SELECTION
✅ 1 enregistrement(s) trouvé(s) dans profiles
✅ Connexion Supabase fonctionnelle
```

❌ **Erreurs :**
```
❌ Erreur lors de la vérification de profiles
❌ Utilisateur non authentifié
❌ Erreur d'accès à la base de données
❌ Exception lors de la synchronisation
```

⚠️ **Avertissements :**
```
⚠️ Aucune donnée trouvée dans profiles
⚠️ User pas encore connecté
⚠️ Pas de données dans localStorage
```

---

## 🎯 Checklist de vérification

Avant de déployer, vérifiez :

- [ ] `useSupabaseSync` ajouté dans les pages d'onboarding
- [ ] `SupabaseSyncDebugger` fonctionne en développement
- [ ] Toasts de confirmation affichés après sauvegarde
- [ ] Logs de debug visibles dans la console
- [ ] Test de connexion Supabase OK
- [ ] Données vérifiées dans Supabase après signup
- [ ] LocalStorage nettoyé après synchronisation
- [ ] Aucune duplication de clés localStorage
- [ ] Erreurs affichées clairement à l'utilisateur
- [ ] État de chargement visible pendant la sync

---

## 🚀 Prochaines étapes

1. **Tester en développement**
   ```bash
   npm run dev
   ```

2. **Compiler**
   ```bash
   npm run build
   ```

3. **Vérifier les logs**
   - Ouvrir la console (F12)
   - Observer les logs de sync
   - Vérifier les données Supabase

4. **Utiliser le debugger UI**
   - Bouton "Debug Supabase" en bas à droite
   - Vérifier les statistiques en temps réel

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide React Hooks](https://react.dev/reference/react)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**✅ Votre système de synchronisation est maintenant robuste et debuggable ! 🎉**
