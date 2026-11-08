# 🎨 Spécifications : Landing Page, Simulateur 3D & Tarification Ofika

> **Statut** : Validé & En Production  
> **Dernière mise à jour** : Session 019 — 08 Novembre 2026

---

## 1. Principes Directeurs UI/UX
- **Clarté & Minimalisme Haut de Gamme :** Arrière-plans lumineux (blancs, gris très clairs `bg-gray-50/70`, subtils dégradés ambrés/orangés très estompés). Aucun bloc noir massif ne coupe le rythme de lecture.
- **Zéro Émoji Récréatif :** Remplacement systématique des emojis (`⭐`, `🚚`, `📍`, `💡`) par des icônes vectorielles standardisées issues de `lucide-react` (`Truck`, `MapPin`, `CreditCard`, `CheckCircle`, `Sparkles`).
- **Élimination de la Friction Cognitive :** Réduction drastique des hauteurs de section, fusion des argumentaires redondants et boutons d'action clairs sans options "bientôt disponibles" désactivées.

---

## 2. Architecture des Sections de la Landing Page (`app/page.tsx`)

1. **ModernHero (`components/landing/ModernHero.tsx`)**
   - Rendu statique côté client sans état aléatoire pour garantir zéro mismatch d'hydratation Next.js.
   - Présentation de la carte physique en vue double :
     - **Recto** (`/assets/recto-black-full.svg`) : Emblème officiel + typographie intégrale "Ofika" + badge NFC.
     - **Verso** (`/assets/verso-black.svg`) : QR Code haute résolution avec support SVG double `href` / `xlink:href`.

2. **Section Solution Duo (`#solution`)**
   - Fusionne les anciennes sections *Pour qui ?*, *Pourquoi Ofika ?* et *NFC vs QR*.
   - **En-tête :** Chiffre clé (88% des cartes papier finissent à la poubelle en 1 semaine).
   - **Les 2 Piliers :**
     - *La Carte Sans Contact (NFC)* : Rencontres face-à-face, 1 tap, compatible 100% smartphones.
     - *Le QR Code Intelligent* : Supports physiques, packagings, vitrines, flyers et contacts à distance.
   - **Bandeau 4 Profils :** Boutiques & Commerces, Cadres & Entreprises, Freelances & Experts, Créateurs & Médias.

3. **Simulateur 3D en Direct (`#demo`)**
   - Composants : `InteractiveBusinessCard.tsx` et `NFCCard3DViewer.tsx`.
   - Arrière-plan doux lumineux.
   - Gestion du Logo au centre du Recto :
     - Par défaut : Logo vectoriel officiel Ofika (`logo-white-full.svg` sur fond noir, `logo-black-full.svg` sur fond blanc).
     - Logo personnalisé : Prend immédiatement la place centrale si téléversé par l'utilisateur.
   - Contrôles simplifiés : Bouton unique de retournement Recto/Verso (`handleFlipToggle`), aucune rotation automatique forcée.
   - Verso parfaitement centré (horizontalement et verticalement) avec QR code "Scannez-moi", Nom et Fonction.

4. **Section Tarifs Clairs (`#pricing`)**
   - **Profil Digital (0 FCFA)** : Gratuit à vie, page en ligne, QR code, mise à jour instantanée.
   - **Carte NFC Physique (Dynamique via `NFC_CARD_BASE_PRICE`)** : Achat unique à vie, puce NFC + QR gravé, carte rigide étanche, **livraison 100% gratuite dans tout Abidjan**.
   - **Entreprises (Sur devis)** : À partir de 5 cartes, personnalisation graphique complète, gestion centralisée.

---

## 3. Configuration des Prix & Livraison (`lib/config/pricing.ts`)
- `NFC_CARD_BASE_PRICE = Number(process.env.NEXT_PUBLIC_NFC_CARD_BASE_PRICE) || 14600`
- `SHIPPING_COSTS.ABIDJAN = 0` (Livraison gratuite à Abidjan garantie par défaut).
- `SHIPPING_COSTS.UEMOA = 2000` (Intérieur de la Côte d'Ivoire et pays UEMOA).

---

## 4. Politique d'Accès Staff & Service Worker
- **Sécurité Staff :** `StaffMfaModal` a été retiré des layouts `AdminClientLayout.tsx` et `TechClientLayout.tsx`. L'authentification superadmin se fait de manière fluide sans blocage 2FA TOTP inattendu.
- **Service Worker (`public/sw.js`) :**
  - Ignore immédiatement les schémas non-HTTP (`chrome-extension://`, `moz-extension://`, `blob:`, `data:`).
  - Évite les rejets d'erreurs non gérés sur les extensions Chrome de l'utilisateur.
