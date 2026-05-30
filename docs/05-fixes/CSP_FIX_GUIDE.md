# 🔧 GUIDE DE CORRECTION CSP (Content Security Policy)

## 🚨 Problème

```
Content Security Policy directive: "connect-src 'self' https://*.supabase.co ..."
Connecting to 'https://ofika.vercel.app/api/orders/create' violates the following Content Security Policy directive.
```

## ✅ Solution appliquée

### 1. **Ajout du domaine au CSP**

J'ai ajouté `https://ofika.vercel.app` à la directive `connect-src` dans :

#### `next.config.mjs`
```javascript
"connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co https://*.vercel.com https://vercel.live https://ofika.vercel.app https://www.google-analytics.com https://analytics.google.com"
```

#### `middleware.ts`
```javascript
"connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co https://*.vercel.com https://vercel.live https://ofika.vercel.app https://www.google-analytics.com https://analytics.google.com"
```

### 2. **Centralisation des URLs**

Dans `lib/config/urls.ts`, j'ai mis à jour l'URL par défaut :
```typescript
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.vercel.app'
```

## 🔄 Pour changer de domaine

### Étape 1 : Mettre à jour la variable d'environnement
```bash
# Dans .env.local
NEXT_PUBLIC_APP_URL=https://votre-nouveau-domaine.com
```

### Étape 2 : Mettre à jour le CSP (si nécessaire)
Si vous changez vers un domaine qui n'est pas déjà dans le CSP, ajoutez-le dans :

1. **next.config.mjs** (ligne 78)
2. **middleware.ts** (ligne 29)

Exemple pour `https://mon-nouveau-site.com` :
```javascript
"connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co https://*.vercel.com https://vercel.live https://ofika.vercel.app https://mon-nouveau-site.com https://www.google-analytics.com https://analytics.google.com"
```

## 🧪 Test après correction

1. **Redémarrez le serveur** :
   ```bash
   npm run build
   npm start
   ```

2. **Testez la création de commande** :
   - Allez sur `/dashboard/orders/new`
   - Cliquez sur "Commander"
   - Vérifiez qu'il n'y a plus d'erreur CSP

3. **Vérifiez la console** :
   - Plus d'erreur CSP
   - Les requêtes API devraient fonctionner

## 🛡️ Sécurité CSP

Le CSP est configuré pour autoriser :

### ✅ Autorisé
- `'self'` : Votre propre domaine
- `https://*.supabase.co` : Base de données Supabase
- `https://*.supabase.com` : Auth Supabase
- `wss://*.supabase.co` : WebSockets Supabase
- `https://*.vercel.com` : Services Vercel
- `https://vercel.live` : Preview Vercel
- `https://ofika.vercel.app` : Votre application
- `https://www.google-analytics.com` : Google Analytics
- `https://analytics.google.com` : Google Analytics

### ❌ Bloqué
- Toutes les autres connexions non listées
- Scripts externes non autorisés
- Iframes de domaines non autorisés

## 📋 Checklist de déploiement

- [ ] Variable `NEXT_PUBLIC_APP_URL` configurée
- [ ] CSP mis à jour avec le nouveau domaine
- [ ] Build et test en local
- [ ] Déploiement en production
- [ ] Test des fonctionnalités API

---

**Le CSP est maintenant configuré pour autoriser votre domaine !** 🎉
