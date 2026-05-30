# 📊 MCD - MODÈLE CONCEPTUEL DE DONNÉES

## Vue d'ensemble
Modèle conceptuel de données pour le système de cartes de visite NFC/QR avec Supabase.

## Diagramme MCD Visuel

```mermaid
erDiagram
    USER {
        string id PK "Identifiant unique"
        string email UK "Email unique"
        timestamp email_verified "Date de vérification email"
        string phone "Numéro de téléphone"
        string name "Nom complet"
        string image "URL de l'image de profil"
        string preferred_language "Langue préférée (défaut: fr)"
        string subscription_tier "Niveau d'abonnement (défaut: free)"
        integer cards_ordered "Nombre de cartes commandées"
        boolean is_active "Compte actif (défaut: true)"
        timestamp last_login "Dernière connexion"
        timestamp created_at "Date de création"
        timestamp updated_at "Date de mise à jour"
    }

    PROFILE {
        string id PK "Identifiant unique"
        string user_id FK "Référence utilisateur"
        string profile_type "Type: professional, personal, event"
        string name "Nom du profil"
        string bio "Biographie (max 100 caractères)"
        string image_url "URL de l'image"
        string custom_url UK "URL personnalisée unique"
        string username UK "Nom d'utilisateur unique"
        boolean is_public "Profil public (défaut: true)"
        boolean is_active "Profil actif (défaut: true)"
        timestamp created_at "Date de création"
        timestamp updated_at "Date de mise à jour"
    }

    LINK {
        string id PK "Identifiant unique"
        string profile_id FK "Référence profil"
        string title "Titre du lien (max 30 caractères)"
        string url "URL du lien"
        integer position "Position (1 ou 2, max 2 liens)"
        integer click_count "Nombre de clics"
        boolean is_active "Lien actif (défaut: true)"
        timestamp created_at "Date de création"
        timestamp updated_at "Date de mise à jour"
    }

    CARD {
        string id PK "Identifiant unique"
        string user_id FK "Référence utilisateur"
        string profile_id FK "Référence profil"
        string card_type "Type: nfc_qr, qr_only"
        string unique_code UK "Code unique de la carte"
        boolean is_activated "Carte activée (défaut: false)"
        integer tap_count "Nombre de scans/taps"
        timestamp created_at "Date de création"
        timestamp updated_at "Date de mise à jour"
    }

    CARD_DESIGN {
        string id PK "Identifiant unique"
        string card_id FK "Référence carte"
        jsonb front_design "Design de la face"
        jsonb back_design "Design du dos"
        string qr_code_url "URL du QR code"
        string nfc_data "Données NFC"
        timestamp created_at "Date de création"
    }

    ORDER {
        string id PK "Identifiant unique"
        string user_id FK "Référence utilisateur"
        string profile_id FK "Référence profil"
        string card_type "Type de carte commandée"
        integer quantity "Quantité (défaut: 1)"
        decimal unit_price "Prix unitaire"
        decimal total_price "Prix total"
        string currency "Devise (défaut: XOF)"
        string status "Statut: pending, paid, failed, cancelled"
        string lygos_payment_id "ID de paiement Lygos"
        string lygos_payment_url "URL de paiement Lygos"
        timestamp created_at "Date de création"
        timestamp updated_at "Date de mise à jour"
    }

    PAYMENT_METHOD {
        string id PK "Identifiant unique"
        string name "Nom de la méthode"
        string provider "Fournisseur (orange, mtn, moov, lygos)"
        boolean is_active "Méthode active (défaut: true)"
        string icon_url "URL de l'icône"
        timestamp created_at "Date de création"
    }

    ANALYTICS_EVENT {
        string id PK "Identifiant unique"
        string user_id FK "Référence utilisateur (optionnel)"
        string profile_id FK "Référence profil (optionnel)"
        string event_type "Type d'événement"
        jsonb event_data "Données de l'événement"
        string user_agent "User agent du navigateur"
        string device_type "Type d'appareil"
        timestamp created_at "Date de création"
    }

    DASHBOARD_WIDGET {
        string id PK "Identifiant unique"
        string user_id FK "Référence utilisateur"
        string widget_type "Type de widget"
        integer position "Position du widget"
        boolean is_visible "Widget visible (défaut: true)"
        jsonb config "Configuration du widget"
        timestamp created_at "Date de création"
    }

    %% Relations
    USER ||--o{ PROFILE : "possède"
    USER ||--o{ CARD : "possède"
    USER ||--o{ ORDER : "passe"
    USER ||--o{ ANALYTICS_EVENT : "génère"
    USER ||--o{ DASHBOARD_WIDGET : "configure"

    PROFILE ||--o{ LINK : "contient"
    PROFILE ||--o{ CARD : "associé_à"
    PROFILE ||--o{ ORDER : "pour"
    PROFILE ||--o{ ANALYTICS_EVENT : "génère"

    CARD ||--o| CARD_DESIGN : "a_un_design"

    ORDER ||--o{ PAYMENT_METHOD : "utilise"
```

## Diagramme de Relations Simplifié

```mermaid
graph TD
    A[USER] -->|1:N| B[PROFILE]
    A -->|1:N| C[CARD]
    A -->|1:N| D[ORDER]
    A -->|1:N| E[ANALYTICS_EVENT]
    A -->|1:N| F[DASHBOARD_WIDGET]
    
    B -->|1:N| G[LINK]
    B -->|1:N| C
    B -->|1:N| D
    B -->|1:N| E
    
    C -->|1:1| H[CARD_DESIGN]
    
    D -->|N:1| I[PAYMENT_METHOD]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
    style G fill:#e0f2f1
    style H fill:#fff8e1
    style I fill:#e3f2fd
```

