# 📖 Manifeste des Compétences du Projet (MANIFESTE_COMPETENCES.md)

Ce document liste de manière exhaustive toutes les compétences (skills) à disposition de **ChefsOfika**. Il sert de guide d'orientation rapide pour savoir instantanément quel expert appeler pour chaque sous-tâche.

---

## 🏛️ 1. Les Skills Métiers Spécifiques (Dossier : `skills Agents/*`)

| Skill | Emplacement | Rôle principal | Déclencheurs / Mots-clés |
|---|---|---|---|
| **memoire-ofika** | `memoire-ofika/` | Journal de session (`fourtour/`), décisions techniques, wiki et roadmap (`wiki/`) | *enregistre, note ça, résume la session, reprends où on en était, mémoire* |
| **securite-ofika** | `securite-ofika/` | Audit de failles (OWASP), surveillance des CVE récentes (2 semaines), conformité RGPD/CNIL et logs | *sécurité, CVE, vulnérabilité, RGPD, CNIL, RLS Supabase* |
| **seo-audit** | `seo-audit/` | Audit de référencement naturel, balises, vitesse et indexation | *audit SEO, technique SEO, pourquoi je ne suis pas indexé* |
| **copywriting** | `copywriting/` | Rédaction éditoriale, articles de blog, pages de capture | *écris un article, copywriting, texte marketing* |
| **react-email** | `react-email/` | Conception d'emails transactionnels HTML de haute qualité | *email transactionnel, gabarit email, react email* |
| **skill-mermaidH** | `skill-mermaidH/` | Cartographie de processus, diagrammes Mermaid (20+ types), parcours utilisateur, onboarding client, visualisation / cycle de vie de features. **Stockage livrables :** `schemas-mermaid/` | *diagramme, mermaid, schéma, architecture, flux, parcours utilisateur, onboarding, user journey, cartographie, processus, flowchart, séquence, ERD, C4, visualiser une feature, link-to-bio, workflow, schemas-mermaid, svg* |
| **skillgenius** | `skillgenius/` | Intégration du moyen de paiement GeniusPay (Mobile Money Wave, Orange Money, MTN, Moov, PawaPay, cartes bancaires), endpoints, webhooks, signature HMAC. | *geniuspay, paiement, intégrer paiement, webhook paiement, signature HMAC, wave, orange money, mtn, moov, pawapay* |
| **skill-flow** | `skillFlow/` | Cartographie de flux utilisateurs & ingénierie de procédures (directives Karpathy, 5W, résumés E2E, conversion Word `.docx`). Fiches dans `flux-utilisateur/`. | *flux utilisateur, user flow, procédure, procédure paiement, activation nfc, flux auth, flux onboarding, flux-utilisateur, docx* |
| **run-load-test** | `locust-template/` | Tests de charge, stress testing, pic, endurance, point de rupture et dashboards HTML interactifs avec Locust. | *test de charge, stress test, locust, performance test, point de rupture, test d'endurance, breaking point* |

---

## 🎨 2. Les Skills de Méthodologie & Conception Web (Dossier : `.agents/skills/*`)

| Skill | Emplacement | Rôle principal | Déclencheurs / Mots-clés |
|---|---|---|---|
| **equipe-site-web** | `.agents/skills/equipe-site-web/` | Méthodologie complète d'équipe d'experts (11 profils : Chef de Projet, Stratège Business, Copywriter, DA/UI, UX, Dev Front, Dev Back, SEO, QA/Accessibilité, Conformité, Coach) pour vibe coder. Cadrage strict, phases 0 à 7, modules M01..., micro-tâches 15-30 min, zéro code avant fin de cadrage. | *créer un site web, cadrage site, équipe site web, vibe coder, prompt maître, micro-tâches, fiche projet, DA site* |
| **test-vcard** | `.agents/skills/test-vcard/` | Tests automatisés de compatibilité et rendu vCard `.vcf` multi-OS (iPhone iOS Safari, Samsung Galaxy, Huawei, Google Pixel), encodage UTF-8 et conformité RFC 2426. | *test vcard, vcard, vcf, ajouter aux contacts, compatibilité contact téléphone, test-vcard-compatibility.ps1* |
| **brag** | `.agents/skills/brag/` | Création de vidéos de lancement interactives et dynamiques de l'application ou site web avec Hyperframes. | */brag, vidéo de lancement, make a launch video, launch video, teaser* |

---

## 🐘 3. Les Skills Officiels Supabase (Dossier : `.agents/skills/*`)

> Installés via `npx skills add supabase/agent-skills` — source officielle Supabase.

| Skill | Emplacement | Rôle principal | Déclencheurs / Mots-clés |
|---|---|---|---|
| **supabase** | `.agents/skills/supabase/` | Toutes les tâches Supabase : Auth, RLS, Edge Functions, Realtime, Storage, migrations, CLI, MCP server | *supabase, auth, RLS, edge function, realtime, storage, supabase-js, @supabase/ssr, JWT, cookies, getUser, getSession, migration, pg_cron* |
| **supabase-postgres-best-practices** | `.agents/skills/supabase-postgres-best-practices/` | Optimisation Postgres : requêtes, index, schémas, pooling, RLS performance | *optimiser la DB, index manquant, requête lente, connexion pool, schema design, EXPLAIN, pg_stat* |

