# 🚀 Guide d'Installation Drizzle ORM + Supabase

## 📋 Vue d'ensemble

Ce guide configure Drizzle ORM pour synchroniser votre code avec votre base de données Supabase existante.

---

## ✅ Fichiers Créés

```
drizzle/
├── schema.ts                 ✅ Schéma complet (18 tables)
└── migrations/              📁 Généré automatiquement

drizzle.config.ts            ✅ Configuration Drizzle
lib/db.ts                    ✅ Connexion DB
DRIZZLE_SETUP_GUIDE.md       ✅ Ce guide
```

---

## 🔧 Étape 1: Installation des Dépendances

Exécutez cette commande dans PowerShell:

```powershell
npm install drizzle-orm pg
npm install --save-dev drizzle-kit @types/pg
```

**Paquets installés:**
- `drizzle-orm` - ORM principal
- `pg` - Driver PostgreSQL Node.js
- `drizzle-kit` - CLI pour migrations
- `@types/pg` - Types TypeScript pour pg

---

## 🔑 Étape 2: Configuration .env.local

Ajoutez votre **DATABASE_URL** dans `.env.local`:

### Option A: Récupérer depuis Supabase Studio

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. **Settings** → **Database**
4. **Connection string** → **URI**
5. Copiez l'URL complète

### Option B: Format Manuel

```env
# .env.local
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

Remplacez:
- `[PASSWORD]`: Votre mot de passe PostgreSQL
- `[PROJECT-ID]`: Votre ID de projet Supabase

### Variables Existantes à Garder

Gardez aussi vos variables Supabase existantes:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Nouvelle variable Drizzle
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

---

## 🗄️ Étape 3: Introspection de la Base Existante

Drizzle peut générer le schéma automatiquement depuis votre base Supabase:

```powershell
npx drizzle-kit introspect
```

**Attention**: J'ai déjà créé `drizzle/schema.ts` manuellement avec toutes vos tables.  
Cette commande est optionnelle si vous voulez regénérer depuis zéro.

---

## 📊 Tables Incluses dans le Schéma

### ✅ Tables Principales
- `users` - Utilisateurs
- `profiles` - Profils utilisateurs
- `links` - Liens profil
- `cards` - Cartes NFC
- `card_designs` - Design des cartes
- `orders` - Commandes
- `payment_methods` - Méthodes de paiement
- `analytics_events` - Événements analytics
- `dashboard_widgets` - Widgets dashboard

### ✅ QR Code Dynamique
- `qr_redirects` - Redirections QR
- `qr_scans` - Scans QR

### ✅ Templates Dynamiques
- `template_schemas` - Schémas de templates
- `profile_template_data` - Données template par profil

### ✅ NFC Profiles
- `nfc_profiles` - Profils NFC
- `nfc_cards` - Cartes NFC associées

**Total**: 15+ tables avec relations complètes

---

## 🔄 Étape 4: Générer les Migrations (Optionnel)

Si vous voulez générer des migrations depuis le schéma:

```powershell
npx drizzle-kit generate
```

Cela crée des fichiers dans `drizzle/migrations/`.

---

## 🚀 Étape 5: Pousser vers Supabase (Push Schema)

**ATTENTION**: Cette commande modifie votre base de données !

```powershell
npx drizzle-kit push
```

Cette commande:
1. Compare votre schéma Drizzle avec la base Supabase
2. Détecte les différences
3. Applique les changements automatiquement

**Recommandation**: Faites d'abord un backup de votre base !

### Alternative Sécurisée (Dry Run)

Pour voir les changements sans les appliquer:

```powershell
npx drizzle-kit push --dry-run
```

---

## 🧪 Étape 6: Tester la Connexion

Créez un fichier de test `test-db-connection.ts`:

```typescript
import { testConnection } from './lib/db';

async function main() {
  console.log('🔍 Testing database connection...');
  const success = await testConnection();
  
  if (success) {
    console.log('✅ All good! Drizzle is connected to Supabase.');
  } else {
    console.log('❌ Connection failed. Check your DATABASE_URL.');
  }
  
  process.exit(success ? 0 : 1);
}

main();
```

Testez avec:

```powershell
npx tsx test-db-connection.ts
```

---

## 📝 Étape 7: Utiliser Drizzle dans votre Code

### Exemple 1: Récupérer tous les profils

```typescript
import { db } from '@/lib/db';
import { profiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// SELECT * FROM profiles WHERE user_id = '...'
export async function getUserProfiles(userId: string) {
  return await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));
}
```

### Exemple 2: Créer un nouveau profil

```typescript
import { db } from '@/lib/db';
import { profiles } from '@/drizzle/schema';

