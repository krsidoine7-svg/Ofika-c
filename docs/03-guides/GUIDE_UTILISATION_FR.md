# 📚 GUIDE D'UTILISATION - BASE DE DONNÉES OFIKA

**Pour** : Développeurs francophones  
**Date** : 05/01/2025  
**Niveau** : Débutant à Intermédiaire

---

## 🎯 QU'EST-CE QUE J'AI FAIT ?

J'ai analysé complètement votre base de données OFIKA et créé une documentation détaillée en français.

### 📁 Documents créés

1. **DATABASE_RESUME_FR.md** - Résumé exécutif (LISEZ EN PREMIER)
2. **DATABASE_CORRECTIONS_RAPIDES_FR.sql** - Corrections SQL à appliquer
3. **GUIDE_UTILISATION_FR.md** - Ce guide (comment utiliser la doc)

---

## 🚨 PROBLÈME PRINCIPAL TROUVÉ

### Vous ne pouvez PAS utiliser `drizzle-kit push` !

**Pourquoi ?**
- Votre base SQL utilise le type `UUID`
- Votre schéma Drizzle utilise le type `TEXT`
- Si vous faites `npm run db:push`, **vous allez perdre des données** !

### ✅ Solution : Approche hybride

```typescript
// ✅ UTILISEZ Drizzle pour les REQUÊTES (c'est bon !)
import { db } from '@/lib/db';
import { profiles } from '@/drizzle/schema';

const mesProfils = await db.select().from(profiles);
```

```sql
-- ✅ UTILISEZ Supabase pour les CHANGEMENTS DE SCHÉMA
-- Créez un fichier dans supabase/migrations/
ALTER TABLE profiles ADD COLUMN nouveau_champ TEXT;
```

```bash
# ❌ NE FAITES JAMAIS ÇA
npm run db:push  # VA CASSER VOTRE BASE !
```

---

## 📊 VOTRE BASE DE DONNÉES EN CHIFFRES

```
✅ 15 tables au total
✅ 185 colonnes environ
✅ 23 relations (clés étrangères)
✅ 47 index pour la performance
✅ 32 politiques de sécurité (RLS)
✅ 12 fonctions utilitaires
✅ 11 triggers automatiques
```

---

## 🗂️ LES 15 TABLES EXPLIQUÉES SIMPLEMENT

### 📦 Système Central (3 tables)

#### 1. **users** - Les comptes utilisateurs
```
Contient : email, nom, image, abonnement (free/pro/enterprise)
Un utilisateur peut avoir plusieurs profils
```

#### 2. **profiles** - Les profils (plusieurs par utilisateur)
```
Contient : nom, bio, image, liens réseaux sociaux
Types : professionnel, personnel, événement
Peut être public ou privé
```

#### 3. **links** - Les liens des profils
```
Contient : titre, URL, icône, ordre d'affichage
Chaque profil peut avoir plusieurs liens
Suivi du nombre de clics
```

### 🎴 Cartes de Visite (2 tables)

#### 4. **cards** - Les cartes NFC/QR
```
Contient : ID NFC, code QR, lié à un profil
Chaque carte appartient à un utilisateur
```

#### 5. **card_designs** - Le design des cartes
```
Contient : design recto/verso (couleurs, logos, textes)
Stocké en JSON pour flexibilité
```

### 💰 E-Commerce (2 tables)

#### 6. **orders** - Les commandes
```
Contient : numéro commande, prix, adresse livraison
Maximum 2 cartes par commande
Suivi du statut de paiement et livraison
```

#### 7. **payment_methods** - Moyens de paiement
```
Contient : type (carte, mobile money), fournisseur
Moyens de paiement enregistrés par l'utilisateur
```

### 📈 Analytiques (2 tables)

#### 8. **analytics_events** - Suivi des événements
```
Contient : type événement (vue, clic), appareil, localisation
Pour suivre qui regarde vos profils
```

#### 9. **dashboard_widgets** - Configuration du tableau de bord
```
Contient : type widget, position (grille)
Personnalisation du dashboard utilisateur
```

### 📱 QR Codes Dynamiques (2 tables)

#### 10. **qr_redirects** - Redirections QR
```
Contient : code court, URL cible, nombre de scans
Vous pouvez changer l'URL sans changer le QR code !
```

#### 11. **qr_scans** - Scans QR détaillés
```
Contient : appareil, pays, ville, heure du scan
Analytiques détaillées de chaque scan
```

### 🎨 Templates (2 tables)

#### 12. **template_schemas** - Définitions templates
```
Contient : 8 templates préfaits (design1-7, influencer, ecommerce, freelance)
Champs personnalisables en JSON
```

#### 13. **profile_template_data** - Valeurs template profil
```
Contient : les valeurs remplies pour chaque profil
Lié 1:1 avec un profil
```

### 💳 Système NFC (2 tables)

#### 14. **nfc_profiles** - Profils NFC
```
Contient : nom, liens, design, réseaux sociaux
Configuration spécifique NFC
```

