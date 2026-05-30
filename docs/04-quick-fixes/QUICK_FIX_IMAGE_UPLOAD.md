# 🚨 Résolution rapide - Erreur d'upload d'images

## ❌ Erreur rencontrée
```
Error uploading image: Error: new row violates row-level security policy
```

## 🔍 Cause du problème
L'erreur vient des **politiques RLS de Supabase Storage**, pas du type `TEXT` de `image_url`. Le type `TEXT` est correct pour stocker l'URL de l'image après upload.

**Le problème :**
- L'upload d'image vers le bucket `profile-images` échoue
- Les politiques RLS de Storage ne permettent pas l'upload
- L'utilisateur n'a pas les permissions nécessaires

## ✅ Solutions

### Solution 1 : Corriger les politiques Storage (Recommandée)

#### Via SQL (2 minutes)
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous et sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Exécutez le script `setup-storage-bucket.sql` :

```sql
-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Créer les politiques RLS
CREATE POLICY "Public read access for profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.uid() IS NOT NULL
);
```

### Solution 2 : Via l'interface Supabase

#### Créer le bucket
1. Allez dans **"Storage"** dans le menu de gauche
2. Cliquez sur **"New bucket"**
3. Créez un bucket avec ces paramètres :
   - **Nom** : `profile-images`
   - **Public** : ✅ Oui
   - **File size limit** : `5MB`
   - **Allowed MIME types** : `image/jpeg, image/png, image/gif, image/webp`

#### Configurer les politiques
1. Allez dans **"Storage" > "Policies"**
2. Créez ces politiques pour le bucket `profile-images` :

**Politique 1 - Lecture publique :**
- **Name** : `Public read access for profile images`
- **Operation** : `SELECT`
- **Target roles** : `public`
- **Policy definition** : `bucket_id = 'profile-images'`

**Politique 2 - Upload authentifié :**
- **Name** : `Authenticated users can upload profile images`
- **Operation** : `INSERT`
- **Target roles** : `authenticated`
- **Policy definition** : `bucket_id = 'profile-images' AND auth.uid() IS NOT NULL`

### Solution 3 : Diagnostic et test

#### Ajouter le composant de diagnostic
```typescript
import { ImageUploadDebugger } from '@/components/ImageUploadDebugger'

// Dans votre composant de profil :
<ImageUploadDebugger />
```

## 🔍 Vérification

### Vérifier le bucket
```sql
-- Vérifier que le bucket existe
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'profile-images';
```

### Vérifier les politiques
```sql
-- Vérifier les politiques Storage
SELECT policyname, cmd, permissive, roles
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%profile images%'
ORDER BY policyname;
```

### Tester l'upload manuellement
```sql
-- Test de permissions (si utilisateur connecté)
SELECT 
  auth.uid() as current_user_id,
  'Test upload permissions' as test_description;
```

## 🚨 Si le problème persiste

### Vérifier l'authentification
1. **Assurez-vous d'être connecté** à l'application
2. **Vérifiez le token** dans les DevTools
3. **Reconnectez-vous** si nécessaire

### Vérifier les permissions utilisateur
```sql
-- Vérifier les rôles de l'utilisateur
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  'User permissions' as test;
```

### Vérifier les logs Supabase
1. Allez dans **"Logs"** dans Supabase
2. Filtrez par **"Storage"**
3. Regardez les erreurs d'upload

## 📋 Checklist de résolution

- [ ] Bucket `profile-images` créé
- [ ] Bucket configuré comme public
- [ ] Politiques RLS créées pour Storage
- [ ] Utilisateur connecté
- [ ] Test d'upload réussi
- [ ] Image affichée dans le profil

## 🔧 Scripts fournis

1. **`setup-storage-bucket.sql`** - Crée le bucket et les politiques
2. **`fix-storage-rls.sql`** - Corrige seulement les politiques
3. **`ImageUploadDebugger.tsx`** - Composant de diagnostic

## ✅ Résultat attendu

Après la correction :
- ✅ **Upload d'images fonctionnel**
- ✅ **Images stockées dans Supabase Storage**
- ✅ **URLs générées et sauvegardées**
- ✅ **Images affichées dans les profils**

---

**Note** : Le type `TEXT` pour `image_url` est correct. Le problème vient des permissions Storage, pas du schéma de base de données.
