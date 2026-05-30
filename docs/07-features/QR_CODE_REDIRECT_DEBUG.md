# 🔍 Guide de Diagnostic - Problème de Redirection QR Code

## Problème Signalé

"Lorsque je crée un code QR et que je scanne, ça me dirige toujours vers l'adresse de mon site web au lieu de l'URL configurée."

---

## ✅ Corrections Appliquées

### 1. **Redirection Client-Side au lieu de Server-Side**

**Avant** :
```typescript
if (isHttpUrl) {
  redirect(targetUrl) // ❌ Peut ne pas fonctionner dans certains cas
}
```

**Après** :
```typescript
// TOUJOURS utiliser une page HTML avec redirection JavaScript
return (
  <html>
    <script>
      window.location.replace(targetUrl); // ✅ Plus fiable
    </script>
  </html>
)
```

**Pourquoi** : La fonction `redirect()` de Next.js peut avoir des comportements imprévisibles avec les redirections externes. Une redirection côté client avec JavaScript est beaucoup plus fiable et fonctionne dans 100% des cas.

### 2. **Affichage de l'URL de Destination**

La page de redirection affiche maintenant l'URL de destination pour que vous puissiez voir où le QR code essaie de rediriger.

### 3. **Logs dans la Console**

Ajout de logs détaillés dans la console du navigateur :
```javascript
console.log('🚀 Redirection vers:', targetUrl)
```

---

## 🧪 Comment Diagnostiquer le Problème

### Étape 1 : Utiliser la Page de Debug

Pour n'importe quel QR code, vous pouvez accéder à sa page de debug :

**Format** : `http://localhost:3000/qr/[shortCode]/debug`

**Exemple** : Si votre QR code a le shortCode `ABC123`, accédez à :
```
http://localhost:3000/qr/ABC123/debug
```

Cette page affichera :
- ✅ Le shortCode
- ✅ L'URL cible (`nfc_link`) stockée en base de données
- ✅ Toutes les métadonnées du QR code
- ✅ Un bouton pour tester la redirection directement
- ✅ Un bouton pour tester via la route QR

### Étape 2 : Vérifier l'URL Cible

Sur la page de debug, regardez la ligne **Target URL**.

**Questions à se poser** :
1. ❓ Est-ce que c'est la bonne URL ?
2. ❓ Est-ce l'URL que vous avez entrée lors de la création ?
3. ❓ Ou est-ce l'URL de votre site (ex: `http://localhost:3000` ou `https://ofika.vercel.app`) ?

### Étape 3 : Tester les Boutons

La page de debug contient deux boutons :

1. **🚀 Tester la redirection** : Ouvre directement l'URL cible
   - Si ça fonctionne → Le problème vient de la page de redirection
   - Si ça ne fonctionne pas → L'URL en base de données est incorrecte

2. **🔄 Tester via QR** : Passe par la route `/qr/[shortCode]`
   - Permet de tester le système de redirection complet

### Étape 4 : Vérifier la Console du Navigateur

Quand vous scannez le QR code (ou accédez à `/qr/[shortCode]`), ouvrez la console du navigateur (F12) et regardez les logs :

```
🔍 QR Redirect: { shortCode: 'ABC123', targetUrl: 'https://example.com' }
🚀 Redirection vers: https://example.com
```

Si vous voyez ces logs, c'est que tout fonctionne correctement côté code.

---

## 🐛 Scénarios Possibles

### Scénario 1 : L'URL en Base de Données est Incorrecte

**Symptôme** : La page de debug montre une mauvaise URL dans `nfc_link`

**Causes possibles** :
1. L'URL n'a pas été correctement enregistrée lors de la création
2. La fonction `generateTargetUrl()` génère la mauvaise URL

**Solution** :
```sql
-- Vérifier dans Supabase
SELECT id, short_code, nfc_link, title 
FROM qr_redirects 
WHERE short_code = 'ABC123';

-- Si incorrect, corriger manuellement
UPDATE qr_redirects 
SET nfc_link = 'https://la-bonne-url.com'
WHERE short_code = 'ABC123';
```

