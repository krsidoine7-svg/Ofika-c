# 🔐 Configuration de l'Authentification - Ofika

## Variables d'Environnement Requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_database_url

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Configuration Supabase

### 1. Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et les clés API

### 2. Configurer l'authentification
1. Dans le dashboard Supabase, allez dans Authentication > Settings
2. Activez les providers suivants :
   - Email/Password
   - Google OAuth

### 3. Configuration Google OAuth
1. Allez dans Authentication > Providers > Google
2. Activez Google
3. Ajoutez votre Client ID et Client Secret
4. Configurez les URLs de redirection :
   - `http://localhost:3000/auth/callback` (développement)
   - `https://yourdomain.com/auth/callback` (production)

### 4. Configuration de la base de données
1. Allez dans SQL Editor
2. Exécutez le script de création des tables (voir `prisma/schema.prisma`)

## Fonctionnalités Implémentées

### ✅ Pages d'Authentification
- **Connexion** : `/auth/login`
- **Inscription** : `/auth/signup`
- **Vérification email** : `/auth/verify-email`

### ✅ Composants
- `LoginForm` : Formulaire de connexion avec OAuth Google
- `SignupForm` : Formulaire d'inscription avec validation
- `ProtectedRoute` : Protection des routes privées
- `LogoutButton` : Bouton de déconnexion

### ✅ Hooks
- `useAuth` : Hook pour gérer l'état d'authentification

### ✅ Middleware
- Redirection automatique selon l'état de connexion
- Protection des routes privées

## Utilisation

### Connexion
```tsx
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return <LoginForm />
}
```

### Protection de route
```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  )
}
```

### Hook d'authentification
```tsx
import { useAuth } from "@/lib/hooks/useAuth"

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Chargement...</div>
  if (!user) return <div>Non connecté</div>
  
  return <div>Connecté en tant que {user.email}</div>
}
```

## Prochaines Étapes

1. **Configurer Supabase** avec les variables d'environnement
2. **Tester l'authentification** en local
3. **Implémenter le dashboard** utilisateur
4. **Ajouter la gestion des profils** (Module 2)

## Dépannage

### Erreur "Missing Supabase URL"
- Vérifiez que les variables d'environnement sont correctement définies
- Redémarrez le serveur de développement

### Erreur OAuth Google
- Vérifiez la configuration Google OAuth dans Supabase
- Vérifiez les URLs de redirection
- Vérifiez les clés Client ID et Secret

### Erreur de base de données
- Vérifiez la connexion à Supabase
- Vérifiez que les tables sont créées
- Vérifiez les permissions RLS
