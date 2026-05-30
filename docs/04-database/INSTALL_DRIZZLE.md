# ⚡ Installation Rapide - Drizzle ORM

## 🚀 Installation Automatique (Recommandé)

### Windows PowerShell

```powershell
# Exécuter le script d'installation
powershell -ExecutionPolicy Bypass -File ./setup-drizzle.ps1
```

Ce script fait **tout automatiquement**:
- ✅ Installe les dépendances npm
- ✅ Crée le fichier de test
- ✅ Ajoute les scripts npm
- ✅ Vérifie la configuration

---

## 📦 Installation Manuelle

Si vous préférez installer manuellement:

### Étape 1: Installer les packages

```powershell
npm install drizzle-orm pg
npm install --save-dev drizzle-kit @types/pg
```

### Étape 2: Configurer .env.local

Ajoutez cette ligne à `.env.local`:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

### Étape 3: Ajouter les scripts npm

Dans `package.json`, ajoutez:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:test": "tsx test-db-connection.ts"
  }
}
```

### Étape 4: Tester

```powershell
npm run db:test
```

---

## 🔑 Récupérer DATABASE_URL depuis Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. **Settings** → **Database** → **Connection string** → **URI**
4. Copiez l'URL et remplacez `[YOUR-PASSWORD]` par votre mot de passe

Format:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

---

## 🧪 Vérifier l'Installation

```powershell
# Tester la connexion
npm run db:test

# Ouvrir Drizzle Studio
npm run db:studio

# Voir le schéma
cat drizzle/schema.ts
```

---

## 📚 Documentation Complète

Voir **DRIZZLE_SETUP_GUIDE.md** pour:
- Guide détaillé étape par étape
- Exemples de code
- Commandes avancées
- Troubleshooting
- Migration du code existant

---

## ✅ Fichiers Créés

Après installation, vous aurez:

```
votre-projet/
├── drizzle/
│   ├── schema.ts            ✅ Schéma complet (15+ tables)
│   └── migrations/          📁 (généré après db:generate)
├── lib/
│   └── db.ts                ✅ Connexion DB
├── drizzle.config.ts        ✅ Configuration Drizzle
├── test-db-connection.ts    ✅ Script de test
├── setup-drizzle.ps1        ✅ Script d'installation
├── DRIZZLE_SETUP_GUIDE.md   ✅ Guide complet
└── INSTALL_DRIZZLE.md       ✅ Ce fichier
```

---

## 🎯 Utilisation Basique

```typescript
import { db } from '@/lib/db';
import { profiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// SELECT
const allProfiles = await db.select().from(profiles);

// INSERT
const [newProfile] = await db
  .insert(profiles)
  .values({ name: 'John', userId: '...' })
  .returning();

// UPDATE
await db
  .update(profiles)
  .set({ name: 'Jane' })
  .where(eq(profiles.id, profileId));

// DELETE
await db
  .delete(profiles)
  .where(eq(profiles.id, profileId));
```

---

## 🆘 Besoin d'Aide ?

- **Guide complet**: `DRIZZLE_SETUP_GUIDE.md`
- **Docs Drizzle**: https://orm.drizzle.team/docs/overview
- **Supabase + Drizzle**: https://orm.drizzle.team/docs/get-started-postgresql#supabase

---

**Date**: 2025-01-05  
**Version**: 1.0.0  
**Auteur**: Cascade AI
