# Guide du Flux d'Onboarding NFC Ofika (Option B)

---

## 📝 Résumé de l'Onboarding

Ce document détaille le parcours d'activation des cartes NFC Ofika (Option B - Inscription à la toute fin). L'utilisateur configure entièrement son profil et sa carte de manière anonyme, ses choix sont conservés de manière résiliente (via la base de données temporaire et le stockage local), et son compte Ofika est créé à la dernière étape, déclenchant automatiquement la création et l'association de son profil et de sa carte numérique. Le parcours complet prend en moyenne **2 minutes et 40 secondes**.

---

## 🗺️ Diagramme du Parcours Utilisateur (Mermaid)

Le diagramme suivant montre la progression de l'utilisateur à travers les 6 étapes de l'onboarding :

```mermaid
graph TD
    A[Étape 1 : Bienvenue / Intro] -->|Commencer - 10s| B[Étape 2 : Vos Coordonnées]
    B -->|Suivant - 45s| C[Étape 3 : Personnalisation Design]
    C -->|Suivant - 30s| D[Étape 4 : Profil Digital & Lien Ofika]
    D -->|< Retour - Permet de corriger| C
    D -->|Activer ma carte - 45s| E[Étape 5 : Inscription & Mot de Passe]
    E -->|Créer mon compte - 20s| F[Étape 6 : Activation Réussie & Confettis]
    F -->|10s| G[Accès direct au Dashboard Ofika]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#ff9,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 🔄 Flux des Données et Architecture (Mermaid)

Le schéma ci-dessous illustre la communication entre le navigateur de l'utilisateur (Client), le serveur Next.js (API Routes) et la base de données (Supabase) :

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilisateur (Client)
    participant API as Serveur Next.js (API)
    participant DB as Supabase DB

    Note over User: Étape 2 à 4 (Anonyme)
    User->>API: POST /api/onboarding/save-temp (session_id, données, étape)
    API->>DB: INSERT/UPDATE public.pending_creations (payload, step_completed)
    DB-->>API: Statut OK
    API-->>User: Sauvegarde temporaire réussie (200)

    Note over User: Étape 5 (Création Compte)
    User->>DB: Supabase Auth: signUp(email, password)
    DB-->>User: Compte créé + Jeton Session (JWT)

    Note over User: Étape 6 (Finalisation)
    User->>API: POST /api/onboarding/finalize (session_id, authentifié)
    API->>DB: SELECT * FROM pending_creations WHERE session_id
    DB-->>API: Renvoie le payload temporaire
    API->>DB: INSERT INTO public.profiles (name, bio, user_id...)
    API->>DB: INSERT INTO public.digital_nfc_cards (nfc_link, user_id...)
    API->>DB: DELETE FROM pending_creations WHERE session_id
    DB-->>API: Succès écritures finales
    API-->>User: Onboarding activé avec succès !
```

---

## 🏃 Le Parcours Utilisateur : Étape par Étape

### 🏁 Étape 1 : L'Accueil (Intro)
* **Ce que voit l'utilisateur** : Une page de bienvenue moderne présentant la carte NFC Ofika.
* **Utilité** : Expliquer simplement l'activation.
* **Temps estimé** : **10 secondes**.

### 📝 Étape 2 : Vos Coordonnées (Formulaire)
* **Ce que voit l'utilisateur** : Saisie du Nom Complet, E-mail, Téléphone, Entreprise, Poste, et acceptation des conditions d'utilisation.
* **Utilité** : Identité de base. Les données sont sauvegardées en base au fur et à mesure pour la résilience.
* **Temps estimé** : **45 secondes**.

### 🎨 Étape 3 : Le Design de votre Carte (Personnalisation)
* **Ce que voit l'utilisateur** : Sélecteur de styles (Classic, Grid, Creative, Showcase, E-commerce, Freelance, Dark) et de couleurs pour la carte physique.
* **Utilité** : Rendre la carte unique et à l'image de son entreprise.
* **Temps estimé** : **30 secondes**.

### 🎴 Étape 4 : Configuration du Profil Digital
* **Ce que voit l'utilisateur** : Choix du nom d'affichage, biographie et lien Ofika unique (ex: `ofika.ci/toto`).
* **Bouton de retour** : Permet de revenir à l'étape précédente sans rien effacer.
* **Bouton final** : "Activer ma carte" qui redirige vers l'inscription.
* **Temps estimé** : **45 secondes**.

### 🔒 Étape 5 : Création sécurisée du compte (Inscription)
* **Ce que voit l'utilisateur** : Saisie du mot de passe pour le compte.
* **Utilité** : Sécuriser son espace. L'appui sur le bouton crée le compte et applique tous les choix temporaires en base de données.
* **Temps estimé** : **20 secondes**.

### 🎉 Étape 6 : Activation réussie ! (Succès)
* **Ce que voit l'utilisateur** : Écran festif confirmant l'activation de la carte et du profil, avec un bouton vers le tableau de bord.
* **Temps estimé** : **10 secondes**.

---

## 📋 Plan d'Implantation Technique

### 1. Structure de la Base de Données (Supabase)
Pendant le parcours de l'utilisateur anonyme, ses sélections sont écrites temporairement dans la table `pending_creations` :
* Colonne `session_id` : Identifiant de session stocké localement.
* Colonne `type` : `'nfc'` pour différencier les flux.
* Colonne `step_completed` : Dernière étape franchie (de 1 à 4).
* Colonne `payload` : Objet JSON contenant les données temporaires de saisie.

Après l'inscription (Étape 5), la route API `/api/onboarding/finalize` effectue les écritures réelles :
* Crée le profil final dans la table `profiles`.
* Crée la carte NFC dans la table `digital_nfc_cards` associée au profil.
* Supprime la session temporaire de `pending_creations`.

### 2. Politiques RLS (Row Level Security) Requises
Les politiques suivantes doivent être présentes en base de données pour permettre la persistance :
* **INSERT** : Autoriser le public si `session_id IS NOT NULL`.
* **SELECT** : Autoriser le public si `session_id IS NOT NULL`.
* **UPDATE** : Autoriser le public si `session_id IS NOT NULL`.
* **DELETE** : Autoriser le public si `session_id IS NOT NULL`.
