# 📄 Cahier des Charges — V6 : AI Assistant & Importateur de CV

> **Version 6.0 — Parsing Automatique de CV (PDF/Docx) via IA pour Remplissage 1-Clic d'Ofika**  
> *Statut : Spécification Prête pour Exécution Antigravity*

---

## 🎯 1. Vision & Objectifs Métier de la V6

La version **V6 - AI Assistant & Importateur de CV** supprime la corvée de saisie manuelle lors de la création d'un profil Ofika.  
L'utilisateur glisse simplement son fichier CV (PDF, DOCX ou texte brut), et l'**IA d'Ofika extrait, structure et remplit automatiquement** l'ensemble des champs : nom, titre, bio, expériences, projets, compétences et formations.

### Objectifs clés :
- **Onboarding ultra-rapide (< 10 secondes)** : Importation d'un CV PDF ➔ Profil 100% complété automatiquement.
- **Analyse intelligente du texte** : Extraction précise des dates, entreprises, projets et badges de compétences.
- **Intégration transparente dans le Studio** : Bouton *"Importateur de CV par IA"* dans le Studio WYSIWYG.

---

## 🛠️ 2. Périmètre Fonctionnel & Composants V6

| Bloc Fonctionnel | Description Détaillée |
| :--- | :--- |
| **1. Zone Drag-and-Drop de CV** | Zone de dépôt de fichier PDF/DOCX avec barre de progression de l'analyse IA. |
| **2. API de Parsing IA** | Endpoint API Next.js `/api/ai/parse-cv` utilisant Gemini Flash API pour extraire les entités JSON structurées. |
| **3. Prévisualisation & Validation** | Modale de révision des données extraites avant l'injection automatique dans les tables Supabase. |

---

## 🔍 3. Analyse d'Impact du Code Base (`Ofika-c-main`)

### 📁 Fichiers Existants à Modifier (`[MODIFY]`)
1. [`components/features/profiles/studio/StudioEditorPanel.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/components/features/profiles/studio/StudioEditorPanel.tsx) : Ajout du bouton *"Importer mon CV par IA"*.
2. [`app/onboarding/public-page/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/onboarding/public-page/page.tsx) : Intégration de l'option d'onboarding par import de CV.

### 🆕 Nouveaux Fichiers à Créer (`[NEW]`)
1. `app/api/ai/parse-cv/route.ts` : API d'extraction de texte et de structuration JSON via Gemini.
2. `components/features/ai/CvImportModal.tsx` : Modale d'import et de prévisualisation des données extraites.
3. `lib/services/ai-parser.service.ts` : Service d'interaction avec le modèle d'IA.

---

## 🚀 4. Découpage en Étapes Robustes pour Antigravity

---

### 🔹 ÉTAPE 1 : Service & API Next.js de Parsing IA (`/api/ai/parse-cv`)

#### Spécification Technique
1. Implémenter `app/api/ai/parse-cv/route.ts` recevant le fichier PDF ou le texte brut.
2. Appeler l'API Gemini avec le schéma JSON strict (Nom, Bio, Expériences, Projets, Skills).

#### Critères de Validation & Test Fonctionnel Étape 1
- [x] L'API extrait un objet JSON structuré et valide à partir d'un exemple de CV PDF.

---

### 🔹 ÉTAPE 2 : Modale d'Import & Prévisualisation (`CvImportModal.tsx`)

#### Spécification Technique
1. Composant UI avec Dépôt PDF ➔ Animation de scan IA ➔ Grille de vérification des éléments trouvés ➔ Bouton "Appliquer à mon profil".

#### Critères de Validation & Test Fonctionnel Étape 2
- [x] L'utilisateur dépose son CV PDF et voit les données extraites en 3 secondes.

---

### 🔹 ÉTAPE 3 : Injection dans le Studio WYSIWYG & Supabase

#### Spécification Technique
1. Clic sur "Appliquer" enregistre directement les données dans `profiles`, `profile_experiences`, `profile_projects`, et `profile_skills`.
2. Mise à jour instantanée du simulateur mobile.

#### Critères de Validation & Test Fonctionnel Étape 3
- [x] L'ensemble du profil est rempli sans aucune saisie manuelle.

---

### 🔹 ÉTAPE 4 : Tests E2E & Métriques Globales V6

#### Critères de Validation & Test Fonctionnel Étape 4
- [x] Parcours d'import 100% fluide et validé.

---

## 📊 5. Métriques Globales de Validation de la V6

1. **Précision d'Extraction** : > 90% des champs correctement identifiés.
2. **Temps de Traitement** : Analyse complète du CV en < 5 secondes.

---

*Cahier des charges V6 généré pour l'orchestrateur Antigravity — Projet Ofika.*
