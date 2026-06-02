# Link-to-bio — Schémas Mermaid

Parcours public Ofika : page profil, bouton **Ajouter aux contacts**, génération vCard.

| Schéma | Source | SVG | Description |
|--------|--------|-----|-------------|
| Parcours visiteur (journey) | [parcours-visiteur.mmd](./parcours-visiteur.mmd) | [parcours-visiteur.svg](./parcours-visiteur.svg) | Expérience utilisateur — preview Markdown |
| Parcours visiteur (flow) | [parcours-visiteur-flowchart.mmd](./parcours-visiteur-flowchart.mmd) | même SVG | Source de l'export SVG |
| Séquence vCard | [sequence-vcard.mmd](./sequence-vcard.mmd) | [sequence-vcard.svg](./sequence-vcard.svg) | Flux technique API → app Contacts |
| Flowchart complet | [flowchart-complet.mmd](./flowchart-complet.mmd) | [flowchart-complet.svg](./flowchart-complet.svg) | Entrées QR/NFC + branches iOS/Android |

> **Note :** le type `userJourney` ne s'exporte pas en SVG via le renderer local ; l'aperçu visuel utilise le flowchart équivalent (`parcours-visiteur-flowchart.mmd` → `parcours-visiteur.svg`).

**Code source :** `app/[username]/`, `components/AddToContactsAuto.tsx`, `app/api/contacts/[profileId]/route.ts`
