# 🏛️ Architecture & Spécifications : Profils & Link-in-Bio

## 1. Vue d'Ensemble
Le système de profils Link-in-Bio fournit une interface web mobile-first optimisée pour la conversion, la présentation d'identité professionnelle et la synchronisation avec les cartes connectées NFC.

---

## 2. Sécurité & OWASP Top 10
- **Correction Faille XSS (CWE-79)** dans `lib/hooks/useLinkTracker.ts` :
  - Validation stricte des protocoles d'URL avant redirection (`http:`, `https:`, `tel:`, `mailto:` autorisés uniquement).
  - Blocage impératif des schémas dangereux : `javascript:`, `data:`, `vbscript:`, `file:`.
- **Nettoyage du Code Mort** :
  - 6 fichiers obsolètes et dupliqués archivés dans `_archives/dead-code/` pour réduire la surface d'attaque et la dette technique.

---

## 3. Composants Modulaires Créés

### M01 : `ProfileShareButton.tsx`
- **Rôle** : Bouton de partage universel ultra-accessible placé en haut à droite de chaque carte de profil.
- **Fonctionnement** :
  - Tente d'abord l'API native `navigator.share()` sur mobile.
  - Fallback automatique vers une modale avec **QR Code SVG haute résolution** (`qrcode.react`) et bouton de copie de l'URL dans le presse-papiers.
- **Accessibilité** : Cible tactile $\ge 44\times 44$px avec effet de pression `active:scale-90`.

### M02 : `FeaturedLinksList.tsx`
- **Rôle** : Restructuration de la liste de liens avec hiérarchie visuelle "À la une".
- **Design** :
  - **1er lien** : Carte héroïque prioritaire, badge "À la une", grande icône 44px, titre contrasté et description.
  - **Liens suivants** : Liste secondaire compacte, aérée et homogène.
- **Support Chromatique** : Accepte la prop `accentColor` pour s'harmoniser avec la palette du profil.

### M03 : `ProfileMonogram.tsx`
- **Rôle** : Remplacement haut de gamme (anti-template) de l'avatar quand le profil n'a pas de photo.
- **Algorithme d'initiales** :
  - Détecte intelligemment les deux initiales (ex: *Marc Kouadio* $\rightarrow$ **MK**, *Sophie Koné* $\rightarrow$ **SK**).
- **Finitions nobles** :
  - Typographie Serif sculptée, micro-barre d'accentuation haute joaillerie.
  - 4 thèmes intégrés (`dark`, `light`, `gold`, `teal`) + support des couleurs personnalisées `customBgColor`, `customTextColor`, `customBorderColor`.

---

## 4. Direction Artistique & Palettes Signatures Par Défaut

Chaque template possède sa propre identité chromatique par défaut, sans aucune dépendance à des réglages manuels :

| Template | Fichier | Fond Principal | Accent & Monogramme | Ambiance |
| :--- | :--- | :--- | :--- | :--- |
| **Design 1** | `LinkInBioDesign1.tsx` | Ivoire / Lin (`#FAF9F6`) | Charbon noble (`#1C1917`) | Classique Éditorial |
| **Design 2** | `LinkInBioDesign2.tsx` | Ardoise bleutée (`#F8FAFC`) | Bleu Cobalt (`#2563EB`) & Nuit (`#0B132B`) | Moderne / Tech |
| **Design 3** | `LinkInBioDesign3.tsx` | Crème solaire (`#FFFBEB`) | Terracotta (`#EA580C`) & Noir franc | Créatif / Solaire |
| **Design 4** | `LinkInBioDesign4.tsx` | Lin doux (`#F2F5F3`) | Vert Forêt / Sauge (`#2D5A46`) | Minimaliste / Nature |
| **Design 7** | `LinkInBioDesign7.tsx` | Noir Obsidian (`#09090B`) | Améthyste Platine (`#A855F7`) | Dark Elegant / VIP |
| **Émeraude** | `LinkInBioEmeraude.tsx`| Sable doré (`#F5EFE6`) | Vert Impérial (`#1F4D53`) | Haute Joaillerie |
| **CJCD** | `LinkInBioCJCD.tsx` | Noir Onyx (`#09090B`) | Or Champagne 18k (`#D4AF37`) | Prestige Corporate |

---

## 5. Normes Responsive & Qualité
- Support strict des écrans de 320px (iPhone SE) à 390px (iPhone 14/15) jusqu'aux tablettes et desktop.
- `overflow-x: hidden` systématique pour éliminer tout défilement horizontal indésirable.
- Validation `npm run build` : **100% réussi (Code 0)** sur les 85+ routes de l'application.
