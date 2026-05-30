# Structure du Projet Ofika - Réorganisée

## 📁 Vue d'ensemble de la nouvelle structure

Votre projet a été réorganisé pour une meilleure maintenabilité et clarté. Voici la nouvelle organisation :

## 🧩 Composants (components/)

### `components/core/` - Composants de base
- **`ui/`** - Composants d'interface utilisateur (boutons, cartes, formulaires, etc.)
- **`auth/`** - Composants d'authentification (login, signup, etc.)
- **`navigation/`** - Composants de navigation

### `components/features/` - Fonctionnalités métier
- **`card-creator/`** - Création de cartes NFC
- **`card-ordering/`** - Commande de cartes physiques
- **`nfc-onboarding/`** - Onboarding NFC
- **`profiles/`** - Gestion des profils
- **`links/`** - Gestion des liens
- **`contacts/`** - Fonctionnalités de contact
- **`contact-share/`** - Partage de contacts
- **`consent/`** - Gestion du consentement

### `components/debug/` - Outils de débogage
- Composants de diagnostic et de débogage
- Outils de vérification de la base de données
- Composants de test de stockage

### `components/test/` - Composants de test
- Composants utilisés uniquement pour les tests

## 📄 Pages (app/)

### `app/test-pages/` - Pages de test
- Toutes les pages de test ont été déplacées dans ce dossier
- `test-add-to-contacts/`
- `test-card-contact/`
- `test-contact-share/`
- `test-final-contact/`
- `test-links/`
- `test-order-flow/`
- `test-public-profile/`
- `test-ultimate-contact/`

### Pages principales
- **`auth/`** - Pages d'authentification
- **`dashboard/`** - Dashboard utilisateur
- **`onboarding/`** - Processus d'onboarding
- **`payment/`** - Pages de paiement
- **`nfc/`** - Pages NFC

## 🗄️ Base de données (database/)

### `database/migrations-step-by-step/` - Migrations par étapes
- **`01-create-tables.sql`** - Création des tables
- **`02-create-indexes.sql`** - Optimisation des performances
- **`03-enable-rls.sql`** - Activation de la sécurité
- **`04-create-rls-policies.sql`** - Politiques de sécurité
- **`05-setup-storage.sql`** - Configuration du stockage
- **`06-create-functions.sql`** - Fonctions utilitaires
- **`07-create-triggers.sql`** - Triggers automatiques
- **`08-final-verification.sql`** - Vérification finale
- **`README.md`** - Guide d'utilisation des migrations

### `database/DATABASE_SETUP_COMPLETE.sql` - Setup complet
- Script complet pour créer toute la base de données d'un coup
- Utilisez ce fichier pour une nouvelle base de données

## 🚀 Comment utiliser la nouvelle structure

### Pour les composants
```typescript
// Ancien import
import { Button } from "@/components/ui/button"

// Nouveau import (même chemin)
import { Button } from "@/components/core/ui/button"
```

### Pour les pages de test
```typescript
// Ancien chemin
app/test-add-to-contacts/page.tsx

// Nouveau chemin
app/test-pages/test-add-to-contacts/page.tsx
```

### Pour la base de données

#### Option 1: Setup complet (nouvelle base de données)
```sql
-- Utilisez: database/DATABASE_SETUP_COMPLETE.sql
-- Copiez tout le contenu dans l'éditeur SQL de Supabase
```

#### Option 2: Migrations par étapes (maintenance)
```sql
-- Suivez l'ordre dans database/migrations-step-by-step/
-- 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08
```

## 📋 Avantages de cette structure

### ✅ Organisation claire
- Séparation des composants par fonctionnalité
- Pages de test isolées
- Migrations SQL organisées

### ✅ Maintenabilité
- Plus facile de trouver les composants
- Structure logique et prévisible
- Documentation claire

### ✅ Évolutivité
- Facile d'ajouter de nouveaux composants
- Structure modulaire
- Séparation des responsabilités

## 🔧 Migration des imports

Si vous avez des erreurs d'import après la réorganisation, voici les changements à faire :

### Composants UI
```typescript
// Pas de changement nécessaire
import { Button } from "@/components/core/ui/button"
```

### Composants de fonctionnalités
```typescript
// Ancien
import { CardCreator } from "@/components/card-creator/CardCreator"

// Nouveau
import { CardCreator } from "@/components/features/card-creator/CardCreator"
```

### Pages de test
```typescript
// Ancien
import TestPage from "@/app/test-add-to-contacts/page"

// Nouveau
import TestPage from "@/app/test-pages/test-add-to-contacts/page"
```

## 📞 Support

Si vous rencontrez des problèmes avec la nouvelle structure :

1. **Vérifiez les imports** dans vos fichiers
2. **Consultez ce README** pour les nouveaux chemins
3. **Utilisez les migrations étape par étape** pour la base de données
4. **Testez votre application** après les changements

## 🎯 Prochaines étapes

1. **Testez votre application** pour vérifier que tout fonctionne
2. **Mettez à jour vos imports** si nécessaire
3. **Utilisez la nouvelle structure** pour vos futurs développements
4. **Consultez les migrations SQL** si vous devez reprendre votre base de données

Votre projet est maintenant mieux organisé et plus facile à maintenir ! 🎉
