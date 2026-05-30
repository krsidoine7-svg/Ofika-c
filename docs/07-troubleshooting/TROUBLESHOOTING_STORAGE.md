# 🔧 Dépannage - Erreur "Bucket not found"

## ❌ Erreur rencontrée
```
StorageApiError: Bucket not found
```

## ✅ Solutions rapides

### Solution 1 : Configuration automatique (Recommandée)
1. **Rechargez la page** où vous essayez d'uploader une image
2. Le système va **automatiquement détecter** que le bucket n'existe pas
3. Un message "Configuration du stockage en cours..." va apparaître
4. Le bucket sera **créé automatiquement**
5. L'upload devrait maintenant fonctionner

### Solution 2 : Configuration manuelle via Supabase

#### Via l'interface Supabase :
1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"Storage"**
4. Cliquez sur **"New bucket"**
5. Créez un bucket avec ces paramètres :
   - **Nom** : `profile-images`
   - **Public** : ✅ Oui
   - **File size limit** : `5MB`
   - **Allowed MIME types** : `image/jpeg, image/png, image/gif, image/webp`

#### Via SQL (Alternative) :
1. Dans Supabase, allez dans **"SQL Editor"**
2. Exécutez cette commande :
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;
```

### Solution 3 : Vérification des permissions

Assurez-vous que votre utilisateur a les bonnes permissions :
1. Vérifiez que vous êtes **connecté** à l'application
2. Vérifiez que votre **clé API Supabase** est correcte
3. Vérifiez que les **variables d'environnement** sont bien configurées

## 🔍 Diagnostic

### Vérifier si le bucket existe :
```javascript
// Dans la console du navigateur
const supabase = createClient()
const { data, error } = await supabase.storage.listBuckets()
console.log('Buckets:', data)
```

### Vérifier les permissions :
```javascript
// Tester l'upload
const file = new File(['test'], 'test.txt', { type: 'text/plain' })
const { error } = await supabase.storage
  .from('profile-images')
  .upload('test.txt', file)
console.log('Upload test:', error)
```

## 🚨 Erreurs courantes

### "Insufficient permissions"
- **Cause** : L'utilisateur n'est pas authentifié
- **Solution** : Connectez-vous à l'application

### "Bucket already exists"
- **Cause** : Le bucket existe déjà
- **Solution** : Ignorez cette erreur, c'est normal

### "File too large"
- **Cause** : L'image dépasse 5MB
- **Solution** : Compressez l'image ou choisissez une image plus petite

### "Invalid file type"
- **Cause** : Le fichier n'est pas une image
- **Solution** : Utilisez JPG, PNG, GIF ou WebP

## 📞 Support

Si le problème persiste :
1. Vérifiez les **logs de la console** du navigateur
2. Vérifiez les **logs Supabase** dans le dashboard
3. Vérifiez que votre **projet Supabase** est actif
4. Contactez le support technique avec les détails de l'erreur

## ✅ Vérification finale

Après avoir appliqué une solution :
1. **Rechargez** la page
2. **Essayez d'uploader** une image
3. Vérifiez que l'image apparaît dans le **bucket Supabase**
4. Vérifiez que l'image s'affiche dans le **profil**

---

**Note** : Cette erreur ne devrait se produire qu'une seule fois lors de la première utilisation. Une fois le bucket créé, l'upload fonctionnera normalement.
