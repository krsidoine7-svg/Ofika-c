# Cartographie Générale Unifiée des Flux Utilisateur Ofika

> **Document Maître de Cartographie Fonctionnelle & Technique**  
> Ce document relie l'ensemble des parcours utilisateurs de la plateforme Ofika, de l'inscription initiale à l'administration des commandes et au partage de cartes NFC/vCard.

---

## 📌 Vue d'Ensemble des 6 Catégories de Flux

Le dossier `flux-utilisateur/` est structuré en **6 sous-dossiers thématiques** :

1. 📂 **`auth-et-compte/`** : Inscription, Connexion classique & Google OAuth, Réinitialisation de mot de passe.
2. 📂 **`onboarding/`** : Parcours d'accueil Get-Started, sélection de carte (NFC + QR / Digital), adresse de livraison.
3. 📂 **`paiement/`** : Gateway GeniusPay (automatique), Wave Direct (virement + reçu), masquage dynamique du bouton Payer.
4. 📂 **`cartes-et-profils/`** : Activation & liaison de puce NFC, édition du profil Link-in-Bio, scan visiteur et vCard.
5. 📂 **`administration/`** : Suivi logistique (Préparation, Expédition, Livraison), configuration du prix & passerelles.
6. 📂 **`pwa-et-offline/`** : Architecture PWA Offline-First, magasin IndexedDB, file d'attente FIFO, synchronisation réactive et notifications Push VAPID.

---

## 🌐 Schéma Général Unifié & Ramifications (Mermaid)

```mermaid
flowchart TD
    %% ==========================================
    %% 1. AUTHENTIFICATION & COMPTE
    %% ==========================================
    subgraph CAT1 ["1. AUTHENTIFICATION & COMPTE"]
        UserVisit([Visiteur sur Ofika]) --> AuthChoice{Déjà un compte ?}
        AuthChoice -->|Non| Register[Inscription : Nom, Email, Password]
        AuthChoice -->|Oui| Login[Connexion : Email/Pass ou Google OAuth]
        Register --> UserCreated[Compte créé & Profil initialisé]
        Login --> UserSession[Session Active]
    end

    %% ==========================================
    %% 2. ONBOARDING & COMMANDE DE CARTE
    %% ==========================================
    subgraph CAT2 ["2. ONBOARDING & COMMANDE DE CARTE"]
        UserSession --> GetStarted[Landing /get-started]
        GetStarted --> FetchPrice[Lecture Prix Dynamique BD Supabase : 14 600 XOF]
        FetchPrice --> SelectCardType{Choix du Modèle}
        SelectCardType -->|NFC + QR Code| CardPhysical[Carte Physique NFC]
        SelectCardType -->|QR Code Seul| CardDigital[Carte Digitale QR]
        CardPhysical --> ShippingForm[Saisie Adresse de Livraison & Contact]
        CardDigital --> ShippingForm
        ShippingForm --> CreateOrder[POST /api/orders/create status=pending]
    end

    %% ==========================================
    %% 3. PAIEMENT & VALIDATION
    %% ==========================================
    subgraph CAT3 ["3. PAIEMENT & VALIDATION"]
        CreateOrder --> PayGateCheck{Vérification Passerelles Actives}

        PayGateCheck -->|GeniusPay & Wave Actifs| ClientPayChoice{Choix du Client}
        PayGateCheck -->|GeniusPay Seul| GeniusPayFlow
        PayGateCheck -->|Wave Seul| WaveFlow
        PayGateCheck -->|0 Actif| DisabledGate[Paiement Désactivé]

        ClientPayChoice -->|GeniusPay| GeniusPayFlow[Checkout GeniusPay Mobile Money/Carte]
        ClientPayChoice -->|Wave Direct| WaveFlow[Lien/QR Wave + Upload Reçu Client]

        GeniusPayFlow --> GPWebhook[Webhook GeniusPay payment.success]
        GPWebhook --> AutoPaid[UPDATE orders status=paid, payment_status=succeeded]

        WaveFlow --> ReceiptUploaded[UPDATE orders payment_status=processing]
        ReceiptUploaded --> AdminReview{Validation Admin sur /admin/orders}
        AdminReview -->|Admin Valide| AutoPaid
        AdminReview -->|Admin Rejette| PaymentFailed[UPDATE orders payment_status=failed]
        PaymentFailed --> ShowPayBtn[Bouton Payer Réapparaît]
        ShowPayBtn --> ClientPayChoice

        AutoPaid --> HidePayBtn[🚫 Bouton Payer MASQUÉ DÉFINITIVEMENT]
        AutoPaid --> NotifPaid[Notification Client : Paiement Confirmé !]
    end

    %% ==========================================
    %% 4. ACTIVATION CARTE & PROFIL LINK-IN-BIO
    %% ==========================================
    subgraph CAT4 ["4. ACTIVATION CARTE & PROFIL LINK-IN-BIO"]
        NotifPaid --> ProfileEdit[Édition du Profil /dashboard/profiles/edit]
        ProfileEdit --> AddLinks[Ajout Liens Sociaux, Avatar, Thème, Bio]
        AddLinks --> CardShipment[Réception de la carte physique NFC]
        CardShipment --> TapNFC[Scan / Tapote Carte NFC]
        TapNFC --> BindNFC[Association nfc_cards.profile_id = profile.id]
        
        BindNFC --> PublicView[Visiteur consulte ofika.ci/p/username]
        PublicView --> ExportVcard[Clic 'Enregistrer Contact' ➔ Téléchargement .vcf]
    end

    %% ==========================================
    %% 5. ADMINISTRATION & LOGISTIQUE
    %% ==========================================
    subgraph CAT5 ["5. ADMINISTRATION & LOGISTIQUE"]
        AutoPaid --> AdminLogistics{Traitement Logistique Admin}
        AdminLogistics --> AdminPrep[1. En préparation ➔ Notif Fabrication]
        AdminPrep --> AdminShip[2. Expédié ➔ Notif Transit]
        AdminShip --> AdminDelivered[3. Livré ➔ Notif Livré]

        AdminConfig[Admin /dashboard/admin/payments] --> EditPricing[Modification Prix du Tarif Officiel]
        AdminConfig --> ToggleGateways[Activer / Désactiver Passerelles ON/OFF]
        EditPricing --> FetchPrice
        ToggleGateways --> PayGateCheck
    end

    %% ==========================================
    %% 6. PWA, MODE HORS-LIGNE & PUSH VAPID
    %% ==========================================
    subgraph CAT6 ["6. PWA, MODE HORS-LIGNE & PUSH VAPID"]
        UserSession --> NetCheck{Statut Connexion Réseau}
        NetCheck -->|Connecté| OnlineApp[Navigation PWA classique]
        NetCheck -->|Hors-Ligne| OfflineApp[IndexedDB ofika_offline_db + OfflineBanner Ambre]
        OfflineApp --> OfflineMutations[Modifications & Création Profil en local FIFO]
        OfflineMutations --> NetReturn[Retour du Réseau Internet]
        NetReturn --> AutoSync[Hook useOfflineSync ➔ Supabase DB & Storage]
        AutoSync --> ToastSuccess[Notification Toast : Synchro Réussie !]

        UserSession --> PushOptIn[Activation Push VAPID dans paramètres]
        PushOptIn --> PushSub[Enregistrement push_subscriptions]
        AdminPrep --> PushTrigger[Backend envoie Notification Push VAPID]
        PushTrigger --> ServiceWorker[SW sw.js réveillé en tâche de fond]
        ServiceWorker --> NativeNotif[Affichage Notification Native Smartphone]
    end
```

