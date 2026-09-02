<!-- Dernière mise à jour : 31 Mai 2026 -->

# Mermaid & schemas-mermaid — Ofika

**Liens :** [INDEX.md](../INDEX.md) | [schemas-mermaid/](../../../../../schemas-mermaid/README.md)

## Outils

| Composant | Emplacement | Rôle |
|-----------|-------------|------|
| **skill-mermaidH** | `.skills/skills Agents/skill-mermaidH/` | Skill agent expert Mermaid (20+ types) |
| **ChefsOfika** | `.skills/skills Agents/ChefsOfika/` | Orchestrateur — délègue la cartographie |
| **schemas-mermaid/** | Racine du repo | Dépôt officiel `.mmd` + `.svg` |
| **render-all.ps1** | `schemas-mermaid/render-all.ps1` | Export SVG batch |
| **beautiful-mermaid** | Dépendance du skill-mermaidH | Renderer SVG local |

## Sous-dossiers

- `link-to-bio/` — page publique, vCard, parcours visiteur
- `onboarding/` — parcours client Ofika
- `architecture/` — C4, ERD, Supabase (à venir)
- `processus/` — workflows métier (à venir)

## Commande

```powershell
.\schemas-mermaid\render-all.ps1
```

## Limitation connue

Le type `userJourney` ne s'exporte pas en SVG via `beautiful-mermaid`. Utiliser un flowchart parallèle (`*-flowchart.mmd`) pour l'export.

## Références

- [chefsOfika-integration.md](../../../skill-mermaidH/references/chefsOfika-integration.md)
- [ChefsOfika/SKILL.md](../../../ChefsOfika/SKILL.md)
- [PROMPT/STACK.md](../../../../../PROMPT/STACK.md)
