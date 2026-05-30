# 🔧 Dépannage : Photo de couverture ne s'uploade pas

## ✅ Vérifications effectuées

1. ✅ La colonne `cover_image_url` existe dans la table `profiles`
2. ✅ Le bucket `profile-images` existe et est public
3. ⚠️ Les politiques RLS du bucket doivent être vérifiées

## 🎯 Solutions à appliquer

### Solution 1 : Vérifier les politiques RLS du bucket Storage

**Étapes** :

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Storage** > **profile-images**
4. Cliquez sur **Policies**
5. Exécutez le script SQL `scripts/fix-storage-policies.sql`

**OU exécutez directement ce SQL** :

```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent uploader" ON storage.objects;
DROP POLICY IF EXISTS "Images publiques accessibles" ON storage.objects;
DROP POLICY IF EXISTS "Propriétaires peuvent supprimer" ON storage.objects;
DROP POLICY IF EXISTS "Propriétaires peuvent mettre à jour" ON storage.objects;

-- Créer les nouvelles politiques
CREATE POLICY "Utilisateurs authentifiés peuvent uploader"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Images publiques accessibles"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-images');

CREATE POLICY "Propriétaires peuvent mettre à jour"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Propriétaires peuvent supprimer"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Solution 2 : Vérifier les types MIME autorisés

Le bucket doit accepter les images. Vérifiez dans **Storage** > **profile-images** > **Configuration** :

**Types MIME autorisés** :
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`

### Solution 3 : Vérifier la taille maximale

Dans **Storage** > **profile-images** > **Configuration** :

**Taille maximale** : Au moins **5 MB** (5242880 bytes)

### Solution 4 : Tester l'upload manuellement

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet **Console**
3. Essayez d'uploader une photo de couverture
4. Regardez les messages d'erreur :
   - `Upload error:` → Erreur d'upload
   - `Error uploading image:` → Erreur générale
   - `Erreur de validation` → Problème de formulaire

### Solution 5 : Vérifier l'authentification

```javascript
// Dans la console du navigateur
const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(
  'VOTRE_SUPABASE_URL',
  'VOTRE_SUPABASE_ANON_KEY'
)
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
```

Si `user` est `null`, vous n'êtes pas authentifié.

## 🔍 Messages d'erreur courants

### "Utilisateur non authentifié"
➡️ Reconnectez-vous à votre compte

### "new row violates row-level security policy"
➡️ Les politiques RLS ne sont pas configurées correctement
➡️ Exécutez le script SQL de la Solution 1

### "mime type ... is not supported"
➡️ Le type de fichier n'est pas autorisé
➡️ Vérifiez la Solution 2

### "payload too large"
➡️ Le fichier est trop volumineux
➡️ Vérifiez la Solution 3

### "bucket not found"
➡️ Le bucket n'existe pas
➡️ Créez le bucket `profile-images` dans Storage

## ✅ Checklist finale

- [ ] Colonne `cover_image_url` existe dans `profiles`
- [ ] Bucket `profile-images` existe et est public
- [ ] Politiques RLS configurées (4 politiques)
- [ ] Types MIME autorisés (images)
- [ ] Taille maximale >= 5 MB
- [ ] Utilisateur authentifié
- [ ] Cache du navigateur vidé (Ctrl+Shift+R)

## 🆘 Si ça ne marche toujours pas

**Copiez-moi les messages d'erreur exacts de la console du navigateur** :

1. Ouvrez la console (F12)
2. Allez dans l'onglet **Console**
3. Essayez d'uploader
4. Copiez TOUS les messages en rouge
5. Envoyez-moi les messages

**Exemple de ce que je veux voir** :
```
Upload error: {message: "...", name: "...", ...}
Error uploading image: Error: ...
```











git commit -m "feat: amelioration UX et fonctionnalites Beta - Deplacer bouton Ajouter aux contacts apres la bio dans tous designs - Ajouter acces QR codes dans dashboard header et quick actions - Rendre bouton Commander responsive sur mobile - Masquer champ photo de couverture dans formulaire - Mettre creation et commande carte NFC en BETA avec modale - Corriger validation design_choice ajouter tous designs - Ameliorer label dynamique ImageUpload"




