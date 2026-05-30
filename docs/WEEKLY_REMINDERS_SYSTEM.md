# 🔔 Système de Rappels Automatiques - Ofika

## 📋 Vue d'Ensemble

Ce système envoie automatiquement des **notifications push hebdomadaires** aux utilisateurs pour leur rappeler de recontacter les personnes dont ils ont sauvegardé le contact depuis une page Link-in-Bio.

---

## 🎯 Cas d'Usage

```
Client (John Designer) a une page Link-in-Bio : /john-designer
         ↓
Un visiteur (Marie) clique "Ajouter au contact" 📇
         ↓
Contact sauvegardé dans le téléphone de Marie
         ↓
⏰ PROBLÈME : Marie oublie John et ses services !
         ↓
💡 SOLUTION : Notification automatique chaque lundi
         ↓
Marie reçoit : "📇 N'oubliez pas John Designer !"
         ↓
Marie re-contacte John → Business ! 💼
```

---

## ⚙️ Architecture

### 1. **Tracking des Activités**

Chaque fois qu'un contact est ajouté depuis une page Link-in-Bio :

```typescript
// Dans app/[username]/page.tsx
await supabase.rpc('log_contact_activity', {
  p_contact_id: profile.id,
  p_activity_type: 'add',
  p_metadata: { source: 'link_in_bio' }
})
```

Table `contact_activities` enregistre :
- Date de l'ajout
- Type d'activité (add, view, call, email, etc.)
- Métadonnées

### 2. **Détection des Contacts Oubliés**

Fonction SQL `get_forgotten_contacts(days_threshold)` :

```sql
-- Retourne les contacts sans activité depuis X jours
SELECT 
  c.id as contact_id,
  c.name as contact_name,
  MAX(ca.created_at) as last_activity_date,
  EXTRACT(DAY FROM NOW() - MAX(ca.created_at))::INTEGER as days_since_activity
FROM contacts c
LEFT JOIN contact_activities ca ON ca.contact_id = c.id
WHERE c.user_id = auth.uid()
GROUP BY c.id, c.name
HAVING MAX(ca.created_at) < NOW() - (days_threshold || ' days')::INTERVAL
ORDER BY last_activity_date ASC;
```

Par défaut : **7 jours** = 1 semaine

### 3. **Cron Job Hebdomadaire**

**Route** : `/api/cron/weekly-reminders`
**Fréquence** : Chaque **lundi à 9h** (configurable dans `vercel.json`)

```json
{
  "crons": [{
    "path": "/api/cron/weekly-reminders",
    "schedule": "0 9 * * 1"
  }]
}
```

**Format Cron** :
- `0` = Minute (9h00)
- `9` = Heure (9h)
- `*` = Jour du mois (tous)
- `*` = Mois (tous)
- `1` = Jour de la semaine (lundi)

### 4. **Envoi des Notifications**

Le cron job :
1. Récupère tous les utilisateurs ayant des contacts
2. Pour chaque utilisateur :
   - Appelle `get_forgotten_contacts(7)` 
   - Si contacts oubliés trouvés → Récupère push subscriptions
   - Envoie notification via Edge Function Supabase

Format de notification :
```json
{
  "title": "📇 Rappel de contacts",
  "body": "N'oubliez pas de recontacter : John Designer, Marie Graphiste",
  "icon": "/assets/logos/logo-icon.svg",
  "data": {
    "url": "/dashboard/contacts",
    "type": "weekly_reminder",
    "contactCount": 2
  }
}
```

---

## 🚀 Installation & Configuration

### Étape 1 : Variables d'Environnement

Ajoutez dans `.env.local` :

```env
# Cron Job Secret (générez un secret aléatoire)
CRON_SECRET=votre-secret-aleatoire-ici

# Supabase Service Role Key (depuis Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

### Étape 2 : Déployer sur Vercel

```bash
# Pousser sur Git
git add .
git commit -m "feat: Add weekly reminders cron job"
git push

# Vercel déploie automatiquement
# Le cron job sera actif après déploiement
```

### Étape 3 : Configurer les Secrets Vercel

Dans **Vercel Dashboard** :
1. Projet → **Settings** → **Environment Variables**
2. Ajouter :
   - `CRON_SECRET` = (même valeur que dans .env.local)
   - `SUPABASE_SERVICE_ROLE_KEY` = (depuis Supabase)

### Étape 4 : Tester Localement

```bash
# Tester l'endpoint manuellement
curl -X GET http://localhost:3000/api/cron/weekly-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 📊 Monitoring

