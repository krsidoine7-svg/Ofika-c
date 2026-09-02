# 📄 Cahier des Charges — V1 : Identité Visuelle Professionnelle

> **Version 1.0 — Studio WYSIWYG & Customisation Visuelle Complète pour Ofika**  
> *Statut : Spécification Prête pour Exécution Antigravity*

---

## 🎯 1. Vision & Objectifs Métier de la V1

La version **V1 - Identité Visuelle Professionnelle** transforme Ofika en une plateforme de personnalisation visuelle haut de gamme.  
Elle permet à chaque utilisateur (créatif, indépendant, entreprise, exécutif) d'exprimer pleinement son image de marque à travers un **profil numérique sur-mesure**, partageable instantanément via **carte NFC** et **QR Code**.

### Objectifs clés :
- **Liberté créative totale** : Palette de couleurs, dégradés, glassmorphism, typographies Google Fonts, forme de photo de profil et bannière photo/vidéo HD.
- **Kit de Marque Entreprise (Brand Kit)** : Import du logo officiel, boutons personnalisés stylisés, badges de rôle/titre.
- **Studio WYSIWYG en temps réel** : Un espace de création dédié (`/dashboard/profiles/[id]/studio`) avec panneau latéral de contrôle et simulateur smartphone interactif.
- **Zéro friction & Rendu instantané** : Chargement des profils publics `< 1 sec` sur mobile.

---

## 🛠️ 2. Périmètre Fonctionnel & Composants V1

| Bloc Fonctionnel | Description Détaillée |
| :--- | :--- |
| **1. En-tête & Médias HD** | Bannière d'en-tête (Photo HD, vidéo de fond looping, dégradé), Avatar personnalisé (Rond, Carré arrondi, Hexagone, Badge avec contour lumineux), Badges de rôle/titre. |
| **2. Palette de Couleurs & Fonds** | Sélecteur de couleurs primaires/secondaires/accent, modes sombre/clair/glassmorphism, dégradés dynamiques et motifs d'arrière-plan (grid, dots, mesh). |
| **3. Typographie & Styles Textes** | Intégration Google Fonts (Inter, Poppins, Outfit, Plus Jakarta Sans, Playfair Display), ajustement des tailles, hauteurs de ligne et contrastes accessibles (WCAG). |
| **4. Kit de Marque (Brand Kit)** | Logo d'entreprise en watermark/en-tête, formes de boutons (arrondis, pill, néon, flat), effets au survol (hover animations). |
| **5. Studio WYSIWYG Unifié** | Interface studio responsive à `/dashboard/profiles/[id]/studio` avec miroir smartphone temps réel et enregistrement automatique/manuel. |

---

## 🔍 3. Analyse d'Impact du Code Base (`Ofika-c-main`)

Cette analyse recense précisément l'impact sur l'existant avant toute modification de code.

### 📁 Fichiers Existants à Modifier (`[MODIFY]`)
1. [`lib/types/profile.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/lib/types/profile.ts) : Ajout du type TypeScript `ThemeConfig`.
2. [`app/[username]/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/[username]/page.tsx) : Application dynamique des styles injectés par `theme_config`.
3. [`components/features/profiles/ProfileDesignSelector.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/components/features/profiles/ProfileDesignSelector.tsx) : Ajout du raccourci vers le nouveau Studio WYSIWYG.
4. [`app/dashboard/profiles/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/dashboard/profiles/page.tsx) : Bouton d'action "Personnaliser le Studio" sur chaque carte de profil.

### 🆕 Nouveaux Fichiers à Créer (`[NEW]`)
1. `supabase/migrations/20260902_add_theme_config_to_profiles.sql` : Ajout de la colonne `theme_config` (JSONB) avec valeurs par défaut.
2. `app/dashboard/profiles/[id]/studio/page.tsx` : Page principale du Studio WYSIWYG.
3. `components/features/profiles/studio/StudioEditorPanel.tsx` : Panneau de contrôle par onglets (En-tête, Couleurs, Typo, Brand Kit).
4. `components/features/profiles/studio/StudioMobilePreview.tsx` : Simulateur smartphone interactif miroir.
5. `lib/utils/theme-defaults.ts` : Valeurs par défaut et helpers d'injection CSS.

---

## 🚀 4. Découpage en Étapes Robustes pour Antigravity

Chaque étape est autonome, complète (sans liens cassés ni fonctionnalités incomplètes) et directement testable.

---

### 🔹 ÉTAPE 1 : Base de Données Supabase & Types TypeScript (`theme_config`)

#### Spécification Technique
1. Créer la migration SQL `supabase/migrations/20260902_add_theme_config_to_profiles.sql` :
   ```sql
   ALTER TABLE public.profiles 
   ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
     "primary_color": "#f97316",
     "secondary_color": "#09090b",
     "background_type": "gradient",
     "font_family": "Inter",
     "avatar_shape": "rounded-full",
     "banner_url": "",
     "banner_type": "image",
     "button_style": "rounded-xl",
     "logo_url": ""
   }'::jsonb;
   ```
