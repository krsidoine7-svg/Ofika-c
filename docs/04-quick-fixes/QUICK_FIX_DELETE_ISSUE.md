# 🚨 Résolution rapide - Problème de suppression de profils

## ❌ Problème identifié
Les profils ne sont pas supprimés de Supabase quand vous les supprimez côté client. Ils restent dans la base de données.

## 🔍 Cause du problème
Le hook `useDeleteProfile` utilise un **soft delete** (désactivation) au lieu d'une vraie suppression :
- Il met `is_active = false` au lieu de supprimer l'enregistrement
- Le profil reste dans la base de données mais n'est plus visible
- C'est pourquoi vous ne le voyez plus côté client mais il existe toujours

## ✅ Solutions

### Solution 1 : Utiliser la suppression définitive (Recommandée)

#### Modifier le ProfileManager
Remplacez l'import dans `components/profiles/ProfileManager.tsx` :

```typescript
// Ancien import
import { useProfiles, useDeleteProfile } from '@/lib/hooks/useProfiles'

// Nouvel import
import { useProfiles, useDeleteProfile } from '@/lib/hooks/useProfilesEnhanced'
```

#### Modifier la fonction de suppression
```typescript
const handleDeleteProfile = async (profileId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce profil ?')) {
    await deleteProfileMutation.mutateAsync({ 
      profileId, 
      deleteType: 'hard' // Suppression définitive
    })
  }
}
```

### Solution 2 : Ajouter un composant de diagnostic

#### Intégrer le diagnostic dans ProfileManager
```typescript
import { DeleteDebugger } from '@/components/test/debug/DeleteDebugger'

// Dans le JSX, ajouter :
<DeleteDebugger 
  profileId={profile.id} 
  profileName={profile.name} 
/>
```

### Solution 3 : Vérifier les politiques RLS

#### Exécuter ce script dans Supabase SQL Editor
```sql
-- Vérifier les politiques de suppression
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
AND cmd = 'DELETE'
ORDER BY policyname;

-- Tester la suppression manuellement
SELECT 
    id,
    name,
    user_id,
    is_active
FROM profiles 
WHERE id = 'VOTRE_PROFILE_ID';
```

## 🔧 Scripts de diagnostic

### Script 1 : Vérifier les profils désactivés
```sql
-- Voir tous les profils désactivés (soft delete)
SELECT 
    id,
    name,
    user_id,
    is_active,
    created_at,
    updated_at
FROM profiles 
WHERE is_active = false
ORDER BY updated_at DESC;
```

### Script 2 : Vérifier les politiques RLS
```sql
-- Vérifier toutes les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;
```

### Script 3 : Tester la suppression manuelle
```sql
-- Tester la suppression d'un profil spécifique
-- REMPLACEZ 'PROFILE_ID' par l'ID réel du profil
DELETE FROM profiles 
WHERE id = 'PROFILE_ID';
```

## 🚀 Actions à effectuer

### 1. Immédiat (2 minutes)
1. **Modifiez le ProfileManager** pour utiliser la suppression définitive
2. **Testez la suppression** d'un profil
3. **Vérifiez dans Supabase** que le profil a été supprimé

### 2. Diagnostic (5 minutes)
1. **Ajoutez le composant DeleteDebugger** pour diagnostiquer les problèmes
2. **Exécutez les scripts SQL** pour vérifier l'état de la base
3. **Vérifiez les politiques RLS** si nécessaire

### 3. Nettoyage (optionnel)
1. **Supprimez les profils désactivés** de la base de données
2. **Vérifiez qu'il n'y a pas de données orphelines**

## 🔍 Vérification

### Côté client
- ✅ Le profil disparaît de la liste
- ✅ Pas d'erreur dans la console
- ✅ Message de succès affiché

### Côté Supabase
- ✅ Le profil n'existe plus dans la table `profiles`
- ✅ Les liens associés sont supprimés
- ✅ Pas de données orphelines

## 📋 Checklist de résolution

- [ ] Hook de suppression modifié pour hard delete
- [ ] Test de suppression effectué
- [ ] Vérification dans Supabase
- [ ] Diagnostic ajouté (optionnel)
- [ ] Nettoyage des données orphelines (optionnel)

## 🚨 Si le problème persiste

### Vérifier les permissions
```sql
-- Vérifier que l'utilisateur peut supprimer
SELECT 
    auth.uid() as current_user_id,
    'Test permissions' as test_description;
```

### Vérifier les contraintes
```sql
-- Vérifier les contraintes de clé étrangère
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'profiles';
```

---

**Note** : Le problème vient du fait que l'application utilise un soft delete au lieu d'une vraie suppression. La solution est de modifier le hook pour utiliser la suppression définitive.
