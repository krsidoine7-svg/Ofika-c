# 📄 Cahier des Charges — V3 : Certifications & Badges Vérifiables

> **Version 3.0 — Attestations, Diplômes & Liens de Preuve Officiels pour Ofika**  
> *Statut : Spécification Prête pour Exécution Antigravity*

---

## 🎯 1. Vision & Objectifs Métier de la V3

La version **V3 - Certifications & Badges Vérifiables** renforce la **crédibilité et la confiance professionnelle** des profils Ofika.  
Elle permet aux utilisateurs d'afficher leurs certifications (Credly, Coursera, Udemy, AWS, Google, Microsoft, Universités) sous forme de **badges interactifs certifiés** redirigeant directement les visiteurs vers la plateforme émettrice officielle pour valider l'authenticité.

### Objectifs clés :
- **Mise en valeur visuelle des réussites** : Badges avec logos d'organismes officiels et icône de certification vérifiée.
- **Accès direct aux preuves d'authenticité** : Clic direct depuis le badge vers le certificat officiel externe.
- **Gestion simplifiée dans le Studio** : Ajout d'une certification par lien d'attestation ou ID de diplôme.

---

## 🛠️ 2. Périmètre Fonctionnel & Composants V3

| Bloc Fonctionnel | Description Détaillée |
| :--- | :--- |
| **1. Badges de Certifications** | Cartes visuelles de certification avec nom du diplôme, organisme émetteur, date d'obtention, et badge de vérification. |
| **2. Liens Directs d'Authenticité** | Redirection 1-clic vers l'URL officielle de vérification (Credly, LinkedIn Learning, Coursera, AWS, etc.). |
| **3. Éditeur de Certifications** | Section d'ajout et de gestion des certifications intégrée au Studio WYSIWYG (`/dashboard/profiles/[id]/studio?tab=certifications`). |

---

## 🔍 3. Analyse d'Impact du Code Base (`Ofika-c-main`)

### 📁 Fichiers Existants à Modifier (`[MODIFY]`)
1. [`lib/types/profile.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/lib/types/profile.ts) : Ajout de l'interface `Certification`.
2. [`app/[username]/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/[username]/page.tsx) : Rendu de la grille/carrousel des badges de certification sur le profil public.
3. [`components/features/profiles/studio/StudioEditorPanel.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/components/features/profiles/studio/StudioEditorPanel.tsx) : Ajout de l'onglet `Certifications`.

### 🆕 Nouveaux Fichiers à Créer (`[NEW]`)
1. `supabase/migrations/20260904_add_certifications_table.sql` : Création de la table `profile_certifications` (`id`, `profile_id`, `title`, `issuer`, `issue_date`, `verification_url`, `badge_image_url`, `display_order`).
2. `components/features/profiles/certifications/CertificationBadgeList.tsx` : Composant d'affichage des badges certifiés avec lien direct.
3. `components/features/profiles/studio/CertificationsManagerTab.tsx` : Formulaire d'ajout/édition dans le Studio.

---

## 🚀 4. Découpage en Étapes Robustes pour Antigravity

---

### 🔹 ÉTAPE 1 : Table Supabase & Types TypeScript (`profile_certifications`)

#### Spécification Technique
1. Créer la migration SQL `supabase/migrations/20260904_add_certifications_table.sql` :
   ```sql
   CREATE TABLE IF NOT EXISTS public.profile_certifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     issuer TEXT NOT NULL,
     issue_date DATE,
     verification_url TEXT NOT NULL,
     badge_image_url TEXT,
     display_order INT DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
2. Définir le type TypeScript `Certification` dans `lib/types/profile.ts`.

#### Critères de Validation & Test Fonctionnel Étape 1
- [x] La table `profile_certifications` est créée dans Supabase avec RLS active.
- [x] Compilation TypeScript validée sans erreur.

---

### 🔹 ÉTAPE 2 : Composant de Rendu Public Badges & Lien Direct (`app/[username]/page.tsx`)

#### Spécification Technique
1. Créer `CertificationBadgeList.tsx` affichant chaque badge sous forme de carte élégante avec coche de vérification.
2. Tout clic sur un badge ouvre l'URL `verification_url` dans un nouvel onglet (`target="_blank" rel="noopener noreferrer"`).

#### Critères de Validation & Test Fonctionnel Étape 2
- [x] Les badges s'affichent correctement sur la page publique `/[username]`.
- [x] Le clic sur un badge redirige bien vers la preuve externe d'authenticité.

---

### 🔹 ÉTAPE 3 : Édition dans le Studio WYSIWYG (`/dashboard/profiles/[id]/studio?tab=certifications`)

#### Spécification Technique
1. Créer `CertificationsManagerTab.tsx` pour ajouter/éditer/supprimer des certifications.
2. Aperçu réactif direct sur le simulateur mobile.

#### Critères de Validation & Test Fonctionnel Étape 3
- [x] L'utilisateur peut saisir l'intitulé, l'émetteur et le lien de vérification.
- [x] Mise à jour en direct de l'aperçu mobile et sauvegarde Supabase fonctionnelle.

---

### 🔹 ÉTAPE 4 : Tests d'Intégration & Métriques de Validation Globales V3

#### Spécification Technique
1. Validation complète du parcours : Ajout certification ➔ Enregistrement ➔ Clic visiteur ➔ Redirection preuve d'authenticité.

#### Critères de Validation & Test Fonctionnel Étape 4
- [x] Aucun lien cassé.
- [x] Redirection 100% opérationnelle.

---

## 📊 5. Métriques Globales de Validation de la V3

1. **Intégrité des URLs** : Validation de format URL valide pour la preuve d'authenticité.
2. **Fluidité Visuelle** : Rendu clair des badges sur mobile et desktop.

---

*Cahier des charges V3 généré pour l'orchestrateur Antigravity — Projet Ofika.*
