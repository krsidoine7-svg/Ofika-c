# 🍎 Configuration Apple OAuth - Ofika

## Configuration Requise

### 1. Apple Developer Account
- Créer un compte Apple Developer (99$/an)
- Accéder à [developer.apple.com](https://developer.apple.com)

### 2. Créer un App ID
1. Aller dans **Certificates, Identifiers & Profiles**
2. Cliquer sur **Identifiers** → **+**
3. Sélectionner **App IDs** → **Continue**
4. Choisir **App** → **Continue**
5. Remplir :
   - **Description** : Ofika
   - **Bundle ID** : `com.ofika.app` (ou votre domaine)
6. Activer **Sign In with Apple** dans les capabilities
7. **Register**

### 3. Créer un Service ID
1. Dans **Identifiers** → **+**
2. Sélectionner **Services IDs** → **Continue**
3. Remplir :
   - **Description** : Ofika Web
   - **Identifier** : `com.ofika.web` (ou votre choix)
4. Cocher **Sign In with Apple** → **Configure**
5. Sélectionner l'App ID créé précédemment
6. Ajouter les **Return URLs** :
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (développement)
7. **Save** → **Continue** → **Register**

### 4. Créer une Key
1. Dans **Keys** → **+**
2. Remplir :
   - **Key Name** : Ofika Sign In Key
3. Cocher **Sign In with Apple** → **Configure**
4. Sélectionner l'App ID
5. **Save** → **Continue** → **Register**
6. **Download** la clé (.p8 file) - **IMPORTANT** : Sauvegarder !

### 5. Configuration Supabase
1. Aller dans **Authentication** → **Providers** → **Apple**
2. Activer Apple
3. Remplir :
   - **Client ID** : `com.ofika.web` (Service ID)
   - **Client Secret** : Générer avec la clé .p8
   - **Redirect URL** : `https://yourproject.supabase.co/auth/v1/callback`

### 6. Générer le Client Secret
Utiliser ce script Node.js pour générer le secret :

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const teamId = 'YOUR_TEAM_ID'; // Trouvé dans Apple Developer Account
const clientId = 'com.ofika.web'; // Service ID
const keyId = 'YOUR_KEY_ID'; // ID de la clé créée
const privateKey = fs.readFileSync('path/to/AuthKey_XXXXXXXXXX.p8');

const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: teamId,
  iat: now,
  exp: now + 3600, // 1 heure
  aud: 'https://appleid.apple.com',
  sub: clientId
};

const clientSecret = jwt.sign(payload, privateKey, {
  algorithm: 'ES256',
  keyid: keyId
});

console.log('Client Secret:', clientSecret);
```

### 7. Variables d'Environnement
Ajouter dans `.env.local` :

```env
# Apple OAuth
APPLE_CLIENT_ID=com.ofika.web
APPLE_CLIENT_SECRET=your_generated_secret
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
```

## Configuration Supabase

### 1. Activer Apple Provider
```sql
-- Dans Supabase Dashboard > Authentication > Providers
UPDATE auth.providers 
SET enabled = true 
WHERE provider = 'apple';
```

### 2. Configurer les URLs
- **Site URL** : `https://yourdomain.com`
- **Redirect URLs** : 
  - `https://yourdomain.com/auth/callback`
  - `http://localhost:3000/auth/callback`

## Test de l'Intégration

### 1. Test en Développement
```bash
npm run dev
# Aller sur http://localhost:3000/auth/login
# Cliquer sur "Apple"
```

### 2. Test en Production
- Déployer sur votre domaine
- Tester la connexion Apple
- Vérifier la redirection

## Dépannage

### Erreur "Invalid Client"
- Vérifier que le Service ID est correct
- Vérifier que Sign In with Apple est activé
- Vérifier les URLs de redirection

### Erreur "Invalid Grant"
- Vérifier le Client Secret
- Vérifier que la clé .p8 est valide
- Vérifier les dates d'expiration

### Erreur "Redirect URI Mismatch"
- Vérifier les URLs dans Apple Developer
- Vérifier les URLs dans Supabase
- Vérifier que les URLs correspondent exactement

## Sécurité

### Bonnes Pratiques
- **Ne jamais commiter** la clé .p8
- **Renouveler** les clés régulièrement
- **Utiliser HTTPS** en production
- **Valider** les tokens côté serveur

### Variables Sensibles
```env
# À ne jamais commiter
APPLE_PRIVATE_KEY_PATH=/path/to/AuthKey_XXXXXXXXXX.p8
APPLE_CLIENT_SECRET=your_generated_secret
```

## Support

### Documentation Officielle
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Supabase Apple OAuth](https://supabase.com/docs/guides/auth/social-login/auth-apple)

### Ressources Utiles
- [Apple Developer Console](https://developer.apple.com/account/)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

**Note** : Apple OAuth nécessite un compte Apple Developer payant. Pour les tests, vous pouvez utiliser Google OAuth qui est gratuit.
