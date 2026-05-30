# Guide - Modification du Design des Profils

## 🎨 Nouvelle Fonctionnalité : Modification du Design

Vous pouvez maintenant modifier le design de vos profils existants directement depuis la page d'édition !

## 📋 Étapes pour Modifier le Design

### 1. **Accéder à l'Édition du Profil**
- Allez dans le **Dashboard** → **Profils**
- Cliquez sur **"Modifier"** sur le profil que vous voulez modifier

### 2. **Modifier le Design**
- Dans le formulaire d'édition, vous verrez une nouvelle section **"Design de la page publique"**
- Sélectionnez le nouveau design dans le menu déroulant :
  - **Design Classique** (bleu) - Layout vertical épuré
  - **Design** (violet) - Grille de cartes interactives  
  - **Design Créatif** (rose) - Effets visuels avancés

### 3. **Sauvegarder**
- Cliquez sur **"Mettre à jour"**
- Le nouveau design sera appliqué immédiatement à votre page publique

## 🔧 Configuration Technique

### Base de Données
Pour activer cette fonctionnalité, exécutez ce script SQL dans Supabase :

```sql
-- Ajouter la colonne design_choice à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS design_choice VARCHAR(50) DEFAULT 'design1';

-- Ajouter la colonne color_theme à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS color_theme VARCHAR(50) DEFAULT 'default';

-- Créer un index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_profiles_design_choice ON profiles(design_choice);

-- Mettre à jour les profils existants
UPDATE profiles 
SET design_choice = 'design1', color_theme = 'default'
WHERE design_choice IS NULL OR color_theme IS NULL;
```

### Fichiers Modifiés
- ✅ `lib/validations.ts` - Ajout des champs design_choice et color_theme
- ✅ `components/features/profiles/ProfileForm.tsx` - Interface de sélection de design
- ✅ `app/[username]/page.tsx` - Utilisation du design stocké dans la base de données

## 🧪 Test de la Fonctionnalité

### Vérification
1. Modifiez le design d'un profil depuis le dashboard
2. Ouvrez la page publique (`/votre-username`)
3. Vérifiez que le nouveau design s'affiche
4. Si nécessaire, videz le cache du navigateur (Ctrl+F5)

## 🎯 Logique d'Affichage

### Priorité des Designs
1. **Design du profil** (table `profiles`) - Priorité principale
2. **Design de la carte NFC** (table `nfc_profiles`) - Si associé à une carte NFC
3. **Design par défaut** (`design1`) - Fallback

### Bouton "Ajouter aux Contacts"
- ✅ **Visible** : Si le profil est associé à une carte NFC
- ❌ **Masqué** : Si le profil n'est pas associé à une carte NFC

## 🚀 Avantages

- **Flexibilité** : Changez le design à tout moment
- **Immédiat** : Application instantanée sur la page publique
- **Rétrocompatible** : Fonctionne avec les profils existants
- **Sécurisé** : Chaque utilisateur ne peut modifier que ses propres profils

## 🔄 Prochaines Étapes

1. **Exécuter le script SQL** dans Supabase
2. **Tester la modification** sur un profil existant
3. **Vérifier l'affichage** sur la page publique

---

**Note** : Cette fonctionnalité est maintenant entièrement intégrée et prête à l'utilisation ! 🎉