### Logs Vercel

Après déploiement, vérifiez les logs :
1. **Vercel Dashboard** → Votre projet → **Deployments**
2. Cliquez sur **Functions**
3. Cherchez `/api/cron/weekly-reminders`
4. Consultez les logs chaque lundi après 9h

Format des logs :
```
[Cron] Starting weekly reminders check...
[Cron] Checking 15 users for forgotten contacts
[Cron] Found 3 forgotten contacts for user abc-123
[Cron] ✅ Notification sent to user abc-123
[Cron] ✅ Weekly reminders completed. Sent 5 notifications
```

### Response JSON

```json
{
  "success": true,
  "timestamp": "2025-12-27T09:00:00.000Z",
  "usersChecked": 15,
  "notificationsSent": 5,
  "results": [
    {
      "userId": "abc-123",
      "contactsCount": 3,
      "status": "sent"
    }
  ]
}
```

---

## 🎨 Personnalisation

### Modifier la Fréquence

Éditez `vercel.json` :

```json
{
  "crons": [{
    "path": "/api/cron/weekly-reminders",
    "schedule": "0 9 * * 3"  // Mercredi au lieu de lundi
  }]
}
```

Exemples de schedules :
- `0 9 * * 1` = Lundi 9h
- `0 9 * * 1,3,5` = Lundi, Mercredi, Vendredi 9h
- `0 */6 * * *` = Toutes les 6 heures
- `0 9 1 * *` = 1er de chaque mois à 9h

### Modifier le Seuil de Jours

Dans `app/api/cron/weekly-reminders/route.ts` ligne 46 :

```typescript
const { data: forgottenContacts } = await supabase
  .rpc('get_forgotten_contacts', { days_threshold: 14 }) // 14 jours au lieu de 7
```

### Personnaliser le Message

Dans `app/api/cron/weekly-reminders/route.ts` lignes 66-75 :

```typescript
const notification = {
  title: '🎯 Reprenez contact !',  // Personnaliser le titre
  body: `Vos contacts vous attendent : ${contactNames}${moreCount}`,
  // ...
}
```

---

## 💰 Coûts

| Service | Plan | Coût |
|---------|------|------|
| **Vercel Cron** | Hobby (Free) | **0€** (1 cron job inclus) |
| **Vercel Cron** | Pro | 20€/mois (crons illimités) |
| **Supabase Edge Functions** | Free | 0€ (500K invocations/mois) |
| **Web Push API** | Natif navigateur | **0€** |

**Total pour < 10K utilisateurs : 0€/mois** 🎉

---

## 🔒 Sécurité

### Protection du Endpoint

L'endpoint `/api/cron/weekly-reminders` est protégé par :

```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

Seul Vercel Cron peut appeler cet endpoint avec le secret.

### Row-Level Security

Toutes les requêtes utilisent le **Service Role Key** qui bypass RLS, mais :
- Chaque utilisateur ne voit QUE ses contacts
- La fonction SQL `get_forgotten_contacts` filtre par `auth.uid()`

---

## 🧪 Tests

### Test Manuel

```bash
# En local
curl -X GET http://localhost:3000/api/cron/weekly-reminders \
  -H "Authorization: Bearer dev-secret-change-in-production"
```

### Test en Production

Dans **Vercel Dashboard** :
1. **Deployments** → Votre déploiement
2. **Functions** → `/api/cron/weekly-reminders`
3. Cliquez **"Invoke Function"**

---

## 📈 Roadmap Future

- [ ] Dashboard analytics (nombre de rappels envoyés)
- [ ] Personnalisation par utilisateur (fréquence, message)
- [ ] A/B testing des messages
- [ ] Rappels intelligents (ML pour détecter le meilleur moment)
- [ ] Intégration SMS pour ceux sans push

---

## ❓ FAQ

### Q : Les notifications fonctionnent en local ?
**R** : Non, les notifications push nécessitent HTTPS. Testez en production sur Vercel.

### Q : Comment désactiver les rappels ?
**R** : L'utilisateur peut se désabonner des push dans `/dashboard/settings`.

### Q : Limite de notifications par utilisateur ?
**R** : 1 notification par semaine maximum (cron configuré pour lundi).

### Q : Que se passe-t-il si l'utilisateur n'a pas activé les push ?
**R** : Aucune notification n'est envoyée. Le système vérifie `push_subscriptions`.

---

**Système prêt à déployer ! 🚀**