#### 15. **nfc_cards** - Inventaire cartes NFC
```
Contient : identifiant carte, statut production/livraison
Suivi des cartes physiques
```

---

## 🔧 CORRECTIONS À APPLIQUER

### 📝 Étape 1 : Supprimer colonne redondante

La table `links` a 2 colonnes qui font la même chose :
- `order_index` ✅ (garder)
- `position` ❌ (supprimer)

**Comment faire ?**
```sql
ALTER TABLE links DROP COLUMN position;
```

### 📝 Étape 2 : Ajouter index manquants

Pour améliorer les performances :

```sql
-- Index pour chercher par template de design
CREATE INDEX idx_profiles_design_choice ON profiles(design_choice);

-- Index pour filtrer par statut de paiement
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Index pour filtrer par type de carte NFC
CREATE INDEX idx_nfc_cards_card_type ON nfc_cards(card_type);
```

### 📝 Étape 3 : Valider les données JSON

Ajouter des vérifications pour que les données JSON soient correctes :

```sql
-- Fonction qui vérifie que custom_links est bien formaté
CREATE FUNCTION validate_custom_links(links JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Doit être un tableau avec title et url
  RETURN jsonb_typeof(links) = 'array';
END;
$$ LANGUAGE plpgsql;

-- L'appliquer à la table
ALTER TABLE profiles 
ADD CONSTRAINT valid_custom_links_structure 
CHECK (validate_custom_links(custom_links));
```

---

## ✅ COMMENT APPLIQUER LES CORRECTIONS

### Option 1 : Via Supabase Dashboard (RECOMMANDÉ)

1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet OFIKA
3. Allez dans **SQL Editor** (à gauche)
4. Ouvrez le fichier `docs/DATABASE_CORRECTIONS_RAPIDES_FR.sql`
5. Copiez tout le contenu
6. Collez dans l'éditeur SQL
7. Cliquez sur **Run** (Exécuter)
8. Vérifiez qu'il n'y a pas d'erreurs

### Option 2 : Via ligne de commande

```bash
# Si vous avez psql installé
psql -U postgres -d votre_base -f docs/DATABASE_CORRECTIONS_RAPIDES_FR.sql
```

---

## 💡 COMMENT UTILISER DRIZZLE CORRECTEMENT

### ✅ Requêtes simples

```typescript
import { db } from '@/lib/db';
import { profiles, links } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// Récupérer tous les profils d'un utilisateur
const mesProfils = await db.select()
  .from(profiles)
  .where(eq(profiles.userId, userId));

// Récupérer un profil avec ses liens
const profil = await db.query.profiles.findFirst({
  where: eq(profiles.id, profileId),
  with: { links: true }
});

// Insérer un nouveau lien
const [nouveauLien] = await db.insert(links)
  .values({
    profileId: profil.id,
    title: 'Mon site web',
    url: 'https://monsite.com',
    orderIndex: 0
  })
  .returning();

// Mettre à jour un profil
await db.update(profiles)
  .set({ bio: 'Nouvelle bio' })
  .where(eq(profiles.id, profileId));

// Supprimer un lien
await db.delete(links)
  .where(eq(links.id, linkId));
```

### ✅ Requêtes avec relations

```typescript
// Profil avec tous ses liens
const profilComplet = await db.query.profiles.findFirst({
  where: eq(profiles.id, profileId),
  with: {
    links: true,
    cards: true,
    analyticsEvents: {
      limit: 10,
      orderBy: (events, { desc }) => [desc(events.createdAt)]
    },
    templateData: {
      with: { template: true }
    }
  }
});

// Tous les profils d'un utilisateur avec leurs statistiques
const profilsAvecStats = await db.query.profiles.findMany({
  where: eq(profiles.userId, userId),
  with: {
    links: {
      where: eq(links.isActive, true)
    },
    analyticsEvents: true
  }
});
```

### ✅ Transactions

```typescript
import { db } from '@/lib/db';

// Tout ou rien
await db.transaction(async (tx) => {
  // Créer le profil
  const [profil] = await tx.insert(profiles)
    .values({ userId, name: 'Mon Profil' })
    .returning();
  
  // Créer les liens
  await tx.insert(links)
    .values([
      { profileId: profil.id, title: 'Facebook', url: 'https://...' },
      { profileId: profil.id, title: 'Instagram', url: 'https://...' }
    ]);
  
  // Si erreur ici, tout est annulé automatiquement
});
```

---

## ❌ ERREURS À NE PAS FAIRE

### 1. ❌ Utiliser drizzle-kit push

```bash
# NE FAITES JAMAIS ÇA !
npm run db:push
# Va essayer de changer UUID en TEXT et casser la base
```

### 2. ❌ Oublier les relations CASCADE

```typescript
// Si vous supprimez un profil
await db.delete(profiles).where(eq(profiles.id, profileId));

// Tous les liens, cards, analytics du profil sont automatiquement supprimés
// Grâce aux relations CASCADE dans la base
```

