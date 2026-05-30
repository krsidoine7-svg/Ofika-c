# 🚀 Quick Start - 5 Fonctionnalités Ofika

**Temps requis : 20 minutes**

---

## 📋 Checklist Rapide

- [ ] Étape 1 : Installer dépendances (2 min)
- [ ] Étape 2 : Générer clés VAPID (1 min)
- [ ] Étape 3 : Appliquer migration SQL (3 min)
- [ ] Étape 4 : Créer Service Worker (2 min)
- [ ] Étape 5 : Tester (5 min)
- [ ] Étape 6 : Déployer (7 min)

---

## 🔧 Étape 1 : Installation (2 min)

```bash
cd s:\nextjs-base-project

# Installer les dépendances
npm install emoji-picker-react web-push

# Vérifier l'installation
npm list emoji-picker-react web-push
```

✅ **Résultat attendu :** Les 2 packages apparaissent dans `node_modules`

---

## 🔑 Étape 2 : Générer Clés VAPID (1 min)

```bash
npx web-push generate-vapid-keys
```

**Output exemple :**
```
Public Key: BEl62iUYgUivxIk...
Private Key: 5J2F8mK9nL3pQ...
```

**Ajouter dans `.env.local` :**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIk... (coller la clé publique)
VAPID_PRIVATE_KEY=5J2F8mK9nL3pQ... (coller la clé privée)
```

✅ **Vérifier :** `cat .env.local | grep VAPID`

---

## 💾 Étape 3 : Migration SQL Supabase (3 min)

### Option A : Via Supabase Studio (recommandé)

1. Ouvrir [Supabase Studio](https://supabase.com/dashboard)
2. Aller dans **SQL Editor** → **New query**
3. Copier le contenu de `database/migrations/001_features_setup.sql`
4. Cliquer **Run**

### Option B : Via CLI

```bash
npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

✅ **Vérifier les tables créées :**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('push_subscriptions', 'contact_activities', 'user_consents');
```

**Résultat attendu :** 3 lignes

---

## 📄 Étape 4 : Service Worker (2 min)

**Copier manuellement le template :**

```bash
# Créer le fichier
New-Item -Path "public\sw.js" -ItemType File -Force

# Ouvrir le fichier
code public\sw.js
```

**Copier le contenu de :**
`docs/templates/sw-template.js` → `public/sw.js`

✅ **Vérifier :** Le fichier `public/sw.js` existe (196 lignes)

---

## 🧪 Étape 5 : Tester en Local (5 min)

```bash
npm run dev
```

### Test 1 : RGPD Modal
1. Ouvrir [http://localhost:3000/example-integration](http://localhost:3000/example-integration)
2. Vérifier que le modal RGPD s'affiche
3. Cocher "Stockage des données"
4. Cliquer "Confirmer"

✅ **Résultat :** Modal se ferme, formulaire accessible

### Test 2 : Emojis
1. Remplir le formulaire contact
2. Cliquer "Ajouter émotions"
3. Sélectionner 3 emojis
4. Enregistrer

✅ **Résultat :** Contact créé avec emojis affichés

### Test 3 : Notifications (Chrome/Edge requis)
1. Cliquer "Activer les rappels hebdo"
2. Autoriser les notifications dans le navigateur
3. Ouvrir DevTools → Application → Service Workers
4. Vérifier que `sw.js` est enregistré

✅ **Résultat :** "Notifications activées" toast

### Test 4 : Validation XSS
1. Entrer `<script>alert('XSS')</script>` dans le nom
2. Cliquer Enregistrer

✅ **Résultat :** Erreur "caractères invalides"

---

## 🚀 Étape 6 : Déployer (7 min)

### 6.1 Edge Function (3 min)

```bash
# Login Supabase
npx supabase login

# Déployer la fonction
npx supabase functions deploy send-push-notifications

# Définir les secrets
npx supabase secrets set VAPID_PRIVATE_KEY="votre-clé-privée"
npx supabase secrets set VAPID_PUBLIC_KEY="votre-clé-publique"
```

✅ **Vérifier :** Fonction listée dans Supabase Dashboard → Edge Functions

### 6.2 Vercel Deploy (4 min)

```bash
# Build
npm run build

# Deploy
vercel --prod
```

✅ **Résultat :** URL de production (ex: ofika.vercel.app)

---

## 🎯 Validation Finale

### Checklist de Validation

- [ ] ✅ Tables SQL créées (3/3)
- [ ] ✅ Service Worker enregistré
- [ ] ✅ Modal RGPD fonctionnel
- [ ] ✅ Emojis stockés en DB
- [ ] ✅ Notifications autorisées
- [ ] ✅ Validation XSS active
- [ ] ✅ Edge function déployée
- [ ] ✅ Site en production

---

## 📊 Dashboard de Monitoring

### Vérifier les données

```sql
-- Nombre de consentements
SELECT consent_type, COUNT(*) FROM user_consents 
GROUP BY consent_type;

-- Dernières activités
SELECT activity_type, COUNT(*) FROM contact_activities 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY activity_type;

-- Push subscriptions actives
SELECT COUNT(*) FROM push_subscriptions;
```

---

## 🆘 Dépannage Express

### Problème : Service Worker non enregistré
```bash
# Vérifier le fichier existe
ls public/sw.js

# Vider le cache navigateur
Ctrl + Shift + Delete → Tout effacer
```

### Problème : Erreur RLS
```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'contacts';

-- Tester l'authentification
SELECT auth.uid(); -- Doit retourner un UUID
```

### Problème : VAPID invalide
```bash
# Régénérer les clés
npx web-push generate-vapid-keys

# Mettre à jour .env.local ET Supabase secrets
```

---

## 🎉 Félicitations !

Votre projet Ofika dispose maintenant de **5 fonctionnalités avancées** :

1. ✅ **Émotions** - Emojis pour qualifier les contacts
2. ✅ **Push Web** - Notifications intelligentes
3. ✅ **Rappels** - Détection contacts oubliés
4. ✅ **RGPD** - Conformité totale
5. ✅ **Sécurité** - RLS + Validation Zod

**Coût total : 0€/mois** 🎊

---

## 📚 Prochaines Étapes Suggérées

1. **i18n** : Ajouter traductions EN avec `next-intl`
2. **Analytics** : Intégrer dashboard pour visualiser activités
3. **Export** : Ajouter export CSV des contacts
4. **Backup** : Configurer sauvegardes auto Supabase
5. **Mobile** : Optimiser UI pour iOS/Android

---

## 💬 Besoin d'Aide ?

- 📖 **Docs** : `docs/OFIKA_5_FEATURES_IMPLEMENTATION.md`
- 🧪 **Tests** : `npm test`
- 🐛 **Issues** : GitHub Issues
- 💬 **Support** : support@ofika.com

**Bonne chance avec Ofika ! 🇨🇮🚀**
