# 📄 Cahier des Charges — V2 : CV Numérique & Portfolio Interactive

> **Version 2.0 — Parcours Professionnel, Projets, Skills & Export PDF pour Ofika**  
> *Statut : Spécification Prête pour Exécution Antigravity*

---

## 🎯 1. Vision & Objectifs Métier de la V2

La version **V2 - CV Numérique & Portfolio Interactive** enrichit le profil Ofika d'un véritable **CV dynamique, léger et structuré**.  
Elle permet aux professionnels d'exposer leur parcours, leurs réalisations et leurs compétences sous une forme hautement lisible par des humains et immédiatement parsable par des systèmes d'**Intelligence Artificielle (scrapers RH, ATS, assistants IA)**.

### Objectifs clés :
- **Showcase de réalisations** : Portfolio visuel (galeries d'images, vidéos, liens de démo interactifs).
- **Parcours structuré & modulable** : Expériences professionnelles chronologiques, compétences (skills) catégorisées avec niveaux, diplômes et formations.
- **Export PDF dynamique & vCard enrichi** : Génération instantanée d'un CV au format PDF prêt à imprimer ou transmettre.
- **Indexation IA & Schema.org JSON-LD** : Balisage de données structurées conforme aux standards du W3C (`Person` / `Occupation` / `Resume`) pour garantir une extraction instantanée par l'IA.

---

## 🛠️ 2. Périmètre Fonctionnel & Composants V2

| Bloc Fonctionnel | Description Détaillée |
| :--- | :--- |
| **1. Expériences Professionnelles** | Intitulé du poste, entreprise/organisation, dates (début/fin/en cours), description des réalisations, compétences clés associées. |
| **2. Portfolio & Projets** | Fiches projets enrichies : titre, description, image de couverture/galerie, tags technologies, liens de démo en direct, rôle joué. |
| **3. Compétences & Badges Skills** | Badges de compétences classées par catégories (Technique, Soft skills, Langues), niveau d'expertise (Debutant, Intermédiaire, Expert). |
| **4. Formations & Certifications** | Diplômes, certifications, institutions, années d'obtention, mentions. |
| **5. Export PDF & Structuration IA** | Bouton "Télécharger le CV PDF" instantané côté client, injection automatique du script `<script type="application/ld+json">` pour la lisibilité par les IA. |

---

## 🔍 3. Analyse d'Impact du Code Base (`Ofika-c-main`)

### 📁 Fichiers Existants à Modifier (`[MODIFY]`)
1. [`lib/types/profile.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/lib/types/profile.ts) : Ajout des interfaces TypeScript `Experience`, `Project`, `Skill`, `Education`.
2. [`app/[username]/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/[username]/page.tsx) : Intégration des sections publiques CV/Portfolio et de la balise JSON-LD.
3. [`components/features/profiles/studio/StudioEditorPanel.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/components/features/profiles/studio/StudioEditorPanel.tsx) : Ajout de l'onglet `CV & Portfolio`.
4. [`lib/services/public-profile.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/lib/services/public-profile.ts) : Requêtes jointes pour récupérer le CV lors du chargement d'un profil.

### 🆕 Nouveaux Fichiers à Créer (`[NEW]`)
1. `supabase/migrations/20260903_add_cv_tables.sql` : Création des tables relationnelles (`profile_experiences`, `profile_projects`, `profile_skills`, `profile_education`) avec RLS.
2. `components/features/profiles/cv/ExperienceList.tsx` : Composant d'affichage de la chronologie professionnelle.
3. `components/features/profiles/cv/PortfolioGallery.tsx` : Galerie interactive des projets avec modale de détails.
4. `components/features/profiles/cv/PdfExportButton.tsx` : Composant de génération et téléchargement de CV PDF.
5. `components/features/profiles/studio/CvManagerTab.tsx` : Formulaire d'édition et réorganisation drag-and-drop (`@dnd-kit`) dans le Studio.
6. `lib/utils/json-ld-generator.ts` : Générateur de microdonnées Schema.org pour l'IA.

---

## 🚀 4. Découpage en Étapes Robustes pour Antigravity

---

### 🔹 ÉTAPE 1 : Base de Données Supabase & Types TypeScript (CV & Schema.org)

#### Spécification Technique
1. Créer la migration SQL `supabase/migrations/20260903_add_cv_tables.sql` :
   - Table `profile_experiences` (`id`, `profile_id`, `company`, `role`, `start_date`, `end_date`, `is_current`, `description`, `display_order`).
   - Table `profile_projects` (`id`, `profile_id`, `title`, `description`, `image_url`, `project_url`, `tags`, `display_order`).
   - Table `profile_skills` (`id`, `profile_id`, `name`, `category`, `level`, `display_order`).
   - Table `profile_education` (`id`, `profile_id`, `institution`, `degree`, `start_year`, `end_year`, `display_order`).
   - Politiques RLS : Lecture publique (`SELECT true`), écriture restreinte au propriétaire du profil (`auth.uid() = profile_user_id`).
2. Définir les types TypeScript correspondants dans `lib/types/profile.ts`.
3. Créer le module `lib/utils/json-ld-generator.ts` générant un objet JSON-LD `Person` / `Resume` conforme W3C.

#### Critères de Validation & Test Fonctionnel Étape 1
- [x] Les 4 tables existent dans Supabase avec les contraintes d'intégrité et clés étrangères vers `profiles.id`.
- [x] Le générateur JSON-LD produit une chaîne JSON valide testable sur l'outil *Google Rich Results Test*.
- [x] Aucune erreur de compilation TypeScript.

---

### 🔹 ÉTAPE 2 : Composants de Rendu Public CV & Portfolio (`app/[username]/page.tsx`)

#### Spécification Technique
1. Créer le composant `PortfolioGallery.tsx` pour afficher les cartes de projets avec effet hover, filtres par tags et modale d'agrandissement.
2. Créer le composant `ExperienceList.tsx` affichant une ligne du temps moderne des expériences et formations.
3. Intégrer la balise `<script type="application/ld+json">` dans `app/[username]/page.tsx`.
4. Rendre l'affichage de ces blocs conditionnel (masquer les sections vides).

#### Critères de Validation & Test Fonctionnel Étape 2
- [x] La page publique `http://localhost:3000/[username]` affiche la timeline des expériences et la galerie de projets.
- [x] Le clic sur un projet ouvre la vue détaillée avec lien de démo.
- [x] Le code source de la page publique contient les microdonnées JSON-LD lisibles par les IA.

---

### 🔹 ÉTAPE 3 : Éditeur WYSIWYG CV (`/dashboard/profiles/[id]/studio?tab=cv`)

#### Spécification Technique
1. Créer le composant `CvManagerTab.tsx` intégré dans le Studio WYSIWYG (`/dashboard/profiles/[id]/studio`).
2. Implémenter les sous-onglets : `Expériences`, `Projets`, `Compétences`, `Formations`.
3. Permettre le réordonnancement par glisser-déplacer (`@dnd-kit/sortable`).
4. Permettre l'ajout, l'édition et la suppression en direct avec mise à jour immédiate du simulateur mobile à droite.

#### Critères de Validation & Test Fonctionnel Étape 3
- [x] L'utilisateur peut ajouter une expérience ou un projet depuis le Studio.
- [x] L'aperçu smartphone se met à jour en temps réel lors de la saisie d'un nouveau projet.
- [x] Le glisser-déplacer réorganise immédiatement l'ordre des éléments sur l'aperçu mobile et en base de données.

---

### 🔹 ÉTAPE 4 : Export PDF Instantané & Flux Utilisateur Complet

#### Spécification Technique
1. Créer le composant `PdfExportButton.tsx` (utilisant `html2pdf.js` ou `@react-pdf/renderer`) permettant au visiteur de télécharger une version PDF propre et professionnelle du CV.
2. Ajouter le bouton "Télécharger mon CV PDF" sur la page publique et dans le Studio.
3. Tester le flux complet : Création d'expériences ➔ Consultation publique ➔ Téléchargement PDF.

#### Critères de Validation & Test Fonctionnel Étape 4
- [x] Le clic sur "Télécharger mon CV PDF" génère et télécharge un fichier `.pdf` propre et lisible en < 2 secondes.
- [x] Flux utilisateur complet 100% fonctionnel sans erreur en console.

---

## 📊 5. Métriques Globales de Validation de la V2

Avant de valider la version V2 et de passer à la **V3 (Certifications & Badges)** :

1. **Format IA Valide** : Les données du CV sont immédiatement lisibles par les bots IA via le schéma JSON-LD.
2. **Qualité d'Export PDF** : Le PDF généré ne présente aucun chevauchement de texte ni coupure de page disgracieuse.
3. **Réactivité Studio** : Ajout et suppression d'éléments de CV ultra-rapides (< 100ms dans le simulateur).

---

*Cahier des charges V2 généré pour l'orchestrateur Antigravity — Projet Ofika.*
