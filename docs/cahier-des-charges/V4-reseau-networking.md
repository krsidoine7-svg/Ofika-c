# 📄 Cahier des Charges — V4 : Réseau & Networking

> **Version 4.0 — Capture de Leads, Échange de Contacts & Mini-CRM pour Ofika**  
> *Statut : Spécification Prête pour Exécution Antigravity*

---

## 🎯 1. Vision & Objectifs Métier de la V4

La version **V4 - Réseau & Networking** transforme le profil Ofika en un véritable **outil de conversion et de captation d'opportunités d'affaires**.  
Lors d'une rencontre physique ou d'un scan QR, les interlocuteurs peuvent non seulement enregistrer la vCard du professionnel, mais aussi **transmettre leurs propres coordonnées en 1 clic** via un bouton fixe *"Connecter & Échanger Contact"*.

### Objectifs clés :
- **Conversion réciproque** : Ne plus seulement donner sa carte, mais récupérer les contacts de ses interlocuteurs.
- **Carnet de Contacts CRM intégré** : Centralisation de tous les leads capturés dans le tableau de bord (`/dashboard/contacts`).
- **Export vCard 3.0 & CSV** : Téléchargement rapide des contacts pour intégration dans un smartphone ou un CRM d'entreprise (HubSpot, Salesforce).
- **Analytics de conversion** : Suivi du taux de conversion (Vues ➔ Taps NFC ➔ Contacts capturés).

---

## 🛠️ 2. Périmètre Fonctionnel & Composants V4

| Bloc Fonctionnel | Description Détaillée |
| :--- | :--- |
| **1. Bouton Fixe & Permanent** | Bouton d'action *"Connecter & Échanger Contact"* affiché de manière élégante et accessible sur tout profil public. |
| **2. Modale de Lead Capture** | Formulaire épuré (Nom, Prénom, Téléphone/WhatsApp, Email, Entreprise, Note de rencontre). |
| **3. Carnet de Contacts CRM** | Interface de gestion des contacts dans le Dashboard avec recherche, tags, filtres et export vCard/CSV. |
| **4. Notifications & SMS/Email** | Notification instantanée du propriétaire du profil lorsqu'un nouveau contact est capturé. |

---

## 🔍 3. Analyse d'Impact du Code Base (`Ofika-c-main`)

### 📁 Fichiers Existants à Modifier (`[MODIFY]`)
1. [`app/[username]/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/[username]/page.tsx) : Ajout du bouton fixe *"Connecter & Échanger Contact"* et de la modale de capture.
2. [`app/dashboard/contacts/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/dashboard/contacts/page.tsx) : Amélioration du carnet de leads existant.
3. [`components/AddToContactsAuto.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/components/AddToContactsAuto.tsx) : Intégration du flux réciproque d'échange.

### 🆕 Nouveaux Fichiers à Créer (`[NEW]`)
1. `supabase/migrations/20260905_add_captured_leads_table.sql` : Table `captured_leads` (`id`, `profile_id`, `full_name`, `email`, `phone`, `company`, `notes`, `created_at`).
2. `components/features/contacts/LeadCaptureModal.tsx` : Modale interactive d'échange de contact réciproque.
3. `app/api/contacts/capture/route.ts` : API d'enregistrement des leads et d'envoi de notifications.

---

## 🚀 4. Découpage en Étapes Robustes pour Antigravity

---

### 🔹 ÉTAPE 1 : Table Supabase Leads & API Enregistrement (`captured_leads`)

#### Spécification Technique
1. Migration SQL `supabase/migrations/20260905_add_captured_leads_table.sql` :
   ```sql
   CREATE TABLE IF NOT EXISTS public.captured_leads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
     full_name TEXT NOT NULL,
     phone TEXT,
     email TEXT,
     company TEXT,
     notes TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
2. Route API `POST /api/contacts/capture` validant les champs (Nom, Téléphone ou Email obligatoire) et insérant dans Supabase.

#### Critères de Validation & Test Fonctionnel Étape 1
- [x] Table `captured_leads` fonctionnelle avec RLS.
- [x] Test de la route POST `/api/contacts/capture` avec réponse 201 Created.

---

### 🔹 ÉTAPE 2 : Bouton Fixe & Modale de Lead Capture (`app/[username]/page.tsx`)

#### Spécification Technique
1. Intégrer le composant `LeadCaptureModal.tsx` activé par le bouton fixe *"Connecter & Échanger Contact"*.
2. Validation instantanée avec animation de remerciement et option de télécharger également la vCard de l'hôte.

#### Critères de Validation & Test Fonctionnel Étape 2
- [x] Le bouton fixe est visible et cliquable sur le profil public.
- [x] La modale soumet les coordonnées et affiche la confirmation sans recharger la page.

---

### 🔹 ÉTAPE 3 : Carnet de Contacts & Export CSV/vCard (`/dashboard/contacts`)

#### Spécification Technique
1. Mettre à jour `/dashboard/contacts/page.tsx` pour afficher les leads en temps réel.
2. Bouton "Exporter en CSV" et "Exporter vCard".

#### Critères de Validation & Test Fonctionnel Étape 3
- [x] Les leads capturés apparaissent immédiatement dans le carnet du Dashboard.
- [x] L'export CSV fonctionne parfaitement.

---

### 🔹 ÉTAPE 4 : Tests E2E & Métriques Globales V4

#### Spécification Technique
1. Parcours complet : Remplissage du formulaire par un prospect ➔ Réception instantanée dans le tableau de bord.

#### Critères de Validation & Test Fonctionnel Étape 4
- [x] Flux 100% testé et opérationnel.

---

## 📊 5. Métriques Globales de Validation de la V4

1. **Taux de conversion Lead** : Soumission fluide en < 15 secondes pour le prospect.
2. **Intégrité Données** : Zéro perte de coordonnées prospects.

---

*Cahier des charges V4 généré pour l'orchestrateur Antigravity — Projet Ofika.*
