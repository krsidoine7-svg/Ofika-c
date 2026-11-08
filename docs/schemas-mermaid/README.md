# Schémas Mermaid — Ofika

Bibliothèque centralisée des diagrammes du projet. Chaque schéma existe en **deux formats** :

| Format | Rôle |
|--------|------|
| `.mmd` | Source éditable (texte Mermaid) |
| `.svg` | Export visuel prêt à lire / partager |

---

## Arborescence

```
schemas-mermaid/
├── README.md                 ← vous êtes ici
├── render-all.ps1            ← régénère tous les SVG
│
├── link-to-bio/              ← Page publique + vCard
│   ├── parcours-visiteur.mmd          (userJourney — preview IDE)
│   ├── parcours-visiteur-flowchart.mmd  (source export SVG)
│   ├── parcours-visiteur.svg
│   ├── sequence-vcard.mmd / .svg
│   └── flowchart-complet.mmd / .svg
│
├── onboarding/               ← Parcours client Ofika
│   └── parcours-client.mmd / .svg
│
├── architecture/             ← C4, ERD, infra (à venir)
└── processus/                ← Workflows métier (à venir)
```

---

## Index rapide

### Link-to-bio & Ajouter contact

| Aperçu | Fichier | Type |
|--------|---------|------|
| ![Parcours visiteur](./link-to-bio/parcours-visiteur.svg) | [link-to-bio/parcours-visiteur.mmd](./link-to-bio/parcours-visiteur.mmd) | userJourney |
| ![Séquence vCard](./link-to-bio/sequence-vcard.svg) | [link-to-bio/sequence-vcard.mmd](./link-to-bio/sequence-vcard.mmd) | sequenceDiagram |
| ![Flowchart complet](./link-to-bio/flowchart-complet.svg) | [link-to-bio/flowchart-complet.mmd](./link-to-bio/flowchart-complet.mmd) | flowchart |

→ Détails : [link-to-bio/README.md](./link-to-bio/README.md)

### Onboarding client

| Aperçu | Fichier | Type |
|--------|---------|------|
| ![Parcours client](./onboarding/parcours-client.svg) | [onboarding/parcours-client.mmd](./onboarding/parcours-client.mmd) | flowchart |

→ Détails : [onboarding/README.md](./onboarding/README.md)

---

## Régénérer les SVG

Après modification d'un `.mmd` :

```powershell
.\schemas-mermaid\render-all.ps1
```

Ou un seul fichier :

```powershell
node ".skills/skills Agents/skill-mermaidH/scripts/render.mjs" `
  --input "schemas-mermaid/link-to-bio/sequence-vcard.mmd" `
  --output "schemas-mermaid/link-to-bio/sequence-vcard.svg" `
  --theme tokyo-night
```

---

## Conventions

1. **Un schéma = un couple `.mmd` + `.svg`** dans le sous-dossier thématique.
2. **Noms en kebab-case** : `sequence-vcard.mmd`, pas `link-to-bio-vcard-sequence.mmd`.
3. **README par dossier** : tableau source / SVG / description.
4. **Mise à jour** : modifier le `.mmd`, relancer `render-all.ps1`, committer les deux fichiers.

---

## Où ajouter un nouveau schéma ?

| Sujet | Dossier |
|-------|---------|
| Page publique, UX visiteur, vCard | `link-to-bio/` |
| Inscription, configuration profil | `onboarding/` |
| C4, ERD, Supabase, API | `architecture/` |
| NFC, admin, emails, commandes | `processus/` |

Géré par **ChefsOfika** → skill **skill-mermaidH**.

**Référencé dans :** `ChefsOfika/SKILL.md`, `MANIFESTE_COMPETENCES.md`, `PROMPT/STACK.md`, `skill-mermaidH/references/chefsOfika-integration.md`.
