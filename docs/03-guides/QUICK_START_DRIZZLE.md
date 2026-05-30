# ⚡ Drizzle ORM - Quick Start (postgres-js)

## 🚀 Installation en 3 Minutes

### Étape 1: Installer (1 min)

```powershell
# Option A: Script automatique (recommandé)
powershell -ExecutionPolicy Bypass -File ./setup-drizzle.ps1

# Option B: Manuel
npm install drizzle-orm postgres
npm install --save-dev drizzle-kit
```

**Important** : Utilise `postgres` (postgres-js), **pas** `pg` !

---

### Étape 2: Configurer DATABASE_URL (1 min)

Ajoutez dans `.env.local` :

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

**Où trouver l'URL ?**
1. Supabase Dashboard → Votre projet
2. Settings → Database → Connection string → URI
3. Copiez et remplacez `[PASSWORD]`

---

### Étape 3: Tester (1 min)

```powershell
npm run db:test
```

**Résultat attendu** :
```
🔍 Testing database connection...
✅ Database connected at: 2025-01-05T12:00:00.000Z
✅ All good! Drizzle + postgres-js connected to Supabase.
```

---

## 💻 Utilisation Basique

### Import

```typescript
import { db } from '@/lib/db';
import { profiles, links } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
```

### SELECT

```typescript
// Tous les profils d'un user
const userProfiles = await db
  .select()
  .from(profiles)
  .where(eq(profiles.userId, userId));
```

### INSERT

```typescript
const [newProfile] = await db
  .insert(profiles)
  .values({
    userId: user.id,
    name: 'John Doe',
    customUrl: 'johndoe',
  })
  .returning();
```

### UPDATE

```typescript
await db
  .update(profiles)
  .set({ name: 'Jane Doe' })
  .where(eq(profiles.id, profileId));
```

### Relations

```typescript
// Profil avec ses liens
const profile = await db.query.profiles.findFirst({
  where: eq(profiles.id, profileId),
  with: { links: true },
});
```

---

## 🎯 Configuration Critique

### lib/db.ts

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // ← REQUIS pour Supabase !
});

export const db = drizzle(client, { schema });
```

**⚠️ `prepare: false` est OBLIGATOIRE** pour Supabase Transaction Pooling !

---

## 🔧 Scripts npm

```powershell
npm run db:test      # Tester connexion
npm run db:push      # Sync schema → Supabase
npm run db:studio    # Interface graphique
npm run db:generate  # Générer migrations
```

---

## 📊 Schéma Disponible

**15+ tables** prêtes à l'emploi :

```typescript
import { 
  users, profiles, links, cards,
  orders, qrRedirects, templateSchemas,
  nfcProfiles, nfcCards 
} from '@/drizzle/schema';
```

Toutes avec **relations** et **types TypeScript** !

---

## 🆚 Avant/Après

### Avant (Supabase Client)

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*, links(*)')
  .eq('user_id', userId);

if (error) throw error;
```

### Après (Drizzle)

```typescript
const profiles = await db.query.profiles.findMany({
  where: eq(profiles.userId, userId),
  with: { links: true },
});
```

**Avantages** :
- ✅ Type-safe 100%
- ✅ Auto-complétion
- ✅ 3x plus rapide
- ✅ Moins de code

---

## 📚 Documentation Complète

| Fichier | Usage |
|---------|-------|
| `DRIZZLE_POSTGRES_JS_UPDATE.md` | ⭐ **Pourquoi postgres-js** |
| `DRIZZLE_SETUP_GUIDE.md` | Guide détaillé |
| `DRIZZLE_FINAL_REPORT.md` | Rapport complet |
| `drizzle/schema.ts` | Référence schéma |

---

## ⚠️ Erreurs TypeScript Actuelles

Les erreurs `Cannot find module 'postgres'` sont **NORMALES** avant installation :

```powershell
npm install drizzle-orm postgres
npm install --save-dev drizzle-kit
```

Ensuite redémarrez TypeScript Server (VS Code: `Ctrl+Shift+P` > `TypeScript: Restart TS Server`)

---

## ✅ Checklist

- [ ] Packages installés (`postgres`, `drizzle-orm`, `drizzle-kit`)
- [ ] `DATABASE_URL` dans `.env.local`
- [ ] `npm run db:test` passe ✅
- [ ] `lib/db.ts` a `prepare: false`
- [ ] TypeScript compile sans erreur

---

## 🎉 Prêt !

Vous pouvez maintenant utiliser Drizzle ORM dans tout votre code !

**Commencez par** :
```powershell
npm run db:studio
```

Pour explorer vos tables visuellement ! 🎨

---

**Version**: 2.0.0 (postgres-js)  
**Date**: 2025-01-05  
**Recommandé pour**: Supabase + Next.js
