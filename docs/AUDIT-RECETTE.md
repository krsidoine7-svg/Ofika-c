# Rapport d'audit : Ofika (Cartes de visite NFC & Link-in-Bio)

Date : 25 octobre 2026. Rédigé pour validation avant la génération du cahier de recette.

## 1. Hypothèses retenues

- **H01** : L'environnement de test principal pour la recette non technique est l'instance locale `http://localhost:3000` connectée au projet Supabase de staging/développement.
- **H02** : Les paiements en ligne sont testés en mode bac à sable (Sandbox / Test API keys) pour GeniusPay, et en flux direct avec justificatif de test pour Wave.
- **H03** : Le rôle administrateur est accessible pour le compte `admin@ofika.com` ou `krsidoine7@gmail.com` via l'interface `/dashboard/admin`.
- **H04** : La devise de facturation de référence est le Franc CFA (XOF), avec un prix de base catalogue fixé à 14 600 XOF pour la carte NFC + QR Code.

## 2. Fiche de contexte

| Axe | Constat | Statut | Source |
| :--- | :--- | :--- | :--- |
| **Nature du projet** | Plateforme SaaS de profils digitaux (Link-in-Bio) couplée à une boutique e-commerce de cartes physiques connectées NFC. | Déduit | `app/page.tsx`, `package.json`, `app/order/create/page.tsx` |
| **Secteur et sous-secteur** | **Hybride : E-commerce Smart Hardware & SaaS Networking / Outil Pro** (avec passerelles Mobile Money UEMOA). | Déduit | `scan_project.py` (scores 124 et 89), `lib/types/payments.ts` |
| **Confiance sur le secteur** | **Élevé** | | Indices : Vente de cartes physiques NFC avec livraison à domicile, génération de QR codes dynamiques vCard, intégration Mobile Money (Wave, GeniusPay), tableaux de bord d'analytics et de contacts. |
| **Vision et objectif métier** | Permettre aux professionnels et créateurs d'Afrique et de la diaspora de centraliser leur identité, partager leurs coordonnées en 1 seconde via NFC/QR, et recevoir des commandes physiques. | Déduit | `docs/01-project-overview/02_USER_JOURNEY.md` |
| **Utilisateurs cibles** | Professionnels indépendants, créateurs de contenu, entreprises (B2B), et leurs contacts / clients finaux (visiteurs mobiles). | Déduit | `app/[username]/page.tsx`, `components/features/profiles` |
| **Conformité applicable** | Protection des données personnelles (Loi ivoirienne n° 2013-450 / ARTCI et RGPD pour la diaspora), sécurité des paiements sans stockage de coordonnées bancaires (PCI-DSS délégué). | Déduit | `app/privacy/page.tsx`, `app/terms/page.tsx` |
| **Environnements et URL** | Local : `http://localhost:3000` ; Production : `https://ofika.ci` (et alias Vercel). | Déduit | `.env.local`, `middleware.ts` |
| **Stade du projet** | En production / Prêt pour recette de pré-déploiement (Phase 7). | Déduit | `git status`, historique de commits, tables de production |
| **Identité visuelle** | Nom : Ofika. Couleur primaire : Orange Ofika `#F97316` (contrastes avec fond sombre `#111111` et blanc). Logos : `public/assets/logos/logo-orange-full.svg`, icône PNG `public/apple-touch-icon.png`. | Déduit | `extract_brand.py`, `app/globals.css` |

## 3. Stack et arborescence

- **Frontend** : Next.js 15.5.23 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, Lucide React, Sonner (Toasts).
- **Backend & Données** : Supabase (PostgreSQL, Auth avec JWT et MFA, Realtime, Storage pour avatars et justificatifs Wave).
- **Passerelles de paiement** : GeniusPay (Mobile Money & Cartes via Checkout sécurisé) et Wave Direct (Deep Link / QR Code de paiement).
- **PWA & Offline** : Service Worker PWA, Web Push API via protocole VAPID.
- **Arborescence simplifiée** :
  - `app/` : Routes publiques (`/`, `/[username]`, `/order/create`), authentification (`/login`, `/signup`, `/auth`), dashboard (`/dashboard`, `/dashboard/cards`, `/dashboard/admin`), API (`/api/orders`, `/api/payments`, `/api/profiles`, `/api/push`).
  - `components/features/` : Composants métiers (`card-ordering/`, `profiles/`, `contacts/`, `reviews/`, `admin/`).
  - `lib/` : Services métiers, clients Supabase, types partagés, schémas de validation Zod (`lib/validations/order-form.ts`).

## 4. Modules et fonctionnalités