## Architecture des Données

```mermaid
graph LR
    subgraph "Couche Présentation"
        A[Next.js App]
        B[Components React]
        C[Pages]
    end
    
    subgraph "Couche Logique"
        D[Hooks Custom]
        E[Services Supabase]
        F[Types TypeScript]
    end
    
    subgraph "Couche Données"
        G[Supabase PostgreSQL]
        H[Tables]
        I[RLS Policies]
        J[Functions & Triggers]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    E --> G
    G --> H
    H --> I
    H --> J
    
    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style C fill:#e3f2fd
    style D fill:#f3e5f5
    style E fill:#f3e5f5
    style F fill:#f3e5f5
    style G fill:#e8f5e8
    style H fill:#e8f5e8
    style I fill:#e8f5e8
    style J fill:#e8f5e8
```

## Description des Entités

### 1. USER (Utilisateur)
**Rôle** : Utilisateur principal du système
**Contraintes** : 
- Email unique
- Maximum 3 profils par utilisateur
- Maximum 2 cartes par utilisateur
**Relations** : 1:N avec Profile, Card, Order, AnalyticsEvent, DashboardWidget

### 2. PROFILE (Profil)
**Rôle** : Profils professionnels/personnels/événements
**Contraintes** :
- Maximum 2 liens par profil
- URL personnalisée unique
- Username unique
**Relations** : N:1 avec User, 1:N avec Link, Card, Order, AnalyticsEvent

### 3. LINK (Lien)
**Rôle** : Liens sociaux et web des profils
**Contraintes** :
- Maximum 2 liens par profil
- Titre limité à 30 caractères
**Relations** : N:1 avec Profile

### 4. CARD (Carte)
**Rôle** : Cartes NFC/QR physiques
**Contraintes** :
- Code unique généré automatiquement
- Maximum 2 cartes par utilisateur
**Relations** : N:1 avec User et Profile, 1:1 avec CardDesign

### 5. CARD_DESIGN (Design de Carte)
**Rôle** : Design personnalisé des cartes
**Contraintes** : Un design par carte
**Relations** : 1:1 avec Card

### 6. ORDER (Commande)
**Rôle** : Commandes de cartes physiques
**Contraintes** : Prix en XOF par défaut
**Relations** : N:1 avec User et Profile

### 7. PAYMENT_METHOD (Méthode de Paiement)
**Rôle** : Méthodes de paiement disponibles
**Contraintes** : Méthodes spécifiques à l'Afrique (Orange Money, MTN, etc.)
**Relations** : 1:N avec Order

### 8. ANALYTICS_EVENT (Événement Analytics)
**Rôle** : Suivi des interactions et statistiques
**Contraintes** : Données JSON flexibles
**Relations** : N:1 avec User et Profile (optionnels)

### 9. DASHBOARD_WIDGET (Widget Dashboard)
**Rôle** : Widgets personnalisables du dashboard
**Contraintes** : Configuration JSON flexible
**Relations** : N:1 avec User

## Règles de Gestion

### Contraintes Métier
1. **Un utilisateur** peut avoir **maximum 3 profils**
2. **Un profil** peut avoir **maximum 2 liens**
3. **Un utilisateur** peut avoir **maximum 2 cartes**
4. **Les profils publics** sont visibles par tous
5. **Les cartes** sont liées à un utilisateur ET un profil
6. **Les commandes** sont liées à un utilisateur ET un profil

### Génération Automatique
1. **Codes uniques** pour les cartes (format: OFK-XXXXXXXX)
2. **URLs personnalisées** basées sur le nom du profil
3. **Timestamps** de création et mise à jour automatiques

### Sécurité
1. **RLS activé** sur toutes les tables
2. **Politiques** basées sur l'authentification utilisateur
3. **Profils publics** accessibles sans authentification

## Types de Données

### Types Primitifs
- `string` : Texte
- `integer` : Nombre entier
- `decimal` : Nombre décimal
- `boolean` : Vrai/Faux
- `timestamp` : Date et heure
- `jsonb` : Données JSON binaires

### Types Spéciaux
- `PK` : Clé primaire
- `FK` : Clé étrangère
- `UK` : Clé unique

## Index et Performance

### Index Principaux
- `users_email_key` : Index unique sur email
- `profiles_custom_url_key` : Index unique sur custom_url
- `profiles_username_key` : Index unique sur username
- `cards_unique_code_key` : Index unique sur unique_code

### Index de Performance
- `idx_profiles_user_active` : (user_id, is_active)
- `idx_profiles_custom_url` : custom_url WHERE is_active = true
- `idx_links_profile_active` : (profile_id, is_active)
- `idx_cards_user` : user_id
- `idx_analytics_profile_date` : (profile_id, created_at)

## Politiques RLS (Row Level Security)

### Tables avec RLS
- `users` : Données utilisateur privées
- `profiles` : Profils publics/privés
- `links` : Liens des profils
- `cards` : Cartes utilisateur
- `card_designs` : Designs des cartes
- `orders` : Commandes utilisateur
- `analytics_events` : Événements analytics
- `dashboard_widgets` : Widgets dashboard

### Règles d'Accès
1. **Utilisateurs** : Accès uniquement à leurs propres données
2. **Profils publics** : Accessibles par tous les utilisateurs
3. **Profils privés** : Accessibles uniquement par le propriétaire
4. **Cartes** : Accessibles uniquement par le propriétaire
5. **Analytics** : Insertion libre, lecture restreinte au propriétaire

---

**Date de création** : $(date)
**Version** : 1.0
**Statut** : Actif
**Base de données** : Supabase PostgreSQL