---

## 📂 Index Complet des Fichiers de Flux

| Catégorie | Fichier de Document | Contenu |
| :--- | :--- | :--- |
| **Authentification** | 📄 [connexion-et-oauth.md](auth-et-compte/connexion-et-oauth.md) | Connexion par Identifiants & Google OAuth avec gestion des rôles. |
| **Authentification** | 📄 [creation-de-compte.md](auth-et-compte/creation-de-compte.md) | Inscription, validations d'email et initialisation de profil. |
| **Onboarding** | 📄 [parcours-get-started.md](onboarding/parcours-get-started.md) | Découverte de l'offre et récupération dynamique du prix Supabase. |
| **Onboarding** | 📄 [selection-carte-et-livraison.md](onboarding/selection-carte-et-livraison.md) | Choix entre carte NFC physique / digitale et formulaire de livraison. |
| **Paiement** | 📄 [paiement-geniuspay-automatique.md](paiement/paiement-geniuspay-automatique.md) | Flow automatique via Webhook GeniusPay, HMAC & idempotence. |
| **Paiement** | 📄 [paiement-wave-direct-manuel.md](paiement/paiement-wave-direct-manuel.md) | Flow manuel via virement Wave, upload de reçu et revue Admin. |
| **Paiement** | 📄 [suivi-et-masquage-bouton-payer.md](paiement/suivi-et-masquage-bouton-payer.md) | Matrice des statuts et arbre de décision pour le bouton "Payer". |
| **Cartes & Profils** | 📄 [activation-liaison-nfc.md](cartes-et-profils/activation-liaison-nfc.md) | Scan initial d'une carte NFC vierge et association au profil. |
| **Cartes & Profils** | 📄 [edition-profil-link-in-bio.md](cartes-et-profils/edition-profil-link-in-bio.md) | Personnalisation visuelle, thèmes, liens sociaux et dnd-kit. |
| **Cartes & Profils** | 📄 [consultation-visiteur-et-vcard.md](cartes-et-profils/consultation-visiteur-et-vcard.md) | Vue publique par un tiers et téléchargement du vCard .vcf. |
| **Administration** | 📄 [gestion-logistique-commandes.md](administration/gestion-logistique-commandes.md) | Cycle logistique : Préparation ➔ Expédition ➔ Livraison. |
| **Administration** | 📄 [configuration-passerelles-systeme.md](administration/configuration-passerelles-systeme.md) | Modification du tarif de base et bascule ON/OFF des passerelles. |
| **PWA & Offline** | 📄 [pwa-offline-first-et-synchro.md](pwa-et-offline/pwa-offline-first-et-synchro.md) | Mode hors-ligne, stockage local IndexedDB, file d'attente et synchronisation réactive. |
| **PWA & Offline** | 📄 [notifications-push-et-vapid.md](pwa-et-offline/notifications-push-et-vapid.md) | Souscription aux notifications Push VAPID, gestionnaire Service Worker `sw.js` et alertes natives. |