| Module | Fonctionnalités (CRUD et actions métier) | Rôles concernés | Sources (fichiers, routes, écrans) |
| :--- | :--- | :--- | :--- |
| **M01 : Authentification & Sécurité** | Inscription e-mail/mot de passe, Google OAuth, connexion, déconnexion, réinitialisation de mot de passe, changement obligatoire du mot de passe initial, garde de route admin. | Visiteur, Utilisateur, Admin | `app/login/page.tsx`, `app/signup/page.tsx`, `components/core/auth/` |
| **M02 : Tunnel de Commande Carte NFC** | Sélection de la carte physique, formulaire de livraison unifié Zod, choix de la méthode de paiement (GeniusPay / Wave), calcul du montant serveur (14 600 XOF), redirection vers la passerelle. | Visiteur, Utilisateur | `app/order/create/page.tsx`, `components/features/card-ordering/CardOrderingFlow.tsx`, `app/api/orders/create/route.ts` |
| **M03 : Profil Link-in-Bio & Carte Numérique** | Création et édition de profils, choix de templates de design (Classic, Modern, Design 7...), ajout de liens sociaux, personnalisation de thème visuel, téléversement de photo de profil. | Utilisateur | `app/dashboard/profiles/`, `components/features/profiles/`, `app/api/profiles/` |
| **M04 : Consultation Publique & vCard** | Affichage public du profil responsive mobile `/[username]`, téléchargement instantané du contact vCard (`.vcf`), formulaire d'échange de coordonnées (lead capture). | Visiteur | `app/[username]/page.tsx`, `app/[username]/ProfileClient.tsx`, `components/features/contacts/ContactExchangeForm.tsx` |
| **M05 : Dashboard & Gestion des Cartes** | Vue synthétique des statistiques de visite, gestion des cartes NFC associées, liste des contacts capturés, gestion des avis clients publics, activation des rappels Web Push. | Utilisateur | `app/dashboard/page.tsx`, `app/dashboard/cards/`, `app/dashboard/contacts/` |
| **M06 : Back-Office & Administration** | Suivi et changement de statut des commandes (en attente, payée, expédiée, livrée), activation/désactivation des passerelles de paiement, gestion des utilisateurs, modération des avis. | Admin | `app/dashboard/admin/page.tsx`, `components/features/admin/`, `app/api/admin/` |
| **M07 : Paiements Mobile Money (GeniusPay & Wave)** | Initiation de paiement GeniusPay, webhook de confirmation de paiement, téléversement de reçu de virement Wave, validation manuelle par l'administrateur. | Utilisateur, Admin, Système | `app/api/payments/geniuspay/`, `app/api/payments/wave/`, `PaymentButtonGeniusPay.tsx` |

## 5. Rôles et permissions

| Rôle | Peut faire | Ne doit pas pouvoir faire |
| :--- | :--- | :--- |
| **Visiteur** | Consulter un profil public `/[username]`, télécharger la vCard, soumettre un contact, passer une commande de carte physique sans compte obligatoire. | Accéder au dashboard `/dashboard`, modifier les profils d'autrui, accéder au back-office `/dashboard/admin`. |
| **Utilisateur (`user`)** | Créer et éditer ses profils, associer ses cartes NFC, voir ses analytics, exporter ses contacts, suivre ses propres commandes. | Accéder aux commandes ou aux profils des autres utilisateurs, modifier les passerelles de paiement, accéder à `/dashboard/admin`. |
| **Administrateur (`admin`)** | Accéder au tableau de bord administrateur `/dashboard/admin`, modifier le statut de toute commande, activer/désactiver Wave ou GeniusPay, modérer les avis, gérer les comptes. | Altérer les transactions financières externes sans traçabilité. |

## 6. Comptes de test détectés

| Profil | E-mail | Mot de passe | Rôle | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Administrateur Principal** | `admin@ofika.com` | *À fournir ou initialiser* | `admin` | `supabase/migrations/20250307_add_user_roles.sql:65` |
| **Administrateur Secondaire** | `krsidoine7@gmail.com` | *Compte existant en BD* | `admin` | `supabase/migrations/20250307_fix_admin_rls.sql:58` |
| **Utilisateur Standard Test** | `user1@test-ofika.com` | *À initialiser lors de la recette* | `user` | Déduit pour isolation |
| **Visiteur / Acheteur Test** | `jean.kouassi@example.com` | *Non applicable (Acheteur sans compte)* | `visiteur` | `docs/04-database/RESUME_TABLE_ORDERS.md` |

*Note* : Si un mot de passe est réinitialisé pendant la recette, le protocole de test prévoit l'inscription directe d'un compte de recette dédié `recette.ofika@gmail.com`.