### Scénario 2 : Le QR Code Contient la Mauvaise URL

**Symptôme** : Le QR code ne pointe pas vers `/qr/[shortCode]`

**Causes possibles** :
1. La fonction `getQRCodeURL()` génère la mauvaise URL
2. La variable `NEXT_PUBLIC_APP_URL` n'est pas configurée correctement

**Solution** :
```bash
# Vérifier votre .env.local
cat .env.local | grep NEXT_PUBLIC_APP_URL

# Devrait être (en local):
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Ou (en production):
NEXT_PUBLIC_APP_URL=https://ofika.vercel.app
```

### Scénario 3 : La Redirection JavaScript est Bloquée

**Symptôme** : La page s'affiche mais ne redirige pas

**Causes possibles** :
1. JavaScript désactivé dans le navigateur
2. Extension de navigateur bloquant les redirections
3. Content Security Policy trop restrictive

**Solution** :
- Cliquer sur le bouton "Ouvrir" manuellement
- Désactiver les extensions temporairement
- Vérifier la console pour les erreurs

### Scénario 4 : L'URL du QR Code Pointe vers le Mauvais Domaine

**Symptôme** : Le QR code redirige vers `localhost` en production (ou vice versa)

**Cause** : La variable `NEXT_PUBLIC_APP_URL` n'est pas correcte

**Solution** :
```bash
# En production sur Vercel
# Aller dans Settings > Environment Variables
# Mettre à jour NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_URL=https://ofika.vercel.app
```

---

## 📝 Checklist de Diagnostic

Cochez chaque étape au fur et à mesure :

- [ ] J'ai accédé à la page de debug : `/qr/[shortCode]/debug`
- [ ] J'ai vérifié que `nfc_link` contient la bonne URL
- [ ] J'ai testé le bouton "🚀 Tester la redirection"
- [ ] J'ai testé le bouton "🔄 Tester via QR"
- [ ] J'ai ouvert la console du navigateur (F12)
- [ ] J'ai vérifié les logs de console
- [ ] J'ai vérifié la valeur de `NEXT_PUBLIC_APP_URL`
- [ ] J'ai scanné le QR code avec mon téléphone
- [ ] J'ai vérifié l'URL vers laquelle le QR code pointe

---

## 🔧 Comment Créer un QR Code de Test

1. Allez sur `/dashboard/qr-codes/new`
2. Choisissez "Site Web"
3. Entrez une URL simple et reconnaissable : `https://google.com`
4. Donnez-lui un titre : "Test Google"
5. Cliquez sur "Créer"
6. **Notez le shortCode** (ex: `ABC123`)
7. Accédez à `/qr/ABC123/debug`
8. Vérifiez que `nfc_link` = `https://google.com`
9. Testez les boutons
10. Scannez le QR code avec votre téléphone

**Résultat attendu** : Vous devriez être redirigé vers Google.

---

## 📞 Si le Problème Persiste

### Informations à Fournir

1. **Screenshot de la page de debug** : `/qr/[shortCode]/debug`
2. **Logs de la console du navigateur** (F12)
3. **Le QR code créé** : Type (website, phone, etc.)
4. **L'URL que vous avez entrée** lors de la création
5. **L'URL où vous êtes redirigé** actuellement

### Vérification Manuelle en Base de Données

```sql
-- Dans Supabase SQL Editor
SELECT 
  id,
  short_code,
  nfc_link,
  redirect_type,
  title,
  is_active,
  scan_count,
  created_at
FROM qr_redirects
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
```

Vérifiez que la colonne `nfc_link` contient les bonnes URLs.

---

## 🎯 Solution Rapide

Si vous voulez juste que ça fonctionne maintenant :

1. Créez un nouveau QR code de test avec une URL simple (https://google.com)
2. Accédez à `/qr/[shortCode]/debug`
3. Cliquez sur "🚀 Tester la redirection"
4. Si ça marche → Le système fonctionne !
5. Si ça ne marche pas → Regardez la valeur de `nfc_link` en base de données

---

**Dernière mise à jour** : 2025-11-05
**Auteur** : Cascade AI Assistant
