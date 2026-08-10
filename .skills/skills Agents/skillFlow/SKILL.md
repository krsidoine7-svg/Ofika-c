---
name: skill-flow
description: >
  Skill d'ingénierie et de cartographie de flux utilisateurs (Flow Cartography & Procedure Engineering)
  pour OFIKA (Cartes de Visite Intelligentes NFC & QR Code). Utilise ce skill lorsque l'utilisateur demande de créer,
  documenter, analyser ou mettre à jour un flux utilisateur, un onboarding, une procédure de paiement (GeniusPay / Wave Direct),
  une activation NFC, une édition de profil Link-in-Bio, une vCard ou un processus d'administration. Ce skill analyse le
  codebase (UI Next.js, API Routes, tables DB Supabase, triggers PostgreSQL), applique les directives Karpathy,
  génère les fiches de procédures en Markdown (.md) avec diagrammes Mermaid interactifs dans 'flux-utilisateur/',
  ajoute obligatoirement un 'Résumé de Test d'Exécution Complet (E2E)' et convertit chaque procédure en document Word (.docx).
---

# skill-flow — Ingénierie & Cartographie des Flux Utilisateurs
## OFIKA — Cartes de Visite Intelligentes NFC & QR Code

> [!IMPORTANT]
> **Positionnement Officiel : OFIKA — Solution Leader de Réseau Professionnel NFC & Digital**
> Ofika est la plateforme de référence en Côte d'Ivoire et en Afrique pour la digitalisation des cartes de visite professionnelles via technologie NFC et QR Code. Tous les flux documentés et toutes les procédures générées doivent obligatoirement refléter l'excellence de la marque, l'élégance du design et la sécurité technique de classe mondiale.

---

## 1. Charte Graphique & Design Tokens OFIKA

Tous les éléments visuels, composants UI et schémas Mermaid doivent s'aligner sur la charte graphique officielle d'OFIKA :

- **Couleur Primaire (Vibrant Accent) :** **Orange Ofika `#F97316` / `#EA580C`** (Énergie, modernité, visibilité).
- **Couleur Secondaire (Dark Luxury) :** **Noir Ébène `#111827` / `#000000`** (Prestige, compacité, élégance).
- **Neutres & Fond :** **Gris Moderne `#F9FAFB` / `#F3F4F6`** (Lisibilité optimale).
- **Typographie & Style UI :** Cartes à bordures arrondies (`rounded-2xl` / `rounded-3xl`), effet glassmorphism, micro-animations réactives et badges de statuts colorés (Vert Payé, Violet Vérification, Jaune En attente, Rouge Échec).

---

## 2. Principes Fondateurs & Règles de Conception

Le skill `skill-flow` s'appuie sur 4 piliers méthodologiques stricts :

1. **Gouvernance & RBAC Stricte** : Séparation nette des rôles utilisateur (`client`, `visiteur_public`, `admin_logistique`, `super_admin`).
2. **Directives Karpathy** :
   - *Think Before Coding* : Expliciter toutes les hypothèses, conditions d'échec (si/sinon), endpoints API et variables avant de fixer un flux.
   - *Simplicity First* : Diagrammes et procédures lisibles immédiatement en 30 secondes par un client, un dev ou un investisseur.
   - *Surgical Changes* : Impact ciblé sur les composantes UI, API Routes et tables BD Supabase sans effets secondaires.
   - *Goal-Driven Execution* : Critères de succès vérifiables étape par étape.
3. **Méthodologie des 5 W (Who, What, When, Where, Why & How)** :
   Chaque étape du flux explicite Qui l'active, Quoi/Quelle action est exécutée, Quand, Où dans l'application, Pourquoi et Comment.
4. **Section Obligatoire de Fin : Résumé du Flux** :
   Chaque fiche de flux DOIT obligatoirement se conclure par un résumé clair, synthétique et fluide du parcours en langage naturel sous forme de bloc explicatif unifié.

---

## 3. Structure Canonique d'une Fiche de Flux (`.md`)

Chaque fichier de flux généré dans `flux-utilisateur/` doit obligatoirement respecter le plan suivant :

1. **En-tête & Métadonnées** (Titre, Catégorie, Emplacement fichier).
2. **Description en Langage Naturel** (Explication claire, accessible à tous).
3. **Diagramme Mermaid Interactif** (Code `flowchart` ou `sequenceDiagram` copy-pasteable).
4. **Arbre de Décision, Conditions & Règles Si/Sinon** (Détail de toutes les ramifications et cas limites).
5. **📝 Résumé du Flux** *(OBLIGATOIRE)* :
   - Synthèse globale rédigée en langage naturel décrivant l'ensemble du déroulement du flux de A à Z.
   - Présentation claire des actions utilisateur, des validations serveur API, des mises à jour en base de données Supabase et de l'état final obtenu.

---

## 4. Organisation des Fichiers dans `flux-utilisateur/`

```text
flux-utilisateur/
├── README.md                            # Schéma Général Unifié & Carte Maître
├── auth-et-compte/                      # Connexion, Inscription, Google OAuth
├── onboarding/                          # Landing Get-Started, Modèles de Carte, Livraison
├── paiement/                            # GeniusPay (auto), Wave Direct (manuel), Suivi & Bouton Payer
├── cartes-et-profils/                   # Activation NFC, Édition Link-in-Bio, Scan Visiteur & vCard
└── administration/                     # Traitement Logistique, Prix BD & Passerelles ON/OFF
```

---

## 5. Commande de Conversion Automatisée (.md -> .docx)

Après toute création ou mise à jour d'un fichier Markdown (`.md`), la conversion en document Word certifié (`.docx`) est exécutée automatiquement :

```powershell
python ".skills/skills Agents/skillFlow/scripts/md_to_docx.py" "flux-utilisateur/[catégorie]/[fichier].md" "flux-utilisateur/[catégorie]/[Fichier].docx"
```
