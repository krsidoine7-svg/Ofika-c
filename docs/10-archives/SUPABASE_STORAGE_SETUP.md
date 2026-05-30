# 🪣 Configuration de Supabase Storage pour NFC Assets

## 📝 Objectif
Créer un bucket de stockage dans Supabase pour les logos et photos de profil des cartes NFC.

---

## ✅ Étapes de configuration

### 1️⃣ Accéder à Supabase Dashboard

1. Aller sur https://supabase.com
2. Sélectionner votre projet
3. Dans le menu latéral, cliquer sur **"Storage"**

---

### 2️⃣ Créer le bucket `nfc-assets`

1. Cliquer sur **"New bucket"**
2. Remplir les informations :
   - **Name** : `nfc-assets`
   - **Public bucket** : ✅ **Cocher** (pour que les images soient accessibles publiquement)
   - **File size limit** : `5 MB` (ou laisser par défaut)
   - **Allowed MIME types** : Laisser vide (pour accepter tous les types d'images)

3. Cliquer sur **"Create bucket"**

---

### 3️⃣ Configurer les politiques d'accès (RLS)

Le bucket doit être **public** pour que les images soient visibles.

#### Option A : Via l'interface Supabase

1. Cliquer sur le bucket `nfc-assets`
2. Aller dans l'onglet **"Policies"**
3. Cliquer sur **"New policy"**
4. Choisir **"For full customization"**
5. Créer 2 politiques :

**Politique 1 : Lecture publique**
```sql
-- Nom : Public read access
-- Target roles : public
-- Operation : SELECT

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'nfc-assets');
```

**Politique 2 : Upload pour utilisateurs authentifiés**
```sql
-- Nom : Authenticated users can upload
-- Target roles : authenticated
-- Operation : INSERT

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'nfc-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Politique 3 : Suppression par le propriétaire**
```sql
-- Nom : Users can delete own files
-- Target roles : authenticated
-- Operation : DELETE

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'nfc-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Option B : Via SQL Editor

Aller dans **SQL Editor** et exécuter :

```sql
-- Créer le bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('nfc-assets', 'nfc-assets', true);

-- Politique de lecture publique
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'nfc-assets');

-- Politique d'upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'nfc-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique de suppression par le propriétaire
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'nfc-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

### 4️⃣ Structure des dossiers

Le service d'upload créera automatiquement cette structure :

```
nfc-assets/
├── logos/
│   ├── user-id-1/
│   │   ├── 1234567890.png
│   │   └── 1234567891.jpg
│   └── user-id-2/
│       └── 1234567892.svg
└── photos/
    ├── user-id-1/
    │   └── 1234567890.jpg
    └── user-id-2/
        └── 1234567891.png
```

---

### 5️⃣ Vérifier la configuration

#### Test manuel

1. Aller dans **Storage** → **nfc-assets**
2. Cliquer sur **"Upload file"**
3. Uploader une image test
4. Cliquer sur l'image → **"Get public URL"**
5. Ouvrir l'URL dans un nouvel onglet
6. ✅ L'image doit s'afficher !

#### Test via code

Créer une carte NFC avec un logo :

```typescript
// L'upload devrait se faire automatiquement
const result = await createCard({
  profile_name: "Test",
  company: "Ofika",
  logoFile: fichierLogo,  // File object
  // ...
})

// Vérifier dans les logs
console.log('Logo URL:', result.data.logo_url)
// Devrait afficher : https://xxx.supabase.co/storage/v1/object/public/nfc-assets/logos/user-id/timestamp.png
```

---

## 🔍 Vérification des URLs

Les URLs générées auront ce format :

```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/nfc-assets/logos/[USER_ID]/[TIMESTAMP].png
```

Example :
```
https://graqvtzmefiwsafaubcw.supabase.co/storage/v1/object/public/nfc-assets/logos/abc-123-xyz/1733702400000.png
```

---

## ⚠️ Problèmes courants

### Erreur : "Bucket not found"
**Solution** : Vérifier que le bucket `nfc-assets` est créé et public

### Erreur : "RLS policy violation"
**Solution** : Vérifier que les politiques RLS sont correctement configurées

### Erreur : "File too large"
**Solution** : Le fichier dépasse 5MB, réduire la taille

### Image ne s'affiche pas
**Solution** : Vérifier que le bucket est bien **public**

---

## 🎯 Résultat attendu

Après configuration :

1. ✅ Les logos et photos sont uploadés vers Supabase Storage
2. ✅ Les URLs sont permanentes et publiques
3. ✅ Les images s'affichent sur les cartes NFC
4. ✅ Les images restent visibles après rafraîchissement
5. ✅ Chaque utilisateur a son propre dossier

---

## 📊 Vérification finale

```sql
-- Vérifier les fichiers uploadés
SELECT *
FROM storage.objects
WHERE bucket_id = 'nfc-assets'
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier les cartes NFC avec logos
SELECT id, profile_name, logo_url, profile_photo_url
FROM nfc_profiles
WHERE logo_url IS NOT NULL
ORDER BY created_at DESC;
```

---

## ✅ Checklist

- [ ] Bucket `nfc-assets` créé
- [ ] Bucket configuré en **public**
- [ ] Politique de lecture publique activée
- [ ] Politique d'upload pour utilisateurs authentifiés activée
- [ ] Politique de suppression configurée
- [ ] Test manuel d'upload réussi
- [ ] URL publique fonctionne
- [ ] Test via code réussi