---

## ⚙️ 4. Les Skills Génériques et Outils (Dossier : `skills Agents/skills-main/skills/*`)

| Skill | Rôle principal | Mots-clés / Domaines d'application |
|---|---|---|
| **skill-creator** | Création, tests et optimisation de nouvelles compétences | *créer un skill, modifier un skill, run evals* |
| **frontend-design** | Conception d'interfaces utilisateur modernes et responsives | *UI design, maquette, style moderne, responsive design* |
| **web-artifacts-builder** | Composants interactifs riches et livrables web | *artifact web, widget interactif, composant dynamique* |
| **theme-factory** | Génération de palettes HSL harmonieuses et chartes graphiques | *thème de couleurs, palette HSL, dark mode theme* |
| **xlsx** | Lecture, génération et édition de feuilles de calcul Excel | *générer excel, modifier xlsx, tableau financier* |
| **pdf** | Extraction, lecture et génération de rapports au format PDF | *créer un pdf, lire un rapport pdf, facture pdf* |
| **docx** | Création et édition de documents Word complexes | *rédiger un document word, modifier docx, modèle de contrat* |
| **pptx** | Conception de présentations PowerPoint professionnelles | *créer des slides, deck de présentation, pptx* |
| **webapp-testing** | Écriture et exécution de tests (Jest, Cypress, etc.) | *tests unitaires, tests e2e, cypress test, jest config* |
| **canvas-design** | Dessins graphiques interactifs (HTML5 Canvas) | *dessiner, graphiques canvas, jeu canvas* |
| **algorithmic-art** | Création de visuels ou d'animations basés sur des algorithmes | *art génératif, animation algorithmique, design mathématique* |
| **brand-guidelines** | Création de guides de style de marque ou vérification de conformité | *style guide, charte graphique, respect de marque* |
| **doc-coauthoring** | Aide à la co-rédaction collaborative de documentations | *co-rédiger, relecture de doc, amélioration de style* |
| **claude-api** | Intégration avancée avec les APIs Claude | *configurer claude api, intégrer claude, prompts system* |
| **internal-comms** | Rédaction de communications et mémos internes | *newsletter interne, mémo entreprise, annonce équipe* |
| **mcp-builder** | Conception de serveurs Model Context Protocol | *créer un serveur mcp, mcp server typescript* |
| **slack-gif-creator** | Optimisation et création de visuels GIF pour Slack | *créer un gif, communication slack* |

---

## 🎯 5. Logique d'Assignation et d'Orchestration

1. **Méthode Équipe Web & Vibe Coder (`equipe-site-web`)** : Pour toute conception de site, cadrage de projet ou demande d'un vibe coder, ChefsOfika applique strictement les 7 phases (0 à 7), active le bon profil avec `[NOM DU PROFIL]` (`[CHEF DE PROJET]` par défaut), découpe en modules `M01, M02...` et en micro-tâches de 15-30 min. **Aucun code avant validation du cadrage complet**.
2. **Priorité Métier Ofika** : Toujours vérifier si un Skill Métier (`skills Agents/`) couvre la demande (Paiement GeniusPay → `skillgenius`, Flux et procédures Word → `skill-flow`, Tests vCard → `test-vcard`, Stress testing → `run-load-test`).
3. **Cartographie & Visualisation (Ofika)** : Pour toute cartographie de processus, parcours utilisateur, onboarding client, ou visualisation / création / modification / mise à jour / suppression de feature — déléguer à **`skill-mermaidH`** lors de l'étape *Cartographie d'Impact*. Livrables dans `schemas-mermaid/`.
4. **Skills Supabase Officiels** : Pour toute tâche touchant à la DB, l'auth, le RLS ou l'infrastructure Supabase, consulter en priorité `.agents/skills/supabase/` et `.agents/skills/supabase-postgres-best-practices/`.
5. **Support Outil** : Utiliser les Skills Génériques (`skills-main/`) pour les manipulations de formats (PDF, Excel, Word, PPTX) ou les phases de design UI technique.
6. **Journalisation Automatique** : À la fin de chaque session ou à la demande de l'utilisateur, appeler **`memoire-ofika`** pour consigner les actions dans `fourtour/` et le `wiki/`.

---

## 📐 6. Dépôt des Schémas Mermaid (`schemas-mermaid/`)

> Référence projet : [schemas-mermaid/README.md](../../../schemas-mermaid/README.md)

| Sous-dossier | Contenu | Exemples existants |
|---|---|---|
| `link-to-bio/` | Page publique, vCard, parcours visiteur | `parcours-visiteur`, `sequence-vcard`, `flowchart-complet` |
| `onboarding/` | Parcours client Ofika | `parcours-client` |
| `architecture/` | C4, ERD, infra Supabase | *(à venir)* |
| `processus/` | Workflows métier internes | *(à venir)* |

**Convention** : chaque schéma = `.mmd` (source) + `.svg` (export). Régénération : `.\schemas-mermaid\render-all.ps1`.

**ChefsOfika** impose cet emplacement dans tout brief vers `skill-mermaidH` et le vérifie à l'étape *Revue & Garde*.
