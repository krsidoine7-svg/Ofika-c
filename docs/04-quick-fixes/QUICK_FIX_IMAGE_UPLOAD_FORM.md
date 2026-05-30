# 🖼️ Résolution rapide - Problème d'upload d'image dans le formulaire

## ❌ Problème identifié
L'upload d'image de profil ne fonctionne pas dans le formulaire de création de lien bio.

## 🔍 Causes possibles
1. **Bucket Storage manquant** ou mal configuré
2. **Politiques RLS** incorrectes pour Storage
3. **Permissions utilisateur** insuffisantes
4. **Validation de fichier** trop stricte
5. **Erreur de configuration** Supabase

## ✅ Solutions

### Solution 1 : Corriger la configuration Storage (PRIORITÉ HAUTE)

#### Exécuter le script `fix-image-upload-issues.sql`
```sql
-- Créer le bucket profile-images
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
```

### Solution 2 : Utiliser le composant de diagnostic

#### Ajouter le diagnostic à votre page
```typescript
import { ImageUploadDebugger } from '@/components/ImageUploadDebugger'

// Dans votre composant
<ImageUploadDebugger />
```

### Solution 3 : Vérifier la validation des fichiers

#### Types de fichiers supportés
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

#### Taille maximale
- **5MB** maximum par fichier

### Solution 4 : Tester l'upload manuellement

#### Via l'interface Supabase
1. Allez dans **"Storage"** dans Supabase
2. Vérifiez que le bucket `profile-images` existe
3. Testez l'upload d'une image manuellement

## 🚀 Actions à effectuer

### 1. Immédiat (2 minutes)
```sql
-- Exécuter dans Supabase SQL Editor
-- Voir le fichier fix-image-upload-issues.sql
```

### 2. Diagnostic (3 minutes)
```typescript
// Ajouter le composant de diagnostic
<ImageUploadDebugger />
```

### 3. Test (2 minutes)
1. **Sélectionner** une image (JPEG, PNG, GIF, WebP)
2. **Taille** inférieure à 5MB
3. **Tester** l'upload dans le formulaire

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
AND policyname LIKE '%profile images%';
```

### Vérifier les logs
1. Allez dans **"Logs"** dans Supabase
2. Filtrez par **"Storage"**
3. Regardez les erreurs d'upload

## 🚨 Si le problème persiste

### Vérifier l'authentification
1. **Assurez-vous d'être connecté** à l'application
2. **Vérifiez le token** dans les DevTools
3. **Reconnectez-vous** si nécessaire

### Vérifier les permissions
```sql
-- Vérifier les rôles de l'utilisateur
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  'User permissions' as test;
```

### Vérifier la configuration
1. **Bucket** : `profile-images` existe et est public
2. **Politiques** : RLS activé avec bonnes permissions
3. **Types** : MIME types autorisés
4. **Taille** : Limite de 5MB

## 📋 Checklist de résolution

- [ ] Bucket `profile-images` créé et configuré
- [ ] Politiques RLS Storage créées
- [ ] Utilisateur connecté et authentifié
- [ ] Fichier image valide (type + taille)
- [ ] Test d'upload réussi
- [ ] Image affichée dans le formulaire

## 🔧 Scripts fournis

1. **`fix-image-upload-issues.sql`** - Corrige la configuration Storage
2. **`ImageUploadDebugger.tsx`** - Composant de diagnostic
3. **`QUICK_FIX_IMAGE_UPLOAD_FORM.md`** - Guide de résolution

## ✅ Résultat attendu

Après la correction :
- ✅ **Upload d'images fonctionnel** dans le formulaire
- ✅ **Images stockées** dans Supabase Storage
- ✅ **URLs générées** et sauvegardées
- ✅ **Images affichées** dans la prévisualisation

---

**Note** : Commencez par exécuter le script SQL pour corriger la configuration Storage.
