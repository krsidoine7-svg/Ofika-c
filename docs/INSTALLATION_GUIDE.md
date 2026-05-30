# 📦 Guide d'Installation - Fonctionnalités Ofika

## 🚀 Installation Rapide (5 minutes)

### Étape 1 : Installation des dépendances

```bash
# Installer les packages nécessaires
npm install emoji-picker-react web-push
```

### Étape 2 : Configuration des variables d'environnement

Ajouter dans votre `.env.local` :

```env
# VAPID Keys pour Web Push (générer avec web-push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

**Générer les clés VAPID :**

```bash
npx web-push generate-vapid-keys
```

### Étape 3 : Appliquer les migrations SQL

1. Ouvrir **Supabase Studio** → SQL Editor
2. Copier le contenu de `database/migrations/001_features_setup.sql`
3. Exécuter le script

**OU via CLI :**

```bash
npx supabase db push
```

### Étape 4 : Déployer l'Edge Function

```bash
# Se connecter à Supabase
npx supabase login

# Déployer la fonction
npx supabase functions deploy send-push-notifications --no-verify-jwt

# Définir les secrets
npx supabase secrets set VAPID_PRIVATE_KEY=your-private-key
npx supabase secrets set VAPID_PUBLIC_KEY=your-public-key
```

### Étape 5 : Copier le Service Worker

Créer manuellement `public/sw.js` avec le contenu du fichier template (bloqué par gitignore).

### Étape 6 : Enregistrer le Service Worker

Ajouter dans `app/layout.tsx` :

```tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.error('SW error:', err))
  }
}, [])
```

---

## 🧪 Tests

### Test des emojis

```tsx
import { EmojiPicker } from '@/components/features/contacts/EmojiPicker'

<EmojiPicker 
  selectedEmojis={['😊', '💼']}
  onEmojiToggle={(emoji) => console.log(emoji)}
/>
```

### Test des notifications

1. Activer les notifications dans le composant
2. Vérifier dans Supabase → Table `push_subscriptions`
3. Envoyer une notification test via Edge Function :

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-push-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ofika",
    "body": "Ceci est un test de notification",
    "userId": "user-uuid-here"
  }'
```

### Test du RGPD

```tsx
import { RGPDConsentModal } from '@/components/features/consent/RGPDConsentModal'

<RGPDConsentModal 
  userId={user.id}
  onConsentGiven={() => console.log('Consent given')}
/>
```

---

## 📊 Vérification de l'installation

### Vérifier les tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('push_subscriptions', 'contact_activities', 'user_consents');
```

### Vérifier les RLS policies

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('push_subscriptions', 'contact_activities', 'user_consents');
```

### Vérifier les fonctions

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('get_forgotten_contacts', 'log_contact_activity');
```

---

## 🔄 Cron Job Hebdomadaire (Optionnel)

Pour activer les rappels automatiques chaque lundi à 9h :

```sql
-- Installer pg_cron (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer le job
SELECT cron.schedule(
  'weekly-forgotten-contacts',
  '0 9 * * 1', -- Lundi 9h
  $$
  SELECT send_push_notification_to_users();
  $$
);
```

**Note :** pg_cron est disponible dans Supabase Pro (25$/mois). Pour le free tier, utiliser Vercel Cron Jobs ou GitHub Actions.

### Alternative Free : Vercel Cron

Créer `app/api/cron/weekly-reminders/route.ts` :

```ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Logique pour envoyer les rappels
  // ...

  return Response.json({ success: true })
}
```

Configurer dans `vercel.json` :

```json
{
  "crons": [{
    "path": "/api/cron/weekly-reminders",
    "schedule": "0 9 * * 1"
  }]
}
```

---

## 💰 Coûts estimés

| Service | Free Tier | Avec Ofika | Coût |
|---------|-----------|------------|------|
| **Supabase** | 500MB DB, 1GB Storage | ✅ Suffisant | 0€ |
| **Vercel** | 100GB Bandwidth | ✅ Suffisant | 0€ |
| **Web Push** | Illimité | ✅ Natif navigateur | 0€ |
| **pg_cron** | ❌ Pro only | Alternative Vercel Cron | 0€ |

**Total : 0€/mois** jusqu'à ~10,000 utilisateurs actifs

---

## 🆘 Troubleshooting

### Notifications ne s'affichent pas

1. Vérifier que HTTPS est activé (requis pour Web Push)
2. Vérifier les permissions du navigateur
3. Vérifier que le Service Worker est enregistré :

```js
navigator.serviceWorker.getRegistrations().then(console.log)
```

### Erreur VAPID

- Vérifier que les clés sont bien définies dans `.env.local`
- Régénérer les clés si nécessaire

### RLS bloque les requêtes

- Vérifier que l'utilisateur est authentifié
- Vérifier les policies avec `\dp table_name` dans psql

---

## 📚 Ressources

- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [RGPD - Guide CNIL](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
