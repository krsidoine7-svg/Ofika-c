---
name: tchor-rectte-pr
description: Audite un projet logiciel (code source, URL de staging ou de production, maquettes) puis produit un cahier de recette pas-à-pas personnalisé au secteur d'activité détecté, en Markdown et en Word (.docx), avec un document de suivi des bugs. À utiliser dès que l'utilisateur parle de cahier de recette, recette, plan de test, UAT, test d'acceptation, checklist de test pour testeurs non techniques, audit QA ou "tester toutes les fonctionnalités du site / de l'app", même sans dire "recette". Détecte d'abord le secteur et le contexte, puis écrit des tests spécifiques au projet (vrais libellés, vraies routes, vrais comptes) et refuse le contenu générique. Also use for QA acceptance test books, UAT scripts and test plans built from a codebase or a live site.
---

# tchor-rectte-pr : audit + cahier de recette sur mesure

Ce skill transforme un projet (n'importe lequel) en cahier de recette qu'un testeur non technique
peut exécuter à la lettre. Il suit un ordre précis, parce que chaque étape alimente la suivante :
sans le secteur, pas de règles métier ; sans audit, pas de vrais libellés ; sans libellés, un cahier
générique que personne ne peut vérifier.

## Principe directeur : le spécifique ou rien

Un test est utile s'il ne pourrait pas être copié dans un autre projet. Avant d'écrire, lis
references/anti-generique.md : il explique le « test du caviardage », les formules interdites et
comment traiter une information manquante. Le script lint_cahier.py vérifie une partie de ces règles,
le reste dépend de toi.

Deux conséquences pratiques :
- Chaque libellé, URL, message ou valeur cité vient du code, du site ou de l'utilisateur. Si tu ne le
  trouves pas, écris NON TROUVÉ ou À FOURNIR et remonte-le. Jamais de valeur plausible inventée.
- Ton message à l'utilisateur est aussi concret que le cahier : chiffres, noms, questions précises.
  Pas d'introduction ni de conclusion qui reformulent.

## Déroulé

Dans les commandes ci-dessous, <skill> est le dossier de ce skill et <projet> la racine du projet.
Les livrables vont dans docs/ du projet.

### Phase 0 : cadrage et détection du secteur

1. Lance les scripts d'inventaire (ils donnent des indices, pas des vérités) :
   - python <skill>/scripts/scan_project.py <projet> : stack, URLs, routes, rôles, entités, classement des secteurs.
   - python <skill>/scripts/find_test_accounts.py <projet> : comptes de test candidats.
   - python <skill>/scripts/extract_brand.py <projet> : nom, couleurs, logos.
2. Lis le README, les écrans principaux, les fichiers de traduction. Confirme ou corrige le secteur :
   donne **secteur, sous-secteur, niveau de confiance et 3 à 5 indices**. Projet hybride (ex. marketplace +
   paiement mobile) : nomme les deux et charge les deux profils.
3. Remplis la fiche de contexte (nature, vision, utilisateurs, conformité, environnements, stade,
   périmètre, identité visuelle) avec « Déduit » ou « À confirmer » pour chaque ligne.
4. Si des éléments critiques manquent (secteur incertain, environnement cible, périmètre, conformité),
   pose **au maximum 6 questions courtes groupées**, avec choix proposés (AskUserQuestion si disponible).
   Si l'utilisateur est absent ou la session non interactive, prends l'hypothèse la plus raisonnable,
   écris-la en tête du rapport sous « Hypothèses retenues » et continue.

### Phase 1 : audit en lecture seule

Ne modifie ni code, ni base, ni environnement. Utilise references/audit-checklist.md (où chercher
selon la stack, par type de projet, comptes de test, URL, libellés exacts, cas sans code source).
Relève : stack, écrans et routes par espace, rôles et permissions, flux métiers, règles métier,
comptes de test, URL d'environnement, identité visuelle, points de vigilance sécurité et qualité.

### Phase 1B : profil sectoriel

Ouvre references/sector-profiles.md, **seulement la section du ou des secteurs identifiés**. Compare
les fonctionnalités standards du secteur à celles du projet : présente, partielle, absente. Retiens
les parcours de bout en bout, les cas réels, la réglementation (vérifie par recherche web les textes
que tu cites), les risques P1. Les fonctionnalités absentes vont dans l'annexe d'écarts, jamais dans
les tests : on ne teste pas ce qui n'existe pas.

### Phase 2 : rapport d'audit et validation

Écris docs/AUDIT-RECETTE.md à partir de assets/audit-template.md : hypothèses, fiche de contexte,
stack, modules avec leurs **sources** (fichiers, routes, écrans), rôles, comptes, profil sectoriel,
cas limites, zones d'ombre avec questions, plan du cahier. Présente-en un résumé à l'utilisateur et
**attends sa validation** avant la Phase 3. En mode non interactif, continue et signale les
hypothèses dans le message final.

### Phase 3 : rédaction du cahier

Lis references/test-design.md (écriture des scénarios, grille de couverture, priorités) et
references/cahier-format.md (format exact), puis écris docs/CAHIER-DE-RECETTE.md à partir de
assets/cahier-template.md. Écris aussi docs/recette-meta.json (modèle : assets/recette-meta.example.json)
avec plateforme, environnement, URL, version, logo PNG/JPG et couleur de marque.

Points qui font la différence :
- Un module par domaine fonctionnel réel, plus un module « Parcours de bout en bout » multi-rôles
  issu du profil sectoriel, plus un module transverse (sécurité, responsive, accessibilité) si pertinent.
- Pour chaque fonctionnalité : nominal, échecs, limites, droits, selon la grille de test-design.md.
- Résultats attendus observables, avec les messages exacts lus dans le code.
- P1 pour les risques sectoriels et les obligations légales.
- Tableau de validation à la fin de chaque module, sans exception.
- Zéro HTML brut, zéro emoji, zéro accent grave (backtick) : tout est écrit en texte simple, y compris URL, e-mails et mots de passe de test. Le lint rejette les emojis et les accents graves.
- Validation toujours « [ ] OK [ ] KO [ ] NA » : sans KO, un testeur ne peut pas dire qu'un test a échoué.
- Pré-production partagée (plusieurs testeurs, mêmes comptes) : les tests qui modifient un compte
  (mot de passe, PIN, e-mail, suppression) se font avec un compte créé par le testeur ; les réglages
  globaux (maintenance, bannière, paiement) vont dans un module réservé au responsable, avec
  « remettre la valeur d'origine » dans le scénario.
- Ne jamais écrire le cahier dans un autre format « plus joli » (emojis, codes VIS-01, HTML) : le
  lint et la conversion Word ne le reconnaissent plus. Lancer le lint dès le premier module.

Pour un gros projet, rédige module par module (plan d'abord, puis chaque module) plutôt que d'un bloc,
et livre un premier module à l'utilisateur dès qu'il est prêt si la session est interactive.

### Phase 4 : contrôle, conversion, vérification

1. python <skill>/scripts/lint_cahier.py docs/CAHIER-DE-RECETTE.md
   Corrige toutes les ERREURS. Traite les AVERTISSEMENTS : un scénario sans élément concret ou un
   résultat vague est à réécrire, pas à ignorer. Relance jusqu'à zéro erreur.
2. Relis les cases de la checklist ci-dessous.
3. python <skill>/scripts/md_to_docx.py docs/CAHIER-DE-RECETTE.md --meta docs/recette-meta.json --out docs/CAHIER-DE-RECETTE.docx
4. python <skill>/scripts/make_bugs_doc.py --meta docs/recette-meta.json --out docs/BUGS_ET_AMELIORATIONS.docx
5. Vérifie les .docx : ouvre-les avec python-docx, et si LibreOffice (soffice) est disponible,
   convertis en PDF et regarde quelques pages (tableaux, cases, page de garde, logo).
   pip install python-docx --break-system-packages si le module manque. Si l'installation globale
   est impossible (Windows, droits) : pip install --target <dossier-temp> python-docx, puis lancer les
   scripts avec la variable PYTHONPATH=<dossier-temp>.
   Le Word contient un sommaire paginé : il se remplit à l'ouverture dans Word (« Mettre à jour les
   champs » : Oui). Si le .docx est ouvert dans Word, le script écrit une copie « -nouveau » et le signale.
   Sous Windows avec Word installé, finaliser avant livraison : ouvrir le .docx par Word (COM PowerShell,
   Word.Application), mettre à jour sommaire et champs, enregistrer, puis retirer w:updateFields avec
   python-docx. Le testeur reçoit un sommaire déjà rempli, sans question à l'ouverture. Vérifier le
   nombre de pages et « Page X / Y » dans un export PDF.

Checklist finale :
- [ ] Chaque fonctionnalité du rapport d'audit a au moins un test ; la matrice de couverture reprend les chiffres du lint.
- [ ] Chaque module a des cas d'échec et des cas limites, et teste les droits entre rôles.
- [ ] Chaque ligne de test a les trois cases OK / KO / NA.
- [ ] Les comptes partagés ne sont jamais modifiés par un test ; les réglages globaux sont remis à leur valeur d'origine.
- [ ] Chaque libellé cité entre « » existe dans le code (recherche dans les écrans), sauf les valeurs que le testeur saisit lui-même. Les statuts sont ceux de l'écran du rôle qui joue l'étape (client, artisan et équipe n'ont pas toujours les mêmes mots).
- [ ] Les données dont dépendent les tests existent (produits, commandes, comptes) : sinon, une section « Préparation avant la recette » dit qui les crée, avec les valeurs exactes.
- [ ] Les dépendances entre tests suivent l'ordre des modules (un test ne s'appuie jamais sur un test d'un module suivant).
- [ ] Rendu Word vérifié dans un export PDF : aucune page blanche, aucun tableau de validation seul en haut d'une page, sommaire rempli.
- [ ] Rien d'inventé : comptes, URL, messages viennent de l'audit ; les trous sont marqués.
- [ ] Le secteur est visible dans le cahier (modules, parcours, règles métier, vocabulaire, données de test).
- [ ] Les tests à effet réel sont signalés pour le staging.
- [ ] L'annexe d'écarts existe et ne contient aucune case à cocher.

## Livraison

Envoie docs/CAHIER-DE-RECETTE.docx et docs/BUGS_ET_AMELIORATIONS.docx (le .md d'audit aussi si
l'utilisateur le veut), puis un message court : secteur retenu et confiance, nombre de modules et de
tests (dont P1), points bloquants (comptes ou informations manquants, hypothèses), ordre d'exécution
conseillé (Authentification d'abord, destructifs en dernier).

## Sécurité et limites

- Lecture seule pendant l'audit. Aucun compte créé sans permission explicite.
- Aucun secret réel dans les livrables (clés API, tokens, données personnelles). Les fichiers .env
  réels ne sont pas lus par les scripts.
- Production : tests à effet réel marqués « À EXÉCUTER UNIQUEMENT EN STAGING », avec une alternative sûre.
- Sans code source (URL seule, maquettes) : audit fondé sur l'interface, limites écrites dans les
  hypothèses, comptes à fournir par l'utilisateur.
- Si Word n'accepte pas un logo SVG : convertis-le en PNG avant la conversion.

## Fichiers du skill

| Fichier | Quand l'ouvrir |
| :--- | :--- |
| references/anti-generique.md | Avant d'écrire quoi que ce soit (Phase 3), et en cas de doute sur la précision d'un test |
| references/audit-checklist.md | Phases 0 et 1 |
| references/sector-profiles.md | Phase 1B, uniquement la section du secteur identifié |
| references/test-design.md | Phase 3 |
| references/cahier-format.md | Phase 3 et en cas d'erreur de lint ou de conversion |
| references/sector-signals.json | Pour ajouter un secteur ou affiner la détection automatique |
| assets/*.md, assets/*.json | Modèles du rapport d'audit, du cahier et des métadonnées |
| scripts/scan_project.py, find_test_accounts.py, extract_brand.py | Phase 0 |
| scripts/lint_cahier.py | Phase 4, avant toute conversion |
| scripts/md_to_docx.py, make_bugs_doc.py | Phase 4 |
