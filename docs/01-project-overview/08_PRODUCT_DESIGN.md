# 🎨 Product Design - Ofika

> **Design produit pour la plateforme SaaS hybride Ofika**  
> *Version 1.0 - Janvier 2025*

---

## �� Table des Matières

- [Vision Produit](#-vision-produit)
- [Parcours Utilisateur](#-parcours-utilisateur)
- [Fonctionnalités Essentielles](#-fonctionnalités-essentielles)
- [UI/UX Design](#-uiux-design)
- [Différenciateurs Clés](#-différenciateurs-clés)
- [Dashboard Utilisateur](#-dashboard-utilisateur)

---

## 🎯 Vision Produit

### Vision d'Écosystème & Ambition

Ofika est un **écosystème d'identité numérique simple, centralisé en un seul endroit et accessible à tout le monde**, avec l'ambition de devenir la **plateforme de networking N°1 en Côte d'Ivoire**.

### Promesse Produit (Parcours Clé)

👉 **"Tu crées ton profil ➔ Tu obtiens ta page web professionnelle ➔ Tu la partages comme une carte de visite numérique avec son identité visuelle pro en 1 clic, toujours à portée de main."**

### Concept Hybride

Ofika combine :
- **Page Web Pro & Link-in-Bio** → Identité numérique élégante, personnalisable, accessible par lien unique.
- **Cartes Physiques NFC & QR Code** → Cartes connectées toujours sur soi pour partager instantanément son profil lors des rencontres physiques.
- **Plateforme de Networking** → Outil complet de connexion, de gestion de réseau et de statistiques.

### Objectifs Principaux

Créer un écosystème où chaque utilisateur peut :
1. **Créer son profil numérique en 1 clic** et obtenir immédiatement sa page web professionnelle.
2. **Afficher une identité visuelle pro et soignée** toujours accessible sur mobile.
3. **Partager sa carte numérique** par QR Code, NFC, vCard ou lien direct.
4. **Développer son réseau professionnel** et devenir la référence du networking en Côte d'Ivoire.

---

## 👤 Parcours Utilisateur

### 1. Inscription / Onboarding

#### **Étapes d'Inscription**
1. **Choix de la méthode** : Email, Google, Apple
2. **Informations de base** : Nom, prénom, pays
3. **Option carte physique** : "Je veux une carte NFC/QR" → guide d'achat
4. **Vérification** : Email ou SMS de confirmation
5. **Onboarding** : Tour guidé de la plateforme

#### **Options d'Inscription**
- **Gratuit** : Page bio basique, 4 liens, analytics limités
- **Premium** : Page bio avancée, liens illimités, analytics complets, carte physique

### 2. Création de Profil

#### **Informations de Base**
- **Photo de profil** : Upload ou caméra
- **Nom complet** : Prénom + nom
- **Bio** : Description professionnelle (max 160 caractères)
- **Informations de contact** : Téléphone, email, site web
- **Réseaux sociaux** : LinkedIn, Twitter, Instagram, etc.

#### **Liens Type Linktree**
- **Réseaux sociaux** : Instagram, Facebook, Twitter, TikTok
- **Professionnels** : LinkedIn, GitHub, Behance
- **Communication** : WhatsApp Business, Telegram
- **Contenu** : YouTube, Podcast, Blog
- **E-commerce** : Boutique en ligne, PDF, documents
- **Événements** : Calendrier, réservation, tickets

### 3. Personnalisation

#### **Thèmes et Couleurs**
- **Thèmes prédéfinis** : Classique, Moderne, Créatif, Minimaliste
- **Couleurs personnalisées** : Palette Ofika + couleurs personnalisées
- **Polices** : Inter, Roboto, Open Sans, Poppins
- **Layouts** : Différentes mises en page

#### **Éléments Visuels**
- **Logo/Image de couverture** : Upload ou génération automatique
- **Photo de profil** : Cadre personnalisable
- **Arrière-plan** : Couleur unie, dégradé, ou image
- **Icônes** : Style cohérent pour tous les liens

#### **Prévisualisation**
- **Temps réel** : Modifications visibles instantanément
- **Multi-appareils** : Desktop, tablette, mobile
- **Partage** : Aperçu du lien partagé

### 4. Partage

#### **Méthodes de Partage**
- **Lien unique** : `ofika.me/username`
- **QR code** : Affiché sur site, cartes, supports imprimés
- **Carte NFC** : Tap pour ouvrir la page
- **Intégration** : Widget pour sites web

#### **Personnalisation du Partage**
- **QR code personnalisé** : Logo au centre, couleurs
- **Carte NFC** : Design personnalisé, logo, couleurs
- **Lien court** : `ofika.me/john` au lieu de `ofika.me/john-doe-123`

### 5. Analytics & Suivi

#### **Métriques de Base**
- **Vues** : Nombre de vues de la page
- **Clics** : Clics sur chaque lien
- **Scans** : Scans QR code et taps NFC
- **Géographie** : Pays et villes des visiteurs
- **Appareils** : Types d'appareils utilisés

#### **Analytics Avancés**
- **Top liens** : Liens les plus cliqués
- **Heures de pointe** : Meilleurs moments pour partager
- **Sources de trafic** : D'où viennent les visiteurs
- **Export contacts** : CRM léger des contacts rencontrés

---

## 🧩 Fonctionnalités Essentielles (MVP)

### Core Features

#### **Compte Utilisateur**
- **Inscription sécurisée** : Email, Google, Apple
- **Authentification** : 2FA, récupération de mot de passe
- **Profil utilisateur** : Informations personnelles
- **Paramètres** : Notifications, confidentialité, sécurité

#### **Page Bio Link-in-Bio**
- **Responsive** : Mobile-first, adaptatif
- **Personnalisation** : Thèmes, couleurs, polices
- **Liens** : Ajout, modification, suppression, réorganisation
- **Prévisualisation** : Temps réel, multi-appareils

#### **Carte NFC/QR**
- **QR code dynamique** : Modification sans réimpression
- **Carte NFC** : Tap pour ouvrir la page
- **Personnalisation** : Design, logo, couleurs
- **Activation** : Processus simple d'activation

#### **Analytics**
- **Statistiques de base** : Vues, clics, scans
- **Rapports** : Hebdomadaires, mensuels
- **Export** : CSV, PDF, API
- **Dashboard** : Vue d'ensemble des performances

### Features Avancées

#### **Multi-Profils**
- **Profils multiples** : Pro, perso, événement
- **Basculement** : Changement rapide entre profils
- **Gestion centralisée** : Dashboard unifié
- **Partage sélectif** : Liens différents par profil

#### **Intégrations**
- **WhatsApp Business** : Intégration directe
- **Calendrier** : Réservation de créneaux
- **E-commerce** : Boutique en ligne
- **CRM** : Export des contacts

---

## 🎨 UI/UX Design

### Principes de Design

#### **Mobile-First**
- **Responsive** : Adaptation à tous les écrans
- **Touch-friendly** : Boutons de 44px minimum
- **Performance** : Chargement <3 secondes sur 3G
- **Accessibilité** : Support des lecteurs d'écran

#### **Simplicité**
- **Interface claire** : Navigation intuitive
- **Actions rapides** : Moins de 3 clics pour partager
- **Feedback visuel** : Confirmations et états
- **Guidance** : Tooltips et aide contextuelle

### Dashboard Utilisateur

#### **Accueil / Stats Rapides**
- **Métriques clés** : Vues, clics, scans
- **Graphiques** : Évolution dans le temps
- **Top liens** : Liens les plus performants
- **Alertes** : Notifications importantes

#### **Mon Profil / Page Bio**
- **Édition facile** : Interface drag & drop
- **Prévisualisation** : Temps réel
- **Personnalisation** : Thèmes, couleurs, polices
- **Test** : Aperçu mobile et desktop

#### **Mes Cartes NFC/QR**
- **Association** : Lier carte à profil
- **Activation** : Processus simple
- **Suivi** : Statut de livraison
- **Personnalisation** : Design de la carte

#### **Analytics Détaillés**
- **Vues** : Par jour, heure, pays
- **Clics** : Performance par lien
- **Scans** : QR code et NFC
- **Export** : Données en CSV/PDF

#### **Contacts Rencontrés**
- **CRM léger** : Gestion des contacts
- **Notes** : Ajout de notes personnelles
- **Tags** : Catégorisation des contacts
- **Export** : VCard, CSV

### Design System

#### **Couleurs Ofika**
- **Orange** : `oklch(0.7 0.15 45)` - Couleur principale
- **Rose** : `oklch(0.75 0.12 350)` - Couleur secondaire
- **Gradient** : `linear-gradient(135deg, #d2691e, #cc5500, #b91c7c)`
- **Neutres** : Gris clairs et foncés pour le contenu

#### **Typographie**
- **Police principale** : Inter (var(--font-inter))
- **Fallback** : Geist, system fonts
- **Responsive** : `text-sm sm:text-base lg:text-lg`
- **Hiérarchie** : `text-xl sm:text-2xl lg:text-3xl xl:text-4xl`

#### **Espacements**
- **Rayon** : `0.625rem` (10px) - Rayon principal
- **Padding** : `p-4 sm:p-6 lg:p-8` - Responsive
- **Grilles** : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

---

## �� Différenciateurs Clés

### Innovation Technique

#### **Combinaison Unique**
- **Link-in-bio + NFC/QR** : Unique en Afrique
- **Page web + carte physique** : Meilleur des deux mondes
- **Analytics intégrés** : Suivi complet des interactions
- **Multi-profils** : Gestion centralisée

#### **Adaptation Africaine**
- **Paiement local** : Mobile Money (MTN, Orange, Moov)
- **Support local** : Équipe africaine, langues locales
- **Connexion faible** : Optimisé pour 3G/4G
- **Culture locale** : Templates et UX adaptés

### Expérience Utilisateur

#### **Simplicité**
- **Ultra simple** : Interface intuitive
- **Rapide** : Moins de 3 clics pour partager
- **Mobile-first** : Optimisé pour smartphone
- **Offline** : Fonctionne sans connexion (cartes)

#### **Intégrations**
- **WhatsApp Business** : Intégration directe
- **Calendrier** : Réservation de créneaux
- **E-commerce** : Boutique en ligne
- **CRM** : Export des contacts

---

## 💰 Monétisation & Plans SaaS

Ofika propose un modèle Freemium avec 3 niveaux d'abonnements et la vente de cartes physiques NFC.

> ℹ️ *Note : Seul le plan Gratuit (Essentiel) et l'achat de carte NFC sont actifs pour le moment. Les plans Pro et Business sont en statut BETA / Bientôt disponible.*

### Plans SaaS

#### 1. **Plan Essentiel (Gratuit à vie)** - `0 FCFA`
- **Pages Link-in-Bio** : Jusqu'à 3 pages publiques
- **Cartes V-NFC** : Jusqu'à 3 cartes NFC virtuelles
- **QR Codes** : 7 statiques & 7 dynamiques (incluant les 3 pour cartes virtuelles)
- **Liens externes par page** : Jusqu'à 4 liens
- **Avis clients** : 1 seul lien de collecte d'avis clients
- **Templates** : 2 templates de page publique inclus
- **Fonctionnalités** : Sélecteur d'Emojis Émotionnels (40+ emojis), Notifications Web Push (max 100/mois), Rappels automatiques (7 jours), Zéro commission de vente
- **Analytics** : Statistiques de visites sur 30 jours
- **Contrainte** : Logo Ofika obligatoire sur le design final
- **Option** : Achat de Cartes NFC Physiques disponible

#### 2. **Plan Pro (BETA / Recommandé)** - `1 000 FCFA / mois` *(Bientôt disponible)*
- **Pages Link-in-Bio** : Jusqu'à 20 pages publiques
- **Cartes V-NFC** : Jusqu'à 20 cartes NFC virtuelles
- **QR Codes** : 20 statiques & 20 dynamiques
- **Liens externes par page** : Jusqu'à 10 liens
- **Avis clients** : Jusqu'à 20 liens de collecte d'avis clients avec Protection Anti-Fake
- **Templates** : 8 templates premium débloqués
- **Notifications & Relances** : Web Push (max 1 000/mois), 50 SMS et E-mails de relance automatique
- **Analytics** : Statistiques avancées (90j) + Géo-scans

#### 3. **Plan Business / Entreprise (BETA)** - `3 000 FCFA / mois` *(Bientôt disponible)*
- **Pages & Cartes V-NFC** : 100% Illimitées
- **QR Codes** : 100 statiques & 100 dynamiques
- **Liens externes par page** : 100% Illimité
- **Avis clients & Web Push** : 100% Illimités
- **Templates & Customisation** : Tous les templates + Personnalisation & designs uniques sur-mesure
- **Vente directe** : Module E-commerce / Services avec checkout & paiement direct
- **Branding** : Nom de domaine personnalisé (`.com`, `.ci`), Marque blanche complète (sans logo Ofika)
- **Analytics & Support** : Statistiques à vie + Export CSV, Support Dédié Prioritaire 24h/24 et 7j/7

---

### Édition Physique - Carte NFC Ofika

#### **Carte NFC Officielle** - `14 600 FCFA` (Achat unique)
- **Concept** : Friction-zéro (Bip & Connect) - La carte qui fait tout le travail.
- **Avantages** : Écologique & Réutilisable à vie, Modifiable en temps réel.
- **Livraison** : Livraison Express 24h.
- **Personnalisation sur-mesure** : Quel que soit votre plan, vous pouvez concevoir une carte 100% unique (logo, couleurs, finitions) en contactant l'équipe Ofika (le prix s'ajustera selon votre demande).
- **Disponibilité** : Disponible à l'achat une fois votre compte créé.

---

## 🎯 Conclusion

Ofika représente une **innovation unique** en combinant les meilleurs aspects des plateformes link-in-bio et des solutions NFC/QR, avec une **adaptation spécifique au marché africain**.

**Points clés** :
- **Concept hybride** unique en Afrique
- **Mobile-first** pour l'usage africain
- **Paiements locaux** intégrés
- **Analytics complets** pour le suivi
- **Multi-profils** pour la flexibilité

**Prochaines étapes** :
- Développement du MVP
- Tests utilisateurs en Afrique
- Intégration des paiements locaux
- Lancement progressif par pays

---

*Document révisé : Janvier 2025*  
*Prochaine révision : Avril 2025*
```

