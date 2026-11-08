# Format du cahier de recette

Le Markdown suit une structure stricte : scripts/lint_cahier.py la vérifie et
scripts/md_to_docx.py la convertit. S'écarter du format = lint en erreur ou Word cassé.
Point de départ : assets/cahier-template.md.

## Structure du fichier docs/CAHIER-DE-RECETTE.md

    # Cahier de Recette : <Nom de la plateforme>        (ignoré dans Word : la page de garde le remplace)

    ## Informations générales
    ## Consignes aux testeurs
    ## Répertoire des comptes de test
    ## Module 1 : <Nom>
    ## Module 2 : <Nom>
    ...
    ## Matrice de couverture
    ## Annexe : Écarts et recommandations sectorielles

Les titres des modules respectent ## Module N : Titre (N entier, séquentiel). Chaque module
démarre sur une nouvelle page dans le Word.

## Informations générales

Plateforme, environnement (Production / Staging), URL réelle, version, date, périmètre.
URL réelle obligatoire. Si seule une URL locale existe, la mettre et le signaler dans le message final.

## Consignes aux testeurs (texte à reprendre tel quel, en adaptant les exemples)

- Cocher [ ] OK si le résultat observé correspond au résultat attendu, [ ] KO s'il ne correspond
  pas (le bug est alors consigné), [ ] NA si le test ne s'applique pas ou ne peut pas être exécuté.
- Si les comptes du répertoire sont partagés entre plusieurs testeurs : interdiction d'en modifier
  le mot de passe, le code PIN, l'e-mail ou le téléphone, ou de les supprimer. Les tests qui le
  demandent se font avec un compte créé par le testeur (le dire dans le pré-requis du module).
- Procédure obligatoire en cas de bug :

> Si une étape échoue ou présente une anomalie :
> 1. Faire une capture d'écran nette de l'écran ou de l'erreur.
> 2. Noter la référence exacte du test (ex. : Module 1 - Test 1.2).
> 3. Consigner l'incident dans le document de suivi BUGS_ET_AMELIORATIONS avec la capture.

- Légende des priorités : P1 critique (bloque la mise en service), P2 important, P3 mineur.
- Un test à effet réel (paiement, envoi) est signalé « À EXÉCUTER UNIQUEMENT EN STAGING ».

## Répertoire des comptes de test

| Profil | Nom / Fonction | E-mail de connexion | Mot de passe de test | Téléphone | Rôle |
| :--- | :--- | :--- | :--- | :--- | :--- |

- Valeurs réelles issues de l'audit, copiables directement. Jamais de {{...}}.
- Mot de passe écrit en texte simple, sans accents graves ni guillemets. S'il contient le caractère | ou *, le
  signaler dans la colonne Rôle ou le changer côté staging plutôt que de risquer un affichage faussé.
- Compte manquant : écrire À FOURNIR dans la cellule. Le lint le remonte comme point bloquant.
- Seulement des comptes de test. Jamais un compte réel ni un secret de production.

## Un module

    ## Module 3 : Publication d'une annonce

    Pré-requis du module : être connecté en tant que Vendeur (compte 2).

    | N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
    | :--- | :--- | :--- | :--- | :--- | :--- |
    | 3.1 | P1 | ... | 1. ... 2. ... 3. ... | ... | [ ] OK [ ] KO [ ] NA |

    | Nom du Testeur | Date | Commentaires & Remarques |
    | :--- | :--- | :--- |
    | | | |
    | **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

Règles :
- Colonnes exactement dans cet ordre et avec ces intitulés (le lint accepte les variantes qui commencent par le même mot).
- Étapes numérotées dans la même cellule, séparées par un espace : 1. Aller sur... 2. Saisir...
  (le convertisseur coupe avant chaque « N. » suivi d'une majuscule ou d'un mot).
- Pas de saut de ligne dans une cellule, pas de <br>, pas de HTML.
- Le caractère | dans une cellule s'écrit \|.
- Validation toujours [ ] OK [ ] KO [ ] NA.
- Une saisie de test qui ressemble à du HTML (« <b>test</b> ») s'écrit entre guillemets « » : le lint l'accepte.
- N° : module.séquence, sans trou : 3.1, 3.2, 3.3.
- Tableau de validation de fin de module : obligatoire, sans exception, avec sa ligne vide (hauteur
  d'écriture ajoutée automatiquement dans Word) et la ligne « Décision finale ».

## Matrice de couverture

| Module | Tests | dont P1 | Fonctionnalités couvertes |
| :--- | :--- | :--- | :--- |

Les nombres sont ceux donnés par lint_cahier.py. Une matrice fausse est pire qu'une absente.

## Annexe : Écarts et recommandations sectorielles

Texte et puces uniquement, sans cases à cocher : fonctionnalités habituelles du secteur absentes du
projet, risques réglementaires repérés, améliorations conseillées. Chaque point nomme la fonctionnalité,
pourquoi le secteur l'attend, et le risque de son absence.

## Typographie et style

- Aucun HTML brut (&nbsp;, <br>, balises), aucun emoji, aucun accent grave (backtick) dans tout le document.
- En-têtes de tableau #1E293B avec texte blanc, bordures fines #CBD5E1. Pas d'autres fonds de couleur.
- La couleur de marque ne sert que pour les titres et le filet de la page de garde.
- Pas de procès-verbal ni de formulaire administratif en fin de document.
- Français simple, phrases courtes, termes du métier.

## Fichier de métadonnées docs/recette-meta.json

    {
      "title": "Cahier de Recette",
      "platform": "Nom officiel de la plateforme",
      "environment": "Staging",
      "url": "https://...",
      "version": "1.0",
      "date": "25/10/2026",
      "author": "Nom du rédacteur",
      "logo": "chemin/vers/logo.png",
      "primary_color": "#1E293B",
      "accent_color": "#1E293B"
    }

logo : PNG ou JPG (Word ne lit pas le SVG). primary_color : couleur de marque extraite par
extract_brand.py, utilisée pour les titres.

## Sortie Word

- Paysage A4, marges 1,5 cm, Calibri 10.
- Page de garde (logo, titre, plateforme, environnement, URL, version, date).
- Sommaire automatique paginé (modules et sections) juste après la page de garde. Word le remplit à
  l'ouverture : accepter « Mettre à jour les champs ». Option --no-toc pour s'en passer.
- En-tête (plateforme, version) et pied de page (environnement, URL, page X / Y) sur toutes les pages sauf la garde.
- Lignes de tableau insécables, en-tête de tableau répété à chaque page.
- Cases à cocher ☐ lisibles à l'impression.

## Document BUGS_ET_AMELIORATIONS.docx

Généré par scripts/make_bugs_doc.py : titre, consigne de remplissage, légende des sévérités,
tableau de lignes vierges (N°, Réf. du test, Module, Description, Étapes pour reproduire,
Attendu / Obtenu, Type et sévérité à cocher, Capture d'écran en grande cellule, Statut).

## Rapport d'audit docs/AUDIT-RECETTE.md

Utiliser assets/audit-template.md. C'est le document de la Phase 2 : il garde la trace des
sources qui justifient le cahier. Il n'est pas converti en Word sauf demande.
