# 📄 Cahier des Charges — V5 : Vérification d'Identité & Confiance

> **Version 5.0 — Badges Certifiés, Vérification Entreprise (RCCM/IFU) & Modération Admin pour Ofika**  
> *Statut : Spécification Prête pour Exécution Antigravity*

---

## 🎯 1. Vision & Objectifs Métier de la V5

La version **V5 - Vérification d'Identité & Confiance** introduit un **système de certification de confiance** pour éliminer l'usurpation d'identité et rassurer les partenaires d'affaires.  
Elle octroie des **badges de vérification (Coche bleue / Badge Entreprise Certifiée)** aux profils dont l'identité personnelle (Email, Téléphone OTP) et/ou professionnelle (N° RCCM / IFU d'entreprise) a été vérifiée et validée.

### Objectifs clés :
- **Badge "Profil Vérifié par Ofika"** : Badge de confiance visuel avec coche bleue sur la photo de profil et l'en-tête.
- **Vérification Entreprise Locale** : Soumission des justificatifs d'entreprise (RCCM, IFU en Côte d'Ivoire / Afrique de l'Ouest).
- **Module Admin de Modération** : Interface d'administration pour valider ou rejeter les demandes de certification (`/dashboard/admin/verification-requests`).

---

## 🛠️ 2. Périmètre Fonctionnel & Composants V5

| Bloc Fonctionnel | Description Détaillée |
| :--- | :--- |
| **1. Coche Bleue & Badge Certifié** | Affiche un badge interactif "Profil Vérifié" sur le profil public avec tooltip explicatif. |
| **2. Demande de Vérification User** | Formulaire d'envoi des pièces justificatives dans le Dashboard (`/dashboard/profiles/[id]/verify`). |
| **3. Back-Office Admin Modération** | Tableau de bord administrateur (`/dashboard/admin/verification-requests`) permettant aux administrateurs d'approuver ou refuser les demandes avec motif. |

---

## 🔍 3. Analyse d'Impact du Code Base (`Ofika-c-main`)

### 📁 Fichiers Existants à Modifier (`[MODIFY]`)
1. [`lib/types/profile.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/lib/types/profile.ts) : Ajout du champ `is_verified` (boolean) et `verification_status` ('none' | 'pending' | 'verified' | 'rejected').
2. [`app/[username]/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/[username]/page.tsx) : Affichage du badge de vérification à côté du nom du profil.
3. [`app/dashboard/admin/moderation/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/dashboard/admin/moderation/page.tsx) : Intégration de l'onglet de modération des demandes de vérification d'identité.

### 🆕 Nouveaux Fichiers à Créer (`[NEW]`)
1. `supabase/migrations/20260906_add_identity_verification_tables.sql` : Ajout de la table `identity_verification_requests` (`id`, `profile_id`, `document_url`, `status`, `rejection_reason`, `created_at`).
2. `components/features/verification/VerificationBadge.tsx` : Composant visuel de la coche bleue avec tooltip.
3. `app/dashboard/profiles/[id]/verify/page.tsx` : Page utilisateur de soumission de demande de vérification.

---

## 🚀 4. Découpage en Étapes Robustes pour Antigravity

---

### 🔹 ÉTAPE 1 : Migration SQL Supabase & Colonne `is_verified`

#### Spécification Technique
1. Migration SQL `supabase/migrations/20260906_add_identity_verification_tables.sql` :
   ```sql
   ALTER TABLE public.profiles 
   ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
   ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none';

   CREATE TABLE IF NOT EXISTS public.identity_verification_requests (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
     company_name TEXT,
     registration_number TEXT, -- RCCM / IFU
     document_url TEXT NOT NULL,
     status TEXT DEFAULT 'pending',
     rejection_reason TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

#### Critères de Validation & Test Fonctionnel Étape 1
- [x] Colonne `is_verified` présente en BDD et requêtes API fonctionnelles.

---

### 🔹 ÉTAPE 2 : Composant Visuel Badge de Confiance (`app/[username]/page.tsx`)

#### Spécification Technique
1. Créer `VerificationBadge.tsx` affichant la coche bleu/orange officielle de vérification avec tooltip.

#### Critères de Validation & Test Fonctionnel Étape 2
- [x] Si `is_verified === true`, le badge s'affiche fièrement sur le profil public.

---

### 🔹 ÉTAPE 3 : Formulaire Utilisateur & Dashboard Admin (`/dashboard/admin/moderation`)

#### Spécification Technique
1. Page utilisateur `/dashboard/profiles/[id]/verify` pour uploader un justificatif.
2. Vue Admin pour cliquer "Valider" (passe `is_verified = true`) ou "Refuser".

#### Critères de Validation & Test Fonctionnel Étape 3
- [x] Soumission de demande côté client ➔ Notification Admin ➔ Validation Admin ➔ Badge immédiatement visible sur le profil public.

---

### 🔹 ÉTAPE 4 : Tests E2E & Métriques Globales V5

#### Critères de Validation & Test Fonctionnel Étape 4
- [x] Flux E2E de soumission et modération 100% validé.

---

## 📊 5. Métriques Globales de Validation de la V5

1. **Sécurité & Confidentialité** : Documents d'identité hébergés dans un bucket Supabase Storage privé avec RLS restreint aux Admins.
2. **Affichage instantané** : Coche bleue s'affichant immédiatement sans impacter la vitesse de chargement.

---

*Cahier des charges V5 généré pour l'orchestrateur Antigravity — Projet Ofika.*