2. Définir l'interface `ThemeConfig` dans `lib/types/profile.ts` et le helper de fallback `getProfileThemeConfig(profile)`.
3. Assurer que les requêtes Supabase `select('*')` dans `lib/services/public-profile.ts` et `lib/hooks/useProfiles.ts` incluent la nouvelle colonne sans régression RLS.

#### Critères de Validation & Test Fonctionnel Étape 1
- [x] La colonne `theme_config` existe en base de données Supabase.
- [x] L'appel API `/api/public/profile/[username]` ou la lecture Supabase renvoie un objet `theme_config` valide avec fallbacks.
- [x] Aucune erreur de type TypeScript lors de la compilation.

---

### 🔹 ÉTAPE 2 : Moteur de Rendu Public Dynamique (`app/[username]/page.tsx`)

#### Spécification Technique
1. Créer le composant utilitaire `ThemeStyleInjector.tsx` qui génère dynamiquement les variables CSS en ligne (`--primary-color`, `--font-family`, `--bg-gradient`).
2. Mettre à jour les composants de rendu de profil (`LinkInBioClassic.tsx`, `LinkInBioSocialCreator.tsx`, etc.) pour :
   - Afficher la bannière photo ou vidéo selon `theme_config.banner_url` et `theme_config.banner_type`.
   - Appliquer la forme d'avatar (`theme_config.avatar_shape` : cercle, carré arrondi, hexagone).
   - Appliquer la typographie Google Fonts chargée dynamiquement via Next.js Font / WebFontLoader.
   - Appliquer le style des boutons et le logo du Kit de Marque.

#### Critères de Validation & Test Fonctionnel Étape 2
- [x] La page publique `http://localhost:3000/[username]` affiche la bannière, la forme d'avatar et les couleurs configurées dans `theme_config`.
- [x] Le changement manuel de `theme_config` en BDD modifie immédiatement l'aspect visuel de la page publique.
- [x] La vitesse de chargement de la page publique reste fluide et réactive.

---

### 🔹 ÉTAPE 3 : Studio WYSIWYG Unifié (`/dashboard/profiles/[id]/studio`)

#### Spécification Technique
1. Créer la route `/dashboard/profiles/[id]/studio/page.tsx` protégée par `ProtectedRoute`.
2. Implémenter l'interface split-screen :
   - **Gauche / Panneau (`StudioEditorPanel.tsx`)** : Onglets `En-tête & Médias`, `Couleurs & Arrière-plan`, `Typographie`, `Kit de Marque`.
   - **Droite / Mobile (`StudioMobilePreview.tsx`)** : Frame smartphone mockup retransmettant en direct le rendu exact du profil avec les modifications en temps réel.
3. Bouton "Sauvegarder les modifications" avec état de chargement, notification Toast `sonner` et enregistrement Supabase.
4. Redirection/Bouton "Voir mon profil public" vers `/[username]` avec `target="_blank"`.

#### Critères de Validation & Test Fonctionnel Étape 3
- [x] L'utilisateur accède à `/dashboard/profiles/[id]/studio` depuis son navigateur.
- [x] Toute modification sur un champ (ex: couleur, typographie, forme d'avatar) met immédiatement à jour l'aperçu smartphone à droite sans recharger la page.
- [x] Le clic sur "Sauvegarder" enregistre les données dans Supabase et affiche un toast de confirmation.
- [x] Le bouton "Voir mon profil public" ouvre la page publique dans un nouvel onglet avec les nouveaux styles appliqués.

---

### 🔹 ÉTAPE 4 : Intégration Dashboard & Flux d'Accès Complète

#### Spécification Technique
1. Dans `app/dashboard/profiles/page.tsx`, ajouter le bouton "Pinceau / Studio Design" sur chaque carte de profil orientant directement vers `/dashboard/profiles/[id]/studio`.
2. Dans le menu de navigation `/dashboard/profiles/[id]/change-design/page.tsx`, ajouter une bannière incitative d'accès au Studio WYSIWYG.
3. Vérifier et sécuriser que seuls les propriétaires du profil peuvent accéder et sauvegarder le Studio (`auth.uid() === profile.user_id`).

#### Critères de Validation & Test Fonctionnel Étape 4
- [x] Navigation fluide : Tableau de bord ➔ Cartes Profil ➔ Clic "Studio Design" ➔ Ouverture du Studio ➔ Sauvegarde ➔ Visualisation publique.
- [x] Aucun bouton mort ni lien cassé sur l'ensemble du flux V1.
- [x] Taux de réussite E2E : 100%.

---

## 📊 5. Métriques Globales de Validation de la V1

Avant de clôturer la version V1 et de passer à la **V2 (CV Numérique & Portfolio)**, l'ensemble des critères suivants doit être validé :

1. **Intégrité des Données** : Persistance 100% sans perte de `theme_config` dans Supabase.
2. **Performance Visuelle** : Rendu WYSIWYG instantané (< 50ms de latence lors du changement de couleur/typo dans le Studio).
3. **Compatibilité Mobile/Desktop** : Le profil public s'affiche parfaitement sur smartphone iOS/Android et ordinateurs.
4. **Sécurité RLS** : Un utilisateur B ne peut pas modifier le design du profil de l'utilisateur A.

---

*Cahier des charges V1 généré pour l'orchestrateur Antigravity — Projet Ofika.*
