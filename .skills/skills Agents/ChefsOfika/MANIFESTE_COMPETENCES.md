# 📖 Manifeste des Compétences du Projet (MANIFESTE_COMPETENCES.md)

Ce document liste de manière exhaustive toutes les compétences (skills) à disposition de **ChefsOfika**. Il sert de guide d'orientation rapide pour savoir instantanément quel expert appeler pour chaque sous-tâche.

---

## 🏛️ 1. Les Skills Métiers Spécifiques (Dossier : `skills Agents/*`)

| Skill | Emplacement | Rôle principal | Déclencheurs / Mots-clés |
|---|---|---|---|
| **memoire-favor** | `memoire-favor/` | Journal de session, décisions techniques, wiki et roadmap | *enregistre, note ça, résume la session, reprends où on en était* |
| **securite-ofika** | `securite-ofika/` | Audit de failles (OWASP), surveillance des CVE récentes (2 semaines), conformité RGPD/CNIL et logs | *sécurité, CVE, vulnérabilité, RGPD, CNIL, RLS Supabase* |
| **seo-audit** | `seo-audit/` | Audit de référencement naturel, balises, vitesse et indexation | *audit SEO, technique SEO, pourquoi je ne suis pas indexé* |
| **copywriting** | `copywriting/` | Rédaction éditoriale, articles de blog, pages de capture | *écris un article, copywriting, texte marketing* |
| **react-email** | `react-email/` | Conception d'emails transactionnels HTML de haute qualité | *email transactionnel, gabarit email, react email* |

---

## ⚙️ 2. Les Skills Génériques et Outils (Dossier : `skills Agents/skills-main/skills/*`)

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

## 🐘 3. Les Skills Officiels Supabase (Dossier : `.agents/skills/*`)

> Installés via `npx skills add supabase/agent-skills` — source officielle Supabase.

| Skill | Emplacement | Rôle principal | Déclencheurs / Mots-clés |
|---|---|---|---|
| **supabase** | `.agents/skills/supabase/` | Toutes les tâches Supabase : Auth, RLS, Edge Functions, Realtime, Storage, migrations, CLI, MCP server | *supabase, auth, RLS, edge function, realtime, storage, supabase-js, @supabase/ssr, JWT, cookies, getUser, getSession, migration, pg_cron* |
| **supabase-postgres-best-practices** | `.agents/skills/supabase-postgres-best-practices/` | Optimisation Postgres : requêtes, index, schémas, pooling, RLS performance | *optimiser la DB, index manquant, requête lente, connexion pool, schema design, EXPLAIN, pg_stat* |

---

## 🎯 4. Logique d'Assignation
1. **Priorité Métier** : Toujours vérifier si un Skill Métier (`skills Agents/`) couvre la demande.
2. **Skills Supabase Officiels** : Pour toute tâche touchant à la DB, l'auth ou l'infrastructure Supabase, consulter en priorité `.agents/skills/supabase/` et `.agents/skills/supabase-postgres-best-practices/`.
3. **Support Outil** : Utiliser les Skills Génériques (`skills-main/`) pour les manipulations de formats (PDF, Excel, Word) ou les phases de design technique.
4. **Journalisation** : Après chaque utilisation de compétence, mettre à jour la mémoire via `memoire-favor`.
