# Système de Partage de Contacts - Ofika

## Vue d'ensemble

Ce système permet aux utilisateurs de partager leurs profils avec un bouton "Ajouter aux contacts" qui ouvre directement l'application de téléphonie de l'appareil. Le système détecte automatiquement le type d'appareil (iOS, Android, Desktop) et adapte le comportement en conséquence.

## Fonctionnalités

### 🎯 Détection automatique du device
- **iOS** : Ouvre l'app Contacts avec le fichier vCard
- **Android** : Ouvre l'app Contacts avec le fichier vCard
- **Desktop** : Télécharge le fichier .vcf

### 📱 Partage mobile
- Utilise les protocoles natifs des appareils
- Ouvre directement l'application de contacts
- Génère un fichier vCard compatible

### 💻 Partage desktop
- Télécharge un fichier .vcf
- Compatible avec tous les gestionnaires de contacts
- Support des applications comme Outlook, Gmail, Thunderbird

### 🔗 Partage Web
- Utilise l'API Web Share native
- Fallback vers copie de lien pour navigateurs anciens
- Partage par email avec lien pré-rempli

### 📊 QR Code
- Génération de QR Code pour le profil
- Facilite le partage en personne
- Interface responsive

## Composants

### 1. `AddToContactsButton.tsx`
Composant de base avec détection de device et génération de vCard.

### 2. `ContactShareButton.tsx`
Composant amélioré avec Web Share API et gestion d'erreurs.

### 3. `AdvancedContactShare.tsx`
Composant avancé avec support complet des fonctionnalités de partage.

### 4. `UltimateContactShare.tsx`
Composant ultime avec toutes les fonctionnalités :
- Détection automatique du device
- Ajout aux contacts mobile
- Téléchargement desktop
- Partage Web
- Copie de lien
- Partage par email
- QR Code

## Pages de test

### 1. `/test-contact-share`
Test du composant de base avec détection de device.

### 2. `/test-ultimate-contact`
Test du composant avancé avec toutes les fonctionnalités.

### 3. `/test-final-contact`
Test final du système complet.

## Utilisation

### Dans un profil public
```tsx
import { UltimateContactShare } from "@/components/UltimateContactShare"

<UltimateContactShare profile={profile} />
```

### Configuration du profil
Le profil doit contenir les informations suivantes :
- `name` : Nom du contact
- `bio` : Description (optionnelle)
- `imageUrl` : URL de l'image (optionnelle)
- `links` : Liens du profil

## Protocoles supportés

### iOS
- Utilise le protocole `data:text/vcard` avec téléchargement automatique
- Ouvre l'app Contacts avec le fichier vCard

### Android
- Utilise le protocole `data:text/vcard` avec ouverture directe
- Ouvre l'app Contacts avec le fichier vCard

### Desktop
- Télécharge un fichier .vcf
- Compatible avec tous les gestionnaires de contacts

## Format vCard

Le système génère un fichier vCard au format 3.0 avec :
- Nom complet (FN)
- Nom de famille (N)
- Description (NOTE)
- Photo (PHOTO)
- URL du profil (URL)

## Gestion des erreurs

- Détection des popups bloqués
- Fallback vers téléchargement
- Messages d'erreur utilisateur
- Gestion des navigateurs anciens

## Accessibilité

- Support des lecteurs d'écran
- Navigation au clavier
- Indicateurs visuels clairs
- Messages d'état appropriés

## Performance

- Détection de device côté client
- Génération de vCard à la demande
- Nettoyage des URLs d'objets
- Optimisation des re-renders

## Tests

Pour tester le système :

1. **Mobile iOS** : Vérifiez que l'app Contacts s'ouvre
2. **Mobile Android** : Vérifiez que l'app Contacts s'ouvre
3. **Desktop** : Vérifiez que le fichier .vcf se télécharge
4. **Partage Web** : Testez l'API Web Share
5. **Copie de lien** : Vérifiez la copie dans le presse-papiers
6. **Email** : Testez l'ouverture du client email
7. **QR Code** : Vérifiez l'affichage/masquage du QR Code

## Dépendances

- React 18
- Next.js 15
- shadcn/ui
- Lucide React (icônes)
- Sonner (toasts)

## Support des navigateurs

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

## Notes de développement

- Le système utilise les Web APIs modernes
- Fallback pour navigateurs anciens
- Gestion des erreurs robuste
- Interface responsive
- Accessibilité complète