## 7. Profil sectoriel (E-Commerce & Smart Cards / Mobile Money)

| Fonctionnalité standard du secteur | État dans le projet | Remarque |
| :--- | :--- | :--- |
| Commande avec saisie d'adresse de livraison | **Présente** | Unifiée dans `CardOrderingFlow` et `order-form.ts`. |
| Paiement Mobile Money direct (Wave / Orange / MTN) | **Présente** | Supporté via GeniusPay (automatique) et Wave Direct (manuel/reçu). |
| Calcul automatique du prix côté serveur | **Présente** | 100% sécurisé côté serveur dans `/api/orders/create`. |
| Stock en temps réel multi-entrepôts | **Absente** | Non nécessaire à ce stade (fabrication à la demande). Signalée en annexe d'écarts. |
| Facture PDF téléchargeable | **Partielle** | Reçu de commande affiché, export PDF en cours de finalisation. |
| Partage sans contact NFC & QR code dynamique | **Présente** | Cœur du produit (vCard 3.0 / 4.0 générée). |
| Gestion des avis et preuve sociale | **Présente** | Modération et affichage sur les profils publics. |
| Notifications Push PWA | **Présente** | Table `push_subscriptions` consolidée avec protocole VAPID. |

- **Parcours de bout en bout retenus** : 
  1. Parcours Acheteur : Visite → Commande carte NFC → Formulaire livraison → Paiement GeniusPay → Confirmation.
  2. Parcours Réseau : Rencontre physique → Scan QR Code → Découverte profil `/[username]` → Clic « Enregistrer contact » (vCard) → Envoi formulaire d'échange.
  3. Parcours Admin : Réception commande → Vérification du paiement → Passage du statut à "En livraison".
- **Réglementation applicable** : Loi Ivoirienne n° 2013-450 sur la protection des données (ARTCI), RGPD, obligations de mentions légales et politique de confidentialité.
- **Risques prioritaires (P1)** : Échec de paiement non signalé à l'acheteur, mauvaise transmission des coordonnées de livraison, tentative d'accès frauduleux aux commandes d'autres utilisateurs via l'API.

## 8. Cas limites et points de vigilance

| Point | Où | Priorité |
| :--- | :--- | :--- |
| **Format du numéro de téléphone Mobile Money** | Tunnel de commande (`PhoneInput`) | **P1** : Les livreurs et passerelles exigent des numéros valides (+225 / +221). |
| **Double soumission de paiement** | Boutons de paiement (`PaymentButtonGeniusPay`) | **P1** : Doit désactiver le bouton dès le premier clic pour éviter les doublons de transaction. |
| **Téléchargement vCard sur navigateur in-app** | Scan via Instagram / WhatsApp / TikTok | **P1** : Les navigateurs intégrés bloquent parfois les téléchargements de fichiers `.vcf`. |
| **Contraste et lisibilité des profils sombres** | Templates de profils Link-in-Bio | **P2** : Vérifier la lisibilité sur écran smartphone en plein soleil. |
| **Accessibilité mobile (Cible tactile > 44px)** | Tous les formulaires et boutons d'action | **P2** : Ergonomie au pouce validée sur petits écrans (iPhone SE / Android). |

## 9. Zones d'ombre et questions pour la recette

1. **Passerelle Wave** : Souhaitez-vous inclure le test du téléversement de reçu manuel Wave (`WaveReceiptUploadButton`), ou privilégier le flux 100% automatique GeniusPay ?
2. **Environnement de test des paiements** : Confirmez-vous l'utilisation des clés sandbox / test pour valider les redirections bancaires sans débit réel ?

## 10. Plan du cahier proposé

| Module de recette | Tests estimés | Dont P1 |
| :--- | :--- | :--- |
| **Module 01 : Authentification & Contrôle d'accès** | 6 tests | 2 |
| **Module 02 : Tunnel d'achat & Commande physique NFC** | 8 tests | 4 |
| **Module 03 : Paiements Mobile Money (GeniusPay & Wave)** | 6 tests | 3 |
| **Module 04 : Édition du Profil & Templates Link-in-Bio** | 7 tests | 2 |
| **Module 05 : Expérience Visiteur (Scan QR & vCard)** | 6 tests | 3 |
| **Module 06 : Espace Administration & Suivi Logistique** | 5 tests | 2 |
| **Module 07 : Parcours de bout en bout (Commande → Livraison → Scan)** | 3 tests | 2 |
| **Module 08 : Tests Transverses (Mobile, Sécurité, Accessibilité)** | 5 tests | 1 |
| **TOTAL** | **46 tests** | **19 (P1)** |
