# 📁 Comment le logo est enregistré dans la base de données

## 🔄 Flux complet d'upload du logo

### 1️⃣ **Upload côté client** (NFCCardFormStep.tsx)

```typescript
// L'utilisateur sélectionne un fichier
const handleLogoUpload = (event) => {
  const file = event.target.files?.[0]  // Fichier: logo.png
  
  // Validation
  - Type accepté : PNG, JPG, SVG
  - Taille max : 5MB
  
  // Création d'une URL de prévisualisation locale
  const previewUrl = URL.createObjectURL(file)
  // Exemple : "blob:http://localhost:3000/abc-123-xyz"
  
  // Stockage temporaire dans le state
  setLogoFile(file)          // Fichier brut
  setLogoPreview(previewUrl) // URL blob locale
  
  // Mise à jour du formulaire
  onDataChange({
    logoFile: file,          // ← Fichier File object
    logoUrl: previewUrl      // ← URL blob temporaire
  })
}
```

---

### 2️⃣ **Soumission du formulaire** (page.tsx)

```typescript
const handleCreateCard = async () => {
  const cardData = {
    profile_name: "Ma Carte",
    company: "Ofika",
    // ...
    
    logoUrl: formData.logoUrl,      // ← URL blob temporaire
    logoFile: formData.logoFile,    // ← Fichier File object
  }
  
  const result = await createCard(cardData)
}
```

---

### 3️⃣ **Service de création** (nfc-cards.ts)

```typescript
export async function createNFCCard(cardData) {
  // Préparer les données pour la DB
  const insertData = {
    user_id: user.id,
    full_name: cardData.fullName,
    company: cardData.company,
    // ...
    
    logo_url: cardData.logoUrl || '',  // ← URL blob stockée !
  }
  
  // ❌ PROBLÈME : Le fichier n'est PAS uploadé !
  // ❌ L'URL blob est TEMPORAIRE et ne fonctionne pas après !
  
  const { data, error } = await supabase
    .from('nfc_profiles')
    .insert(insertData)
}
```

---

## ⚠️ PROBLÈME DÉTECTÉ

### Ce qui se passe actuellement :

```
1. User upload logo.png
   ↓
2. Création URL blob: "blob:http://localhost:3000/abc-123"
   ↓
3. Stockage dans DB: logo_url = "blob:http://localhost:3000/abc-123"
   ↓
4. ❌ L'URL blob n'est valide que dans la session actuelle !
   ↓
5. ❌ Après rafraîchissement → logo cassé !
```

---

## ✅ SOLUTION : Upload vers Supabase Storage

### Il faut modifier le code pour :

```typescript
// 1. Uploader le fichier vers Supabase Storage
const uploadLogo = async (file: File, userId: string) => {
  const fileName = `logos/${userId}/${Date.now()}_${file.name}`
  
  const { data, error } = await supabase.storage
    .from('nfc-assets')  // Bucket Supabase
    .upload(fileName, file)
  
  if (error) throw error
  
  // 2. Récupérer l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('nfc-assets')
    .getPublicUrl(fileName)
  
  return publicUrl
  // Exemple : "https://xxx.supabase.co/storage/v1/object/public/nfc-assets/logos/user123/1234_logo.png"
}

// 3. Utiliser cette URL dans la DB
const logoUrl = await uploadLogo(cardData.logoFile, user.id)

const insertData = {
  // ...
  logo_url: logoUrl  // ← URL permanente Supabase !
}
```

---

## 📊 Tableau comparatif

| Aspect | Actuellement (❌) | Souhaité (✅) |
|--------|-------------------|---------------|
| **Upload** | Pas d'upload | Supabase Storage |
| **URL stockée** | `blob:http://...` | `https://xxx.supabase.co/...` |
| **Validité** | Session uniquement | Permanente |
| **Affichage** | ❌ Cassé après refresh | ✅ Toujours visible |
| **Champ DB** | `logo_url` | `logo_url` |

---

## 🗄️ Où c'est stocké dans la DB

```sql
Table: nfc_profiles

logo_url (text) → "https://xxx.supabase.co/storage/v1/object/public/nfc-assets/logos/user123/1234_logo.png"
                   ↑
                   URL permanente vers Supabase Storage
```

---

## ❓ Pourquoi ça ne fonctionne pas actuellement ?

1. **Aucun service d'upload n'est appelé** dans `createNFCCard`
2. **L'URL blob est locale** et disparaît après fermeture du navigateur
3. **Le champ `logoFile` (File object) n'est pas envoyé** à la base de données
4. **Supabase Storage n'est pas configuré** pour stocker les images

---

## 🛠️ Actions à faire

### Étape 1 : Créer un bucket Supabase Storage
```sql
-- Dans Supabase Dashboard → Storage
CREATE BUCKET nfc-assets PUBLIC;
```

### Étape 2 : Créer un service d'upload
Fichier : `lib/services/storage.ts`

```typescript
export async function uploadNFCAsset(
  file: File, 
  userId: string, 
  type: 'logo' | 'photo'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const timestamp = Date.now()
    const fileName = `${type}s/${userId}/${timestamp}_${file.name}`
    
    const { data, error } = await supabase.storage
      .from('nfc-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('nfc-assets')
      .getPublicUrl(fileName)
    
    return { success: true, url: publicUrl }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Étape 3 : Modifier `createNFCCard`

```typescript
export async function createNFCCard(cardData) {
  // Upload du logo si présent
  let logoUrl = ''
  if (cardData.logoFile) {
    const uploadResult = await uploadNFCAsset(
      cardData.logoFile, 
      user.id, 
      'logo'
    )
    if (uploadResult.success) {
      logoUrl = uploadResult.url
    }
  }
  
  const insertData = {
    // ...
    logo_url: logoUrl  // ← URL Supabase Storage
  }
  
  await supabase.from('nfc_profiles').insert(insertData)
}
```

---

## ✅ Résultat final

Après correction :

```
1. User upload logo.png
   ↓
2. Upload vers Supabase Storage
   ↓
3. Génération URL publique permanente
   ↓
4. Stockage dans DB: logo_url = "https://xxx.supabase.co/..."
   ↓
5. ✅ Logo visible partout, tout le temps !
```

---

## 🎯 Conclusion

**Actuellement** : Le logo n'est **PAS vraiment enregistré**. L'URL blob est temporaire.

**Champ utilisé** : `nfc_profiles.logo_url`

**Problème** : Aucun upload réel vers un serveur de stockage.

**Solution** : Intégrer Supabase Storage pour uploader les fichiers.

Voulez-vous que j'implémente cette correction ?
