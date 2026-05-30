# 📱 Fonctionnalité Numéro de Téléphone et Ajout aux Contacts

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs d'ajouter leur numéro de téléphone à leur profil et aux visiteurs de télécharger automatiquement le contact complet dans leur carnet d'adresses.

## Fonctionnalités ajoutées

### 1. Champ Numéro de Téléphone
- **Formulaire de profil** : Nouveau champ pour saisir le numéro de téléphone
- **Validation** : Format français accepté (+33123456789 ou 0123456789)
- **Affichage** : Le numéro s'affiche sur le profil public avec une icône téléphone

### 2. Ajout Automatique aux Contacts
- **Format vCard** : Génération automatique d'un fichier .vcf
- **API Web Share** : Utilisation de l'API native du navigateur quand disponible
- **Fallback** : Téléchargement direct du fichier vCard
- **Données incluses** :
  - Nom complet
  - Numéro de téléphone
  - Bio/Description
  - Photo de profil
  - Liens vers les réseaux sociaux
  - URL du profil

## Fichiers modifiés

### Base de données
- `database/08-fixes/add-phone-to-profiles.sql` : Script de migration

### Types et validation
- `lib/validations.ts` : Ajout du champ phone au schéma de validation
- `lib/types/database.ts` : Mise à jour des types TypeScript
- `lib/types.ts` : Mise à jour des interfaces

### Composants
- `components/profiles/ProfileForm.tsx` : Ajout du champ téléphone au formulaire
- `components/profiles/PublicProfile.tsx` : Affichage du numéro et bouton d'ajout
- `components/ContactShareButton.tsx` : Nouveau composant pour l'ajout aux contacts

## Installation

### 1. Migration de la base de données
Exécutez le script SQL dans Supabase :
```sql
-- Copiez le contenu de database/08-fixes/add-phone-to-profiles.sql
-- dans l'éditeur SQL de Supabase
```

### 2. Redémarrage de l'application
```bash
npm run dev
```

## Utilisation

### Pour les utilisateurs (création/édition de profil)
1. Accédez au formulaire de création/édition de profil
2. Remplissez le champ "Numéro de téléphone" (optionnel)
3. Sauvegardez le profil

### Pour les visiteurs (profil public)
1. Visitez un profil public
2. Cliquez sur "Ajouter aux contacts"
3. Le contact sera automatiquement ajouté à votre carnet d'adresses

## Compatibilité

### Navigateurs supportés
- **API Web Share** : Chrome 89+, Safari 12+, Firefox 89+
- **Téléchargement vCard** : Tous les navigateurs modernes

### Appareils mobiles
- **iOS** : Intégration native avec l'app Contacts
- **Android** : Intégration avec Google Contacts et autres gestionnaires

## Format vCard généré

```vcard
BEGIN:VCARD
VERSION:3.0
FN:Nom du Profil
N:Nom du Profil;;;
NOTE:Description du profil
TEL:+33123456789
PHOTO:https://example.com/photo.jpg
URL:https://votre-site.com/profil
URL:https://website.com
URL:https://wa.me/1234567890
URL:https://facebook.com/profil
URL:https://instagram.com/profil
URL:https://twitter.com/profil
END:VCARD
```

## Personnalisation

### Modifier la validation du téléphone
Dans `lib/validations.ts`, modifiez la regex :
```typescript
phone: z.string()
  .regex(/^(\+33|0)[1-9](\d{8})$/, 'Format de numéro de téléphone invalide')
  .optional()
  .or(z.literal('')),
```

### Personnaliser l'affichage
Dans `components/profiles/PublicProfile.tsx`, modifiez la section d'affichage du téléphone.

## Dépannage

### Le numéro ne s'affiche pas
- Vérifiez que la colonne `phone` existe dans la table `profiles`
- Vérifiez que le profil contient bien un numéro de téléphone

### L'ajout aux contacts ne fonctionne pas
- Vérifiez que le navigateur supporte l'API Web Share
- Testez le téléchargement du fichier vCard en mode fallback

### Erreur de validation
- Vérifiez que le format du numéro respecte la regex définie
- Les formats acceptés : +33123456789 ou 0123456789