### 3. ❌ Modifier le schéma Drizzle manuellement

```typescript
// ❌ Mauvais : modifier drizzle/schema.ts
export const profiles = pgTable('profiles', {
  nouveauChamp: text('nouveau_champ')  // Ne pas faire ça !
});

// ✅ Bon : créer migration Supabase d'abord
-- supabase/migrations/xxx.sql
ALTER TABLE profiles ADD COLUMN nouveau_champ TEXT;

// Puis mettre à jour le schéma Drizzle pour refléter le changement
```

---

## 🎓 EXEMPLES PRATIQUES

### Exemple 1 : Créer un profil complet

```typescript
async function creerProfilComplet(userId: string, data: any) {
  return await db.transaction(async (tx) => {
    // 1. Créer le profil
    const [profil] = await tx.insert(profiles).values({
      userId,
      name: data.name,
      bio: data.bio,
      profileType: 'professional',
      isPublic: true
    }).returning();
    
    // 2. Ajouter les liens
    if (data.liens?.length > 0) {
      await tx.insert(links).values(
        data.liens.map((lien: any, index: number) => ({
          profileId: profil.id,
          title: lien.title,
          url: lien.url,
          orderIndex: index
        }))
      );
    }
    
    // 3. Associer un template
    if (data.templateId) {
      await tx.insert(profileTemplateData).values({
        profileId: profil.id,
        templateId: data.templateId,
        fields: data.templateFields || {}
      });
    }
    
    return profil;
  });
}
```

### Exemple 2 : Obtenir statistiques profil

```typescript
async function getStatistiquesProfil(profileId: string) {
  const profil = await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
    with: {
      links: true,
      analyticsEvents: true
    }
  });
  
  if (!profil) return null;
  
  return {
    nom: profil.name,
    totalVues: profil.analyticsEvents.length,
    totalLiens: profil.links.length,
    totalClics: profil.links.reduce((sum, link) => sum + (link.clickCount || 0), 0),
    tauxClic: profil.analyticsEvents.length > 0 
      ? (profil.links.reduce((sum, link) => sum + (link.clickCount || 0), 0) / profil.analyticsEvents.length * 100).toFixed(2)
      : 0
  };
}
```

### Exemple 3 : Créer QR code dynamique

```typescript
async function creerQRCodeDynamique(userId: string, targetUrl: string, titre: string) {
  // Générer code court unique
  const shortCode = generateShortCode(); // Fonction à implémenter
  
  const [qrRedirect] = await db.insert(qrRedirects).values({
    userId,
    shortCode,
    targetUrl,
    redirectType: 'custom',
    title: titre,
    isActive: true
  }).returning();
  
  // URL du QR : https://votresite.com/q/abc123
  const qrUrl = `https://votresite.com/q/${shortCode}`;
  
  return { qrRedirect, qrUrl };
}

// Pour changer la destination plus tard (sans changer le QR !)
async function changerDestinationQR(qrId: string, nouvelleUrl: string) {
  await db.update(qrRedirects)
    .set({ targetUrl: nouvelleUrl })
    .where(eq(qrRedirects.id, qrId));
}
```

---

## 🆘 AIDE SUPPLÉMENTAIRE

### Où trouver plus d'infos ?

1. **DATABASE_RESUME_FR.md** - Vue d'ensemble complète
2. **DATABASE_CORRECTIONS_RAPIDES_FR.sql** - Corrections SQL à appliquer
3. Documentation Drizzle : https://orm.drizzle.team/docs/overview
4. Documentation Supabase : https://supabase.com/docs

### Questions fréquentes

**Q : Je peux ajouter une colonne à une table ?**  
R : Oui, mais créez une migration Supabase, pas avec Drizzle.

**Q : Comment je sais quelles tables sont liées ?**  
R : Regardez le diagramme dans DATABASE_RESUME_FR.md

**Q : Drizzle ne voit pas mes nouvelles colonnes ?**  
R : Mettez à jour `drizzle/schema.ts` manuellement après migration SQL

**Q : Je peux supprimer des données avec Drizzle ?**  
R : Oui, mais attention aux relations CASCADE !

---

## 📞 RÉSUMÉ FINAL

### ✅ À FAIRE
- Utiliser Drizzle pour TOUTES vos requêtes
- Utiliser migrations Supabase pour changements de schéma
- Appliquer les corrections du fichier SQL
- Lire DATABASE_RESUME_FR.md pour comprendre la structure

### ❌ À NE PAS FAIRE
- `npm run db:push` (jamais !)
- Modifier schéma directement en production
- Oublier les validations sur données JSONB

### 🎯 Prochaines étapes
1. Lire DATABASE_RESUME_FR.md
2. Appliquer DATABASE_CORRECTIONS_RAPIDES_FR.sql
3. Tester vos requêtes Drizzle
4. Profiter d'un ORM type-safe ! 🎉

---

**Guide créé par** : Cascade AI  
**Date** : 05/01/2025  
**Pour** : Projet OFIKA  
**Version** : 1.0 FR
