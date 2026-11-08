# Documentation du Parcours Onboarding Page Publique (`/onboarding/public-page`)

## 1. Synthèse de l'Architecture

Le parcours d'onboarding sur `/onboarding/public-page` permet à un utilisateur de créer et personnaliser sa carte numérique en temps réel, puis de créer son compte pour la mettre en ligne.

Le système utilise une **architecture responsive séparée** :
- **Sur Mobile (`lg:hidden`)** : Éditeur interactif WYSIWYG (`MobileWysiwygEditor.tsx`) affichant le vrai template sélectionné dans le viewport du téléphone avec crayons d'édition overlay.
- **Sur Desktop (`lg:block`)** : Assistant à 4 étapes (`OnboardingWizard.tsx`) couplé à la prévisualisation sticky du smartphone iPhone 15 (`IPhone15Frame.tsx`).

---

## 2. Parcours en 2 Étapes Fluides

Le flux a été simplifié de 3 étapes à **2 étapes** :
1. **Étape 1 : `Création` (Infos & Design)** :
   - Choix du style de template (*Design CJCD, Nature, Influenceur, Classique, Dark Elegant, etc.*).
   - Remplissage et édition directe du nom, prénom, poste, entreprise, bio, photo de profil, couverture, téléphone, email, localisation et réseaux sociaux.
   - Validation stricte des données (filtrage automatique du téléphone pour refuser les lettres, validation d'email).
   - Le bouton **"Suivant (Créer mon compte)"** est désactivé tant que le nom et un moyen de contact valide (téléphone ou email) ne sont pas saisis.

2. **Transition : Popup de Célébration 🎉 (`CelebrationPreviewModal.tsx`)** :
   - Au clic sur **"Suivant"**, une popup modale s'ouvre avec animation de félicitations.
   - Affiche le smartphone **iPhone 15 avec le rendu exact final de la carte**.
   - Propose 2 options :
     - **"Continuer vers la création du compte $\rightarrow$"** : Bascule vers l'Étape 2 (Inscription).
     - **"Modifier encore ma carte"** : Ferme la popup et laisse l'utilisateur à l'Étape 1 pour ajuster son profil.

3. **Étape 2 : `Compte` (`SignupStep.tsx`)** :
   - Saisie du mot de passe et création du compte pour la publication en ligne de la carte.

---

## 3. Composants Clés

| Composant | Emplacement | Rôle |
| :--- | :--- | :--- |
| `PublicPageOnboardingPage` | `app/onboarding/public-page/page.tsx` | Conteneur principal du flux d'onboarding |
| `MobileWysiwygEditor` | `components/features/onboarding/public-page/MobileWysiwygEditor.tsx` | Éditeur mobile interactif avec crayons overlay & validation |
| `CelebrationPreviewModal` | `components/features/onboarding/public-page/CelebrationPreviewModal.tsx` | Popup de félicitations 🎉 et aperçu smartphone final |
| `OnboardingWizard` | `components/features/profiles/onboarding/OnboardingWizard.tsx` | Assistant desktop à 4 étapes |
| `IPhone15Frame` | `components/ui/iphone-15-frame.tsx` | Mockup de téléphone iPhone 15 pour le rendu final |

---

## 4. Règles de Sécurité & Validation

1. **Assainissement du Téléphone** : Seuls les caractères téléphoniques valides (`+`, digits, espaces, `-`, parenthèses) sont autorisés. Toute lettre saisie est automatiquement retirée.
2. **Contrôle d'Email** : Vérification par expression régulière `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
3. **Bouton Suivant Verrouillé** : Verrouillage visuel (`bg-gray-200 cursor-not-allowed`) et logique (`disabled={!isFormValid}`) jusqu'à ce que les critères minimaux soient satisfaits.
