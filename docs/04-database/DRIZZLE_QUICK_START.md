# ⚡ Migration Drizzle - Guide Rapide

## 🎯 Ce qui a été fait

✅ Schéma Drizzle modifié (`drizzle/schema.ts`)
- Suppression des colonnes : `whatsapp`, `facebook`, `instagram`, `twitter`, `youtube`, `tiktok`, `linkedin`, `website`
- Ajout de : `socialLinks` (format JSON)

✅ Scripts SQL créés :
1. `MIGRATE_DATA_BEFORE_DRIZZLE.sql` - Migrer les données AVANT Drizzle
2. `RLS_POLICIES_ONLY.sql` - Activer RLS APRÈS Drizzle
3. `EXECUTE_THIS_IN_SUPABASE.sql` - Solution tout-en-un (sans Drizzle)

---

## 🚀 3 étapes pour migrer

### Étape 1️⃣ : Migrer les données existantes
**Dans Supabase SQL Editor :**
1. Ouvrez `MIGRATE_DATA_BEFORE_DRIZZLE.sql`
2. Copiez-collez dans SQL Editor
3. Cliquez sur "Run"

### Étape 2️⃣ : Pousser avec Drizzle
**Dans votre terminal :**
```bash
npm run db:push
```

Confirmez avec `y` quand demandé.

### Étape 3️⃣ : Activer RLS
**Dans Supabase SQL Editor :**
1. Ouvrez `RLS_POLICIES_ONLY.sql`
2. Copiez-collez dans SQL Editor
3. Cliquez sur "Run"

---

## ✅ C'est tout !

Votre profil public devrait maintenant fonctionner :
👉 `https://votre-domaine.com/[username]`

---

## 🔧 Commandes utiles

```bash
# Voir les changements avant de pousser
npm run db:generate

# Pousser vers Supabase
npm run db:push

# Explorer la base de données
npm run db:studio
```

---

## 📖 Documentation complète

Pour plus de détails, consultez :
- `INSTRUCTIONS_DRIZZLE.md` - Guide complet avec troubleshooting

---

**Besoin d'aide ?** Demandez-moi ! 🤝