export async function createProfile(data: NewProfile) {
  const [newProfile] = await db
    .insert(profiles)
    .values(data)
    .returning();
  
  return newProfile;
}
```

### Exemple 3: Mettre à jour un profil

```typescript
import { db } from '@/lib/db';
import { profiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function updateProfile(id: string, data: Partial<Profile>) {
  const [updated] = await db
    .update(profiles)
    .set(data)
    .where(eq(profiles.id, id))
    .returning();
  
  return updated;
}
```

### Exemple 4: Requêtes avec Relations

```typescript
import { db } from '@/lib/db';
import { profiles, links } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// Récupérer un profil avec ses liens
export async function getProfileWithLinks(profileId: string) {
  return await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
    with: {
      links: true, // Inclut automatiquement les liens
    },
  });
}
```

---

## 🔄 Étape 8: Migrer du Code Existant

### Avant (Supabase Client)

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId);
```

### Après (Drizzle ORM)

```typescript
import { db } from '@/lib/db';
import { profiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

const data = await db
  .select()
  .from(profiles)
  .where(eq(profiles.userId, userId));
```

---

## 🎯 Commandes Utiles

### Drizzle Kit CLI

```powershell
# Générer les migrations depuis le schéma
npx drizzle-kit generate

# Pousser le schéma vers la base (sans migrations)
npx drizzle-kit push

# Introspection (générer schema depuis DB)
npx drizzle-kit introspect

# Studio visuel (interface graphique)
npx drizzle-kit studio

# Voir les différences (dry-run)
npx drizzle-kit push --dry-run
```

### npm scripts (Ajoutez dans package.json)

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:introspect": "drizzle-kit introspect",
    "db:test": "tsx test-db-connection.ts"
  }
}
```

Ensuite:

```powershell
npm run db:push
npm run db:studio
npm run db:test
```

---

## 🔍 Drizzle Studio (Interface Graphique)

Drizzle propose une interface web pour explorer votre base:

```powershell
npx drizzle-kit studio
```

Ouvre un navigateur sur `https://local.drizzle.studio`

**Fonctionnalités**:
- ✅ Voir toutes les tables
- ✅ Naviguer dans les relations
- ✅ Modifier les données
- ✅ Exécuter des requêtes

---

## ⚠️ Précautions

### 1. Backup Avant Push

Toujours faire un backup avant `drizzle-kit push`:

```sql
-- Dans Supabase Studio > SQL Editor
-- Export complet
pg_dump -U postgres > backup.sql
```

### 2. Environnement de Développement

Testez d'abord sur un projet Supabase de dev/staging !

### 3. RLS Policies

Drizzle gère les tables mais **pas les RLS policies**.  
Vos policies Supabase existantes restent actives.

### 4. Migrations vs Push

- `generate` + `migrate`: Pour production (contrôlé)
- `push`: Pour développement (rapide mais dangereux)

---

## 🐛 Troubleshooting

### Erreur: "DATABASE_URL is not defined"

Solution:
```powershell
# Vérifier .env.local
cat .env.local | Select-String "DATABASE_URL"

# Redémarrer le serveur Next.js
npm run dev
```

### Erreur: "Connection refused"

Solutions:
1. Vérifier que l'IP est autorisée dans Supabase (Settings > Database > Connection pooling)
2. Essayer `?sslmode=require` à la fin de DATABASE_URL
3. Vérifier que le mot de passe est correct

### Erreur: "relation does not exist"

Solution: Pousser le schéma
```powershell
npx drizzle-kit push
```

### Erreur TypeScript après installation

Solution:
```powershell
# Redémarrer TypeScript
# Dans VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Ou reconstruire
npm run build
```

---

## 📚 Ressources

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle + Supabase Guide](https://orm.drizzle.team/docs/get-started-postgresql#supabase)
- [Drizzle Queries](https://orm.drizzle.team/docs/rqb)
- [PostgreSQL Types](https://orm.drizzle.team/docs/column-types/pg)

---

## ✅ Checklist Finale

Après installation:

- [ ] Dépendances installées (`drizzle-orm`, `pg`, `drizzle-kit`)
- [ ] `DATABASE_URL` configuré dans `.env.local`
- [ ] Connexion testée avec `npx tsx test-db-connection.ts`
- [ ] Schéma synchronisé avec `npx drizzle-kit push` (ou dry-run d'abord)
- [ ] Code migré (remplacer Supabase client par Drizzle)
- [ ] Tests passent
- [ ] Drizzle Studio exploré (`npx drizzle-kit studio`)

---

## 🎉 Résumé

**Vous avez maintenant:**
✅ Drizzle ORM configuré  
✅ Schéma TypeScript complet (15+ tables)  
✅ Connexion directe à Supabase PostgreSQL  
✅ Relations définies entre tables  
✅ Types auto-générés pour l'auto-complétion  
✅ Alternative performante au Supabase Client

**Avantages:**
- 🚀 Requêtes SQL optimisées
- 🔒 Type-safe à 100%
- 🔗 Relations automatiques
- 📊 Migrations versionnées
- 🎨 Studio visuel inclus

**Prochaines étapes:**
1. Migrer progressivement vos fichiers services vers Drizzle
2. Comparer les performances Supabase Client vs Drizzle
3. Utiliser Drizzle Studio pour l'exploration

---

**Date**: 2025-01-05  
**Auteur**: Cascade AI  
**Version Drizzle**: 0.30+  
**Compatible**: Next.js 14, TypeScript 5, Supabase PostgreSQL
