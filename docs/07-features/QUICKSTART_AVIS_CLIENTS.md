# 🔧 INSTALLATION ET DÉMARRAGE

## ✅ Composants Créés

Le composant manquant `dropdown-menu` a été ajouté :
- ✅ `components/core/ui/dropdown-menu.tsx`

## 📦 Dépendances

Toutes les dépendances sont installées :
- ✅ `@radix-ui/react-dropdown-menu`
- ✅ `@tanstack/react-query`
- ✅ `date-fns`
- ✅ `sonner`
- ✅ Tous les autres packages

## 🚀 Prochaines Étapes

### 1. Exécuter la Migration SQL

**Dans Supabase Dashboard > SQL Editor** :

```sql
-- Copier-coller le contenu du fichier :
database/reviews/00-FULL-MIGRATION.sql
```

**OU** exécuter les fichiers individuels dans l'ordre :
1. `01-create-reviews-tables.sql`
2. `02-create-rls-policies.sql`
3. `03-create-triggers.sql`
4. `04-create-storage-bucket.sql`

### 2. Vérifier la Compilation

Le serveur dev devrait compiler automatiquement. Si vous voyez encore des erreurs :

```bash
# Arrêter le serveur (Ctrl+C)
# Redémarrer
npm run dev
```

### 3. Accéder au Module

1. Ouvrir : `http://localhost:3000/dashboard`
2. Se connecter
3. Cliquer sur **"Avis Clients"** ⭐ dans la sidebar
4. Créer votre premier lien de collecte

### 4. Tester le Formulaire Public

1. Créer un lien depuis le dashboard
2. Copier l'URL publique générée
3. Ouvrir l'URL dans un nouvel onglet/fenêtre
4. Tester la soumission d'un avis

---

## 🐛 Troubleshooting

### Erreur : Module not found

Si vous voyez une erreur `Module not found` :
```bash
# Nettoyer le cache Next.js
rm -rf .next
npm run dev
```

### Erreur TypeScript

Les types sont fournis. Si vous voyez des erreurs TS :
1. Vérifier que `typescript` est à jour
2. Redémarrer VS Code
3. Exécuter : `npx tsc --noEmit`

### Erreur Supabase

Si les API routes échouent :
1. Vérifier que la migration SQL est bien exécutée
2. Vérifier les variables d'environnement `.env.local`
3. Vérifier les politiques RLS dans Supabase Dashboard

---

## 📊 Vérification Rapide

### Base de Données

Dans Supabase SQL Editor :
```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('review_links', 'reviews');

-- Vérifier RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('review_links', 'reviews');

-- Vérifier le bucket
SELECT * FROM storage.buckets WHERE name = 'review-media';
```

### Test API

```bash
# Test création de lien (avec votre cookie auth)
curl -X POST http://localhost:3000/api/reviews/create-link \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  -b "your-auth-cookie"
```

---

## ✨ Le Module est Prêt !

Tout est installé et configuré. Il ne reste plus qu'à :
1. ✅ Exécuter la migration SQL
2. ✅ Tester le dashboard
3. ✅ Profiter ! 🎉

---

**Documentation complète** : `docs/MODULE_AVIS_CLIENTS.md`